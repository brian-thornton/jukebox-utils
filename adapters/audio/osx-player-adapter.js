const audioAdapter = require('play-sound')({});

class OSXPlayerAdapter {
  constructor() {
    this.audio = {};
  }

  play(track) {
    this.audio = audioAdapter.play(track);
  }

  stop() {
    this.audio.kill();
  }
}
module.exports = OSXPlayerAdapter;
