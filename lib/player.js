const OSXPlayerAdapter = require('../adapters/audio/osx-player-adapter');

class Player {
  constructor() {
    this.playerAdapter = new OSXPlayerAdapter();
  }

  play(track) {
    this.playerAdapter.play(track.path);
  }

  stop() {
    this.playerAdapter.stop();
  }

  isPlaying() {
    return this.playerAdapter.isPlaying();
  }
}
module.exports = Player;
