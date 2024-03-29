const WLEDAdapter = require('../adapters/lighting/wled-adapter');

const lighting = new WLEDAdapter();

const discover = async () => await lighting.discover();
const getStatus = async (ip) => await lighting.getStatus(ip);
const getPresets = async (ip) => await lighting.getPresets(ip);
const applyPreset = async (ip, name) => await lighting.applyPreset(ip, name);
const powerOn = async (ip) => await lighting.powerOn(ip);
const powerOff = async (ip) => await lighting.powerOff(ip);
const createSegment = async (ip, start, stop) => await lighting.createSegment(ip, start, stop);
const removeSegment = async (ip, start, stop) => await lighting.removeSegment(ip, start, stop);
const reset = async(ip) => {
  await lighting.reset(ip);
}

const setEffect = async (ip, effect, palette, start, stop) => {
  return await lighting.setEffect(ip, effect, palette, start, stop);
};

const demoEffect = async (ip, effect, palette, start, stop, speed, brightness) => {
  return await lighting.demoEffect(ip, effect, palette, start, stop, speed, brightness);
};

const setSolidColor = async (ip, rgbColor, start, stop) => {
  return await lighting.setSolidColor(ip, rgbColor, start, stop);
};

const applyEventSegments = async (ip, eventSegments) => {
  return await lighting.applyEventSegments(ip, eventSegments);
};

module.exports = {
  applyEventSegments,
  applyPreset,
  createSegment,
  demoEffect,
  discover,
  getPresets,
  getStatus,
  powerOff,
  powerOn,
  removeSegment,
  setEffect,
  setSolidColor,
  reset,
};
