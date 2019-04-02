const OSXVolumeAdapter = require('../adapters/audio/osx-volume-adapter');

class Volume {
  constructor() {
    this.volumeAdapter = OSXVolumeAdapter;
  }

  getVolume() {
    return this.volumeAdapter.getVolume();
  }

  isMuted() {
    return this.volumeAdapter.isMuted();
  }

  increaseVolume() {
    this.volumeAdapter.increaseVolume();
  }

  decreaseVolume() {
    this.volumeAdapter.decreaseVolume();
  }

  toggleMute() {
    this.volumeAdapter.toggleMute();
  }
}
module.exports = Volume;
