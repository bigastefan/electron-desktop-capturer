import {Component, OnInit} from '@angular/core';
import { BetterSimplePeer } from '../better-simple-peer';
import { getUserMedia } from '../media-helpers';
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import { getDesktopMediaStream } from '../../stream-util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  outgoing: string;
  desktopStream: any = null;
  stream: MediaStream;
  newPeer: BetterSimplePeer;
  selectedSource: String;
  sources: DesktopCapturerSource[];

  peers: BetterSimplePeer[] = [];
  tracks: MediaStreamTrack[] = [];

  ngOnInit(): void {
    // this.createConnection();
  }

  createConnection(): void {
    this.peers.push(this.createPeer(true));
    console.log(this.peers);
  }

  private createPeer(isInitiator) {
    const peer = BetterSimplePeer.createInstance({
      initiator: isInitiator,
      onConnect: () => this.onConnect(),
      onError: (instance) => {
        console.log('onError called');
        this.peers = this.peers.filter(p => p !== instance);
        console.log({ peers: this.peers });
      }
    });

    peer.sdp$().subscribe(sdp => {
      console.log({ sdp });



      const newSdp = JSON.stringify(sdp);
      const newSdpOffer = {
        type: 'offer',
        sdp: newSdp
      };

      const offerString = JSON.stringify(newSdpOffer);


      this.peers.forEach(p => {
        if (p.isConnected && p.readyState) {
          p.sendMsg( offerString );
        }
      });
      this.outgoing = JSON.stringify(sdp);
    });

    if (this.stream) peer.addStream(this.stream);

    return peer;
  }

  onConnect() {
    console.log('connected');
    this.peers.forEach(peer => {
      peer.sendMsg('new connection is created');
    });
  }

  setAnswer(sdpValue: string, event) {
    if (!sdpValue) { return; }

    console.log('setting answer');
    event.preventDefault();
    const sdp = JSON.parse(sdpValue);
    this.peers.filter(p => !p.isConnected).forEach(p => {
      console.log('setting answer', p);
      p.setSdp(sdp)
    }); // for now
  }

  setOffer(sdpValue: string, event) {
    if (!sdpValue) { return; }

    this.peers.forEach(p => {
      if (p.isConnected && p.readyState) {
        p.sendMsg('send msg about new sdp' );
      }
    });

    event.preventDefault();
    const sdp = JSON.parse(sdpValue);
    const newPeer = this.createPeer(false);

    if (this.stream) {
      newPeer.addStream(this.stream);
    }

    newPeer.setSdp(sdp);
    this.peers.push(newPeer);
    this.peers.forEach(p => p.setSdp(sdp)); // for now
  }

  async turnOnCamera() {
    const stream = await getUserMedia({ audio: true, video: true });
    console.log('turned on');
    console.log({ stream });
    this.stream = stream;
    this.tracks.push(stream);

    this.peers.forEach(peer => {
      peer.addStream(stream);
    });

  }

  async desktopCapturing(newSource?: string) {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    this.sources = sources;
  }

  async selectSource(sourceId) {
    const stream = await getDesktopMediaStream(sourceId);
    console.log(stream);
    stream.getVideoTracks().forEach(t => this.stream.addTrack(t));
    this.tracks = this.stream.getVideoTracks().map(t => {
      const ms = new MediaStream();
      ms.addTrack(t);
      return ms as any;
    });
    console.log({ tracks: this.tracks });

  }

  send() {
    this.peers.forEach(peer => {
      peer.sendMsg('send msg about new sdp');
    });
  }

  testMsg() {
    this.peers[0].sendMsg('test msg');
  }
}
