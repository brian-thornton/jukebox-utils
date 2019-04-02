const audioAdapter = require('play-sound')({});

class OSXPlayerAdapter {
  static play(track) {
    audioAdapter.play(track);
  }
}
module.exports = OSXPlayerAdapter;
