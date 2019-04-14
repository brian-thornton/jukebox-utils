const audioAdapter = require('play-sound')({});

class OSXPlayerAdapter {
  constructor() {
    this.audio = {};
  }

  play(track) {
    if (this.isPlaying()) {
      this.stop();
    }

    this.audio = audioAdapter.play(track);
  }

  stop() {
    this.audio.kill();
  }

  isPlaying() {
    if ('killed' in this.audio) {
      return !this.audio.killed;
    }
    return false;
  }
}
module.exports = OSXPlayerAdapter;
