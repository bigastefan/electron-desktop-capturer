import { fromEvent, Observable } from 'rxjs';

import SimplePeer from 'simple-peer';

export class BetterSimplePeer {
  peer;

  constructor(initiator?: boolean) {
    this.peer = new SimplePeer({
      initiator,
      trickle: false
    });
  }
  sendMsg(sdp) {
    this.peer.send(sdp);
  }

  setSdp(sdp) {
    this.peer.signal(sdp);
  }

  sdp$(): Observable<{ type: string, sdp: string }> {
    return fromEvent(this.peer, 'signal');
  }

  tracks$() {
    return fromEvent(this.peer, 'tracks');
  }

  stream$(): Observable<MediaStream> {
    return fromEvent(this.peer, 'stream');
  }

  error$() {
    return fromEvent(this.peer, 'error');
  }

  connect$() {
    return fromEvent(this.peer, 'connect');
  }

  addStream(stream: MediaStream) {
    this.peer.addStream(stream);
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream) {
    this.peer.addStream(track, stream);
  }

  removeStream(stream: MediaStream) {
    this.peer.removeStream(stream);
  }

  removeTrack(track: MediaStreamTrack, stream: MediaStream) {
    this.peer.removeTrack(track, stream);
  }
}
