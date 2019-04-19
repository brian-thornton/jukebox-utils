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
    if ('exitCode' in this.audio) {
      return this.audio.exitCode == null;
    }
    return false;
  }
}
module.exports = OSXPlayerAdapter;
