import { fromEvent, Observable } from 'rxjs';

import SimplePeer from 'simple-peer';

export class BetterSimplePeer {
  peer;
  remoteStream: MediaStream;

  static createInstance(options: {
    initiator: boolean,
    onConnect: (instance: BetterSimplePeer) => void,
    onError: (instance: BetterSimplePeer) => void
  }) {
    const { initiator, onConnect, onError } = options;
    const instance = new BetterSimplePeer(initiator);

    instance.connect$().subscribe(() => onConnect(instance));
    instance.error$().subscribe(() => onError(instance));
    instance.stream$().subscribe(stream => instance.remoteStream = stream);

    return instance;
  }

  private constructor(initiator?: boolean) {
    this.peer = new SimplePeer({
      initiator,
      trickle: false
    });
  }

  sendMsg() {
    this.peer.send('test');
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
