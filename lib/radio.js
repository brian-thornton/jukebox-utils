const RadioBrowser = require('radio-browser');
const fetch = require('node-fetch');
const Player = require('../adapters/audio/vlc-adapter');
const player = new Player();

class Radio {
  constructor() {

  }

  async getStations(category = 'rock', start = 0, limit = 10) {
    let filter = {
      offset: parseInt(start),
      limit: parseInt(limit),
      by: 'tag',
      searchterm: category.toLocaleLowerCase(),
      countrycode: 'US',
    }

    const data = await RadioBrowser.getStations(filter);
    return data;
  };

  play(url) {
    player.play(url);
  };

  stop() {
    player.stop();
  };

  async status() {
    return await player.status();
  }  
}
module.exports = Radio;
