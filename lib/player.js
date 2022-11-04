const Spotify = require('./spotify');
const VLC = require('../adapters/audio/vlc-adapter');

const vlc = new VLC();
const spotify = new Spotify();

const play = (track) => {
  if (track.id) {
    spotify.playTrack(track);
  } else {
    vlc.play(track.path);
  }
};

const stop = (token) => {
  if (token) {
    spotify.stopPlayback(token);
  } else {
    vlc.stop();
  }
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
