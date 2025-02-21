import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {config} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebrtcService {
  private ws: WebSocket;
  private peerConnection: RTCPeerConnection = {} as RTCPeerConnection;
  private signalingSubject = new Subject<any>();
  private wsUrl = config.wsUrl;

  constructor(private afAuth: AngularFireAuth) {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = async () => {
      // Get the Firebase ID token for the current user
      const user = await this.afAuth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        this.ws.send(JSON.stringify({ type: 'setUserId', idToken }));
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.signalingSubject.next(data);
    };
  }

  sendSignalingData(data: any, targetUserId?: string) {
    const message = { ...data, targetUserId };
    this.ws.send(JSON.stringify(message));
  }

  // Listen for signaling data
  getSignalingData(): Observable<any> {
    return this.signalingSubject.asObservable();
  }

  // Initialize WebRTC peer connection
  initializePeerConnection(iceServers: RTCIceServer[]): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({ iceServers });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingData({ type: 'candidate', candidate: event.candidate });
      }
    };
    return this.peerConnection;
  }

  // Create an offer for a WebRTC connection
  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.sendSignalingData({ type: 'offer', offer });
  }

  // Handle an incoming offer
  async handleOffer(offer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.sendSignalingData({ type: 'answer', answer });
  }

  // Handle an incoming answer
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(answer);
  }

  // Handle an incoming ICE candidate
  async handleCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
}
