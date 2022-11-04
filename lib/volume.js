const OSXVolumeAdapter = require('../adapters/audio/osx-volume-adapter');

const volumeAdapter = OSXVolumeAdapter;

const getVolume = () => volumeAdapter.getVolume();
const isMuted = () => volumeAdapter.isMuted();
const increaseVolume = () => volumeAdapter.increaseVolume();
const decreaseVolume = () => volumeAdapter.decreaseVolume();
const toggleMute = () => volumeAdapter.toggleMute();

module.exports = {
  decreaseVolume,
  getVolume,
  increaseVolume,
  isMuted,
  toggleMute,
};
