import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { BetterSimplePeer } from '../better-simple-peer';
import { getUserMedia } from '../media-helpers';
import { desktopCapturer, DesktopCapturerSource } from 'electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  @ViewChild('desktopElement') desktopElement: ElementRef;
  outgoing: string;
  desktop: any = null;
  newPeerSdp: any = null;
  title = 'simple-peer-test';
  msg = 'test';
  stream: MediaStream;
  remoteStream: MediaStream;
  peer: BetterSimplePeer;
  newPeer: BetterSimplePeer;
  selectedSource: String;
  list: DesktopCapturerSource[];
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }

  createConnection(): void {
    const isInitiator = true;
    console.log({ isInitiator });

    if (!isInitiator) { return; }

    this.peer = this.createPeer(isInitiator);
  }

  setOutgoing(value: string) {
    this.outgoing = value;
  }

  private createPeer(isInitiator) {
    const peer = new BetterSimplePeer(isInitiator);
    peer.sdp$().subscribe(sdp => {
      console.log({ sdp });
      this.setOutgoing(JSON.stringify(sdp));
    });

    peer.error$().subscribe(error => console.log({ error }));
    peer.connect$().subscribe(connect => console.log({ connect }));
    peer.tracks$().subscribe(trackData => console.log({ trackData }));

    peer.stream$().subscribe(stream => {
      console.log({ stream });
      this.remoteStream = stream;
    });
    console.log(this.remoteStream);
    return peer;
  }

  newPeerConnection() {
    const isNewInitiator = true;

    const newPeer = new BetterSimplePeer(isNewInitiator);
    newPeer.sdp$().subscribe(sdp => {
      console.log('new sdp',{ sdp });
      this.newPeerSdp = sdp;
      this.setOutgoing(JSON.stringify(sdp));
    });

    newPeer.error$().subscribe(error => console.log({ error }));
    newPeer.connect$().subscribe(connect => console.log({ connect }));
    newPeer.tracks$().subscribe(trackData => console.log({ trackData }));

    newPeer.stream$().subscribe(stream => {
      console.log({ stream });
      this.remoteStream = stream;
    });
    // console.log(this.remoteStream);
    return newPeer;
  }

  setAnswer(sdpValue: string, event) {
    if (!sdpValue) { return; }

    console.log('setting answer');
    event.preventDefault();
    const sdp = JSON.parse(sdpValue);
    this.peer.setSdp(sdp);
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
    this.peer = newPeer;
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

  async addStreamToConnection() {
    // const newPeer = this.createPeer(true);
    // newPeer.addStream(this.stream);
    // this.peer = newPeer;

    const isNewInitiator = true;

    const newPeer = new BetterSimplePeer(isNewInitiator);
    newPeer.sdp$().subscribe(sdp => {
      console.log('new sdp',{ sdp });
      this.newPeerSdp = sdp;
      this.setOutgoing(JSON.stringify(sdp));
    });

    newPeer.error$().subscribe(error => console.log({ error }));
    newPeer.connect$().subscribe(connect => console.log({ connect }));
    newPeer.tracks$().subscribe(trackData => console.log({ trackData }));

    newPeer.stream$().subscribe(stream => {
      console.log({ stream });
      this.remoteStream = stream;
    });
    // console.log(this.remoteStream);
    this.newPeer = newPeer;
    this.peer.sendMsg(this.newPeerSdp);
    // return newPeer;

  }

  async removeStreamFromConnection() {
    this.peer.removeStream(this.stream);
  }

  addAudioTrack() {
    this.peer.addTrack(this.stream.getAudioTracks()[0], this.stream);
    this.newPeer = this.newPeerConnection();

  }

  addVideoTrack() {
    this.peer.addTrack(this.stream.getVideoTracks()[0], this.stream);
  }


  removeVideoTrack() {
    this.peer.removeTrack(this.stream.getVideoTracks()[0], this.stream);
  }

  async desktopCapturing(newSource?: string) {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
      this.list = sources;

      console.log(this.list);
      this.selectedSource = sources[0].name;
      for (const source of sources.filter(s => s.name === newSource)) {
          try {
            const streamDesktop = await (<any>navigator.mediaDevices).getUserMedia({
              audio: false,
              video:
              {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720
                }
              }
            });

            this.handleStream(streamDesktop);
          } catch (e) {
            console.log(e);
          }
          return;
      }
  }

  handleStream(stream: MediaStream) {
    console.log('desktop', stream);

    if (!this.stream) {
      this.stream = stream;
    } else {
      this.stream.getVideoTracks().forEach(t => this.stream.removeTrack(t));
      stream.getVideoTracks().forEach(t => this.stream.addTrack(t));
    }

    this.addStreamToConnection();
    this.desktopElement.nativeElement.srcObject = stream;
  }

}
