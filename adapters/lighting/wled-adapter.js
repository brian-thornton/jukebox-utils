const fetch = require('node-fetch');
const find = require('local-devices');

const log = require('../../lib/log');

const { logInfo } = log;

class WLEDAdapter {
  async fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }

  postParams(body) {
    return {
      method: 'post',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify(body),
    };
  };

  async post(url, body) {
    const response = await fetch(url, this.postParams(body));
    try {
      const json = await response.json();
      return json;
    } catch {
      return null;
    }
  }

  async getData(url, options) {
    const response = await fetch(url, { ...options });
    try {
      const json = await response.json();
      return json;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  async getPresets(ip) {
    const response = await this.getData(`http://${ip}/edit?download=presets.json`, { timeout: 400 });
    return response;
  }

  async applyPreset(ip, name) {
    console.log(`Applying preset ${name} to ${ip}`);
    const data = await this.getData(`http://${ip}/edit?download=presets.json`, { timeout: 1000 });
    const preset = Object.keys(data).map((key) => data[key]).filter((p) => p.n).find((c) => c.n === name);
    console.log(preset);
    const response = await this.post(`http://${ip}/json/state`, preset);
    return response;
  }

  async getStatus(ip) {
    const response = await this.getData(`http://${ip}/json`, { timeout: 400 });
    return response;
  };

  async discover() {
    logInfo('Finding devices on local network...');
    const networkDevices = await find();
    const wledDevices = [];
    logInfo('Checking for WLED...');
    for (const device of networkDevices) {
      try {
        logInfo(`Checking ${device.ip}`);
        const response = await this.getStatus(device.ip);
        if (response.state) {
          wledDevices.push(device);
        }
      } catch (err) {
        // Do nothing. Move on.
      }
    }

    logInfo('WLED Checking complete.');
    return wledDevices;
  };

  async reset(ip) {
    console.log('in reset');
    const status = await this.getStatus(ip);

    for (const seg of status.state.seg) {
      console.log(`Removing segment from ${ip} start: ${seg.start} stop: ${seg.stop}`);
      await this.removeSegment(ip, seg.start, seg.stop);
    }
  };

  async createSegment(ip, start, stop) {
    const status = await this.getStatus(ip);

    const newSegment = {
      "id": Math.max.apply(Math, status.state.seg.map(function (o) { return o.id; })) + 1,
      "start": parseInt(start),
      "stop": parseInt(stop),
      "grp": 1,
      "spc": 0,
      "of": 0,
      "on": true,
      "bri": 255,
      "cct": 127,
      "col": [[232, 96, 4], [0, 0, 0], [0, 0, 0]],
      "fx": 0,
      "sx": 127,
      "ix": 127,
      "pal": 0,
      "sel": true,
      "rev": false,
      "mi": false
    };

    status.state.seg.push(newSegment);

    const response = await this.post(`http://${ip}/json/state`, {
      "seg": status.state.seg
    });

    return response;
  };

  async removeSegment(ip, start, stop) {
    const status = await this.getStatus(ip);
    console.log(status.state.seg)
    if (status.state.seg.length > 1) {
      console.log(start);
      console.log(stop);
      const deleteTarget = status.state.seg.find((s) => s.start.toString() === start.toString() && s.stop.toString() === stop.toString());
      deleteTarget.start = 10;
      deleteTarget.stop = 9;

      const response = await this.post(`http://${ip}/json/state`, {
        "seg": status.state.seg
      });

      return response;
    } else {
      // We are dealing with the last segment. It cannot be deleted.
      const deleteTarget = status.state.seg[0];
      deleteTarget.start = 0;
      deleteTarget.stop = 1;

      const response = await this.post(`http://${ip}/json/state`, {
        "seg": status.state.seg
      });

      return response;
    }
  };

  async powerOn(ip) {
    logInfo(`Powering on ${ip}...`);
    const response = await this.post(`http://${ip}/json/state`, { "on": true, "bri": 255 });
    return response;
  };

  async powerOff(ip) {
    logInfo(`Powering off ${ip}...`);
    const response = await this.post(`http://${ip}/json/state`, { "on": false, "bri": 255 });
    return response;
  };

  async setSolidColor(ip, rgbColor, start, stop) {
    const status = await this.getData(`http://${ip}/json`);
    const fxPosition = status.effects.indexOf('Solid');
    const segment = status.state.seg.find((s) => s.start.toString() === start.toString() && s.stop.toString() === stop.toString());
    segment.fx = fxPosition || 0;
    segment.col = [rgbColor.split(',').map((n) => parseInt(n))];

    const response = await this.post(`http://${ip}/json/state`, {
      "on": true, "bri": 255, "seg": status.state.seg
    });

    return response;
  };

  async setEffect(ip, effect, palette, start, end) {
    const status = await this.getData(`http://${ip}/json`);
    const fxPosition = status.effects.indexOf(effect);
    const palettePosition = status.palettes.indexOf(palette)
    const segment = status.state.seg.find((s) => s.start.toString() === start.toString() && s.stop.toString() === end.toString());
    segment.fx = fxPosition || 0;
    segment.pal = palettePosition || 0;

    const response = await this.post(`http://${ip}/json/state`, {
      "on": true, "bri": 255, "seg": status.state.seg
    });

    return response;
  };

  async demoEffect(ip, effect, palette, start, end, speed, brightness) {
    const status = await this.getData(`http://${ip}/json`);
    const fxPosition = status.effects.indexOf(effect);
    const palettePosition = status.palettes.indexOf(palette)

    // Shut down other segments so that we can focus a demo to the segment
    // under configuration.
    status.state.seg.map((s) => {
      s.off = true;
      s.on = false;
      s.bri = 0;
    })

    const segment = status.state.seg.find((s) => s.start.toString() === start.toString() && s.stop.toString() === end.toString());
    segment.fx = fxPosition || 0;
    segment.pal = palettePosition || 0;
    segment.on = true;
    segment.bri = parseInt(brightness, 10);
    segment.sx = parseInt(speed, 10);
    console.log(segment);

    const response = await this.post(`http://${ip}/json/state`, {
      "on": true, "seg": status.state.seg
    });

    return response;
  };

  async applyEventSegments(ip, eventSegments) {
    const status = await this.getData(`http://${ip}/json`);

    // First shut down segments that do not apply to this event.
    status?.state?.seg?.map((s) => {
      s.off = true;
      s.on = false;
      s.bri = 0;
    });

    if (status?.state?.seg?.length) {
      for (const eventSegment of eventSegments) {
        const segment = status.state.seg.find((s) => s.start.toString() === eventSegment.start.toString() && s.stop.toString() === eventSegment.stop.toString());
        const fxPosition = status.effects.indexOf(eventSegment.effect);
        const palettePosition = status.palettes.indexOf(eventSegment.palette);
        if (segment) {
          segment.fx = fxPosition || 0;
          segment.pal = palettePosition || 0;
          segment.on = true;
          segment.bri = 255;
        }
      }

      const response = await this.post(`http://${ip}/json/state`, {
        "on": true, "bri": 255, "seg": status.state.seg
      });

      return response;
    } else {
      throw new Error('Something went wrong');
    }
  };
}

module.exports = WLEDAdapter;