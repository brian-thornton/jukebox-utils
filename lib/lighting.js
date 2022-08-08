const WLEDAdapter = require('../adapters/lighting/wled-adapter');

class Lighting {
  constructor() {
    this.lightingAdapter = new WLEDAdapter();
  }

  async discover () {
    const resp = await this.lightingAdapter.discover();
    console.log(resp);
    return resp;
  }

  async createSegment (ip, start, stop) {
    const resp = await this.lightingAdapter.createSegment(ip, start, stop);
    console.log(resp);
    return resp;
  };

  async removeSegment (ip, start, stop) {
    const resp = await this.lightingAdapter.removeSegment(ip, start, stop);
    console.log(resp);
    return resp;
  };

  async getStatus (ip) {
    const resp = await this.lightingAdapter.getStatus(ip);
    console.log(resp);
    console.log(resp.state.seg[0]);
    return resp;
  }

  async powerOn (ip) {
    const resp = await this.lightingAdapter.powerOn(ip);
    console.log(resp);
    return resp;
  }

  async powerOff (ip) {
    const resp = await this.lightingAdapter.powerOff(ip);
    console.log(resp);
    return resp;
  }

  async setEffect (ip, effect, palette, start, stop) {
    const resp = await this.lightingAdapter.setEffect(ip, effect, palette, start, stop);
    console.log(resp);
    return resp;
  }

  async demoEffect (ip, effect, palette, start, stop) {
    const resp = await this.lightingAdapter.demoEffect(ip, effect, palette, start, stop);
    console.log(resp);
    return resp;
  }

  async setSolidColor (ip, rgbColor, start, stop) {
    const resp = await this.lightingAdapter.setSolidColor(ip, rgbColor, start, stop);
    console.log(resp);
    return resp;
  }

  async applyEventSegments (ip, eventSegments) {
    const resp = await this.lightingAdapter.applyEventSegments(ip, eventSegments);
    console.log(resp);
    return resp;
  }
}

module.exports = Lighting;
