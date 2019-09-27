export const getDesktopMediaStream = async (sourceId: string) => {
  const streamDesktop: MediaStream = await (<any>navigator.mediaDevices).getUserMedia({
    audio: false,
    video:
    {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720
      }
    }
  });

  return streamDesktop;
};
