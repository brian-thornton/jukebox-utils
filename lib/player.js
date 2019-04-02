const OSXPlayerAdapter = require('../adapters/audio/osx-player-adapter');

class Player {
  constructor() {
    this.playerAdapter = OSXPlayerAdapter;
  }

  play(track) {
    this.playerAdapter.play(track);
  }
}
module.exports = Player;
