const VLC = require('../adapters/audio/vlc-adapter');

const vlc = new VLC();

const play = (track) => {
    vlc.play(track.path);
};

const stop = (token) => {
    vlc.stop();
};

const isPlaying = async () => {
  const status = await vlc.status();
  return status.state === 'playing';
};

module.exports = {
  isPlaying,
  play,
  stop,
};
