const OSXPlayerAdapter = require('../adapters/audio/osx-player-adapter');
const Spotify = require('./spotify');

const spotify = new Spotify();

class Player {
  constructor() {
    this.playerAdapter = new OSXPlayerAdapter();
  }

  play(track) {
    if (track.id) {
      spotify.playTrack(track);
    } else {
      this.playerAdapter.play(track.path);
    }
  }

  stop(token) {
    if (token) {
      spotify.stopPlayback(token);
    } else {
      this.playerAdapter.stop();
    }
  }

  isPlaying() {
    return this.playerAdapter.isPlaying();
  }
}
module.exports = Player;
