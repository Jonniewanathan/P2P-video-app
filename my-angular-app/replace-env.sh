#!/bin/bash
# replace-env.sh
sed -i "s|\${FIREBASE_API_KEY}|${FIREBASE_API_KEY}|g" src/environments/environment.prod.ts
sed -i "s|\${FIREBASE_AUTH_DOMAIN}|${FIREBASE_AUTH_DOMAIN}|g" src/environments/environment.prod.ts
sed -i "s|\${FIREBASE_PROJECT_ID}|${FIREBASE_PROJECT_ID}|g" src/environments/environment.prod.ts
sed -i "s|\${FIREBASE_STORAGE_BUCKET}|${FIREBASE_STORAGE_BUCKET}|g" src/environments/environment.prod.ts
sed -i "s|\${FIREBASE_MESSAGING_SENDER_ID}|${FIREBASE_MESSAGING_SENDER_ID}|g" src/environments/environment.prod.ts
sed -i "s|\${FIREBASE_APP_ID}|${FIREBASE_APP_ID}|g" src/environments/environment.prod.ts
sed -i "s|\${API_URL}|${API_URL}|g" src/environments/environment.prod.ts
sed -i "s|\${WS_URL}|${WS_URL}|g" src/environments/environment.prod.ts
