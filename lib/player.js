const OSXPlayerAdapter = require('../adapters/audio/osx-player-adapter');

class Player {
  constructor() {
    this.playerAdapter = new OSXPlayerAdapter();
  }

  play(track) {
    this.playerAdapter.play(track);
  }

  stop() {
    this.playerAdapter.stop();
  }
}
module.exports = Player;
