import express from 'express';
import {Request, Response} from 'express';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import * as fs from 'node:fs';
import path from 'node:path';
import * as https from 'node:https';
import dotenv from 'dotenv';
import {ServiceAccount} from 'firebase-admin';
import * as serviceAccount from '../firebase-admin-key.json';
dotenv.config();

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID,
// };

console.log(process.env);

if (process.env.FIREBASE_PRIVATE_KEY ) {
    const serviceAccountJson = JSON.parse(process.env.FIREBASE_PRIVATE_KEY as string);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson as ServiceAccount),
    });
} else {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
}



const db = admin.firestore();
const app = express();
const allowedOrigins = [
    process.env.CORS_URL,
    process.env.CORS_URL + ':443',
    'https://192.168.1.156',
    'https://192.168.1.156:443'
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
    })
);

app.use(express.json());
// Load SSL certificates
const options = {
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
};

// Create HTTPS server
const server = https.createServer(options, app);
const wss = new WebSocketServer({ server });

// Middleware to verify Firebase ID token
const verifyToken = async (idToken: string) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken.uid; // Return the user's Firebase UID
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return null;
    }
};


const data = {
    email: 'jonathan@email.com',
    name: 'Jonathan Quirke',
    userId: 2,
    connectionDetails: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ],
    },
};

// // Add a new document with a generated ID
// db.collection('contacts')
//     .add(data)
//     .then((docRef) => {
//         console.log('Document written with ID: ', docRef.id);
//     })
//     .catch((error) => {
//         console.error('Error adding document: ', error);
//     });

app.get('/data', async (req, res) => {
    try {
        const snapshot = await db.collection('contacts').get();
        const data = snapshot.docs.map((doc) => doc.data());
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});


wss.on('connection', (ws: any) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: { toString: () => string; }) => {
        const data = JSON.parse(message.toString());
        console.log('Received signaling data:', data);

        if (data.type === 'setUserId') {
            // Verify the Firebase ID token and set the userId
            const userId = await verifyToken(data.idToken);
            if (userId) {
                ws.userId = userId; // Attach the userId to the WebSocket object
                console.log(`User ${userId} connected`);
            } else {
                ws.close(); // Close the connection if the token is invalid
            }
        } else if (data.targetUserId) {
            // Send the message to the target user
            wss.clients.forEach((client: any) => {
                if (client.userId === data.targetUserId && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } else {
            // Broadcast to all clients (for testing purposes)
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log(`User ${ws.userId} disconnected`);
    });
});

// Endpoint to fetch user information and connection details
app.get('/user/:userId', async (req: Request, res: Response): Promise<any> => {
    const userId = req.params.userId;

    try {
        const userDoc = await db.collection('contacts').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userDoc.data();
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/contacts/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const contactsSnapshot = await db.collection('contacts').get();
        const contacts = contactsSnapshot.docs
            .map((doc) => doc.data())
            .filter((contact) => contact.userId !== userId); // Exclude the current user

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).send('Internal server error');
    }
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});