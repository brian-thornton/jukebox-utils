const WLEDAdapter = require('../adapters/lighting/wled-adapter');

const lighting = new WLEDAdapter();

const discover = async () => await lighting.discover();
const getStatus = async (ip) => await lighting.getStatus(ip);
const powerOn = async (ip) => await lighting.powerOn(ip);
const powerOff = async (ip) => await lighting.powerOff(ip);
const createSegment = async (ip, start, stop) => await lighting.createSegment(ip, start, stop);
const removeSegment = async (ip, start, stop) => await lighting.removeSegment(ip, start, stop);

const setEffect = async (ip, effect, palette, start, stop) => {
  return await lighting.setEffect(ip, effect, palette, start, stop);
};

const demoEffect = async (ip, effect, palette, start, stop) => {
  return await lighting.demoEffect(ip, effect, palette, start, stop);
};

const setSolidColor = async (ip, rgbColor, start, stop) => {
  return await lighting.setSolidColor(ip, rgbColor, start, stop);
};

const applyEventSegments = async (ip, eventSegments) => {
  return await lighting.applyEventSegments(ip, eventSegments);
};

module.exports = {
  applyEventSegments,
  createSegment,
  demoEffect,
  discover,
  getStatus,
  powerOff,
  powerOn,
  removeSegment,
  setEffect,
  setSolidColor,
};
