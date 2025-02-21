import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {WebrtcService} from '../../services/webrtc.service';
import {ContactsService} from '../../services/contacts.service';

@Component({
  selector: 'app-data-display',
  imports: [],
  standalone: true,
  templateUrl: './data-display.component.html',
  styleUrl: './data-display.component.scss'
})
export class DataDisplayComponent implements OnInit{
  contacts: any[] = [];
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  localStream: MediaStream = {} as MediaStream;
  isMicMuted = false;
  isCameraOff = false;

  constructor(private contactsService: ContactsService,
              private afAuth: AngularFireAuth,
              private router: Router,
              private webrtcService: WebrtcService) {}

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }



  ngOnInit(): void {
    this.contactsService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
    });

    this.webrtcService.getSignalingData().subscribe((data) => {
      if (data.type === 'offer') {
        this.webrtcService.handleOffer(data.offer);
      } else if (data.type === 'answer') {
        this.webrtcService.handleAnswer(data.answer);
      } else if (data.type === 'candidate') {
        this.webrtcService.handleCandidate(data.candidate);
      }
    });
  }

  async startCall(contactUserId: string) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;

    // Fetch the contact's connection details
    this.contactsService.getContacts().subscribe((contacts) => {
      const contact = contacts.find((c: { userId: string; }) => c.userId === contactUserId);
      if (contact) {
        const iceServers = contact.connectionDetails.iceServers;

        // Initialize the peer connection
        const peerConnection = this.webrtcService.initializePeerConnection(iceServers);

        // Add local stream to the peer connection
        if (this.localStream){
          this.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, this.localStream);
          });
        }

        peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            this.remoteVideo.nativeElement.srcObject = event.streams[0];
          }
        };

        // Create an offer
        this.webrtcService.createOffer();
      }
    });
  }

  // Toggle audio (mic)
  toggleMic() {
    this.isMicMuted = !this.isMicMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => (track.enabled = !this.isMicMuted));
    }
  }

  // Toggle video (camera)
  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => (track.enabled = !this.isCameraOff));

      // Update the local video element
      const localVideo = document.getElementById('local-video') as HTMLVideoElement;
      localVideo.srcObject = this.isCameraOff ? null : this.localStream;
    }
  }

}
