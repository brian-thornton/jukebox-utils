const fetch = require('node-fetch');
const find = require('local-devices');

class WLEDAdapter {
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
    } catch {
      return null;
    }
  };

  async getStatus(ip) {
    const response = await this.getData(`http://${ip}/json`, { timeout: 400 });
    return response;
  };

  async discover() {
    console.log('Finding devices on local network...');
    const networkDevices = await find();
    const wledDevices = [];
    console.log('Checking for WLED...');
    for (const device of networkDevices) {
      try {
        console.log(`Checking ${device.ip}`);
        const response = await this.getStatus(device.ip);
        if (response.state) {
          wledDevices.push(device);
        }
      } catch (err) {
        // Do nothing. Move on.
      }
    }

    console.log('WLED Checking complete.');
    return wledDevices;
  };

  async createSegment(ip, start, stop) {
    const status = await this.getStatus(ip);

    const newSegment = {
      "id": Math.max.apply(Math, status.state.seg.map(function(o) { return o.id; })) + 1,
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

    if (status.state.seg.length > 1) {
      const deleteTarget = status.state.seg.find((s) => s.start.toString() === start && s.stop.toString() === stop);
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
    console.log(`Powering on ${ip}...`);
    const response = await this.post(`http://${ip}/json/state`, { "on": true, "bri": 255 });
    console.log(response);
    return response;
  };

  async powerOff(ip) {
    console.log(`Powering off ${ip}...`);
    const response = await this.post(`http://${ip}/json/state`, { "on": false, "bri": 255 });
    console.log(response);
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

    console.log(response);
    return response;
  };

  async demoEffect(ip, effect, palette, start, end) {
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
    segment.bri = 255;

    const response = await this.post(`http://${ip}/json/state`, {
      "on": true, "bri": 255, "seg": status.state.seg
    });

    console.log(response);
    return response;
  };

  async applyEventSegments(ip, eventSegments) {
    const status = await this.getData(`http://${ip}/json`);

    // First shut down segments that do not apply to this event.
    status.state.seg.map((s) => {
      s.off = true;
      s.on = false;
      s.bri = 0;
    });

    for (const eventSegment of eventSegments) {
      const segment = status.state.seg.find((s) => s.start.toString() === eventSegment.start.toString() && s.stop.toString() === eventSegment.stop.toString());
      const fxPosition = status.effects.indexOf(eventSegment.effect);
      const palettePosition = status.palettes.indexOf(eventSegment.palette);
      segment.fx = fxPosition || 0;
      segment.pal = palettePosition || 0;
      segment.on = true;
      segment.bri = 255;
    }

    const response = await this.post(`http://${ip}/json/state`, {
      "on": true, "bri": 255, "seg": status.state.seg
    });

    return response;
  };
}

module.exports = WLEDAdapter;