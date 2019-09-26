import { Component } from '@angular/core';
import { BetterSimplePeer } from '../better-simple-peer';
import { getUserMedia } from '../media-helpers';
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import { getDesktopMediaStream } from '../../stream-util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  outgoing: string;
  desktopStream: any = null;
  stream: MediaStream;
  // remoteStream: MediaStream;
  // peer: BetterSimplePeer;
  newPeer: BetterSimplePeer;
  selectedSource: String;
  sources: DesktopCapturerSource[];

  peers: BetterSimplePeer[] = [];

  createConnection(): void {
    this.peers.push(this.createPeer(true));
  }

  private createPeer(isInitiator) {
    const peer = BetterSimplePeer.createInstance({
      initiator: isInitiator,
      onConnect: () => console.log('connected')
    });

    peer.sdp$().subscribe(sdp => {
      console.log({ sdp });
      this.outgoing = JSON.stringify(sdp);
    });

    peer.error$().subscribe(error => console.log({ error }));
    peer.tracks$().subscribe(trackData => console.log({ trackData }));

    if (this.stream) peer.addStream(this.stream);

    return peer;
  }

  setAnswer(sdpValue: string, event) {
    if (!sdpValue) { return; }

    console.log('setting answer');
    event.preventDefault();
    const sdp = JSON.parse(sdpValue);
    this.peers.forEach(p => p.setSdp(sdp)); // for now
  }

  setOffer(sdpValue: string, event) {
    if (!sdpValue) { return; }

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

  send() {
    // this.p.send(this.msg);
    // this.msg = '';
  }

  async turnOnCamera() {
    const stream = await getUserMedia({ audio: true, video: true });
    console.log('turned on');
    console.log({ stream });
    this.stream = stream;
  }

  turnOfCamera() {
    // this.myVideo.nativeElement.srcObject = null;
  }

  // async addStreamToConnection() {
  //   const newPeer = this.createPeer(true);
  //   newPeer.addStream(this.stream);
  //   this.peer = newPeer;
  // }

  // async removeStreamFromConnection() {
  //   this.peer.removeStream(this.stream);
  // }

  async desktopCapturing(newSource?: string) {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    this.sources = sources;
  }

  async selectSource(sourceId) {
    const stream = await getDesktopMediaStream(sourceId);
    console.log(stream);
    this.stream = stream;
  }
}
