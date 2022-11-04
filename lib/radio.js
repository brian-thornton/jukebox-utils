const RadioBrowser = require('radio-browser');

const Player = require('../adapters/audio/vlc-adapter');

const player = new Player();

const getStations = async (category = 'rock', start = 0, limit = 10) => {
  const filter = {
    offset: parseInt(start, 10),
    limit: parseInt(limit, 10),
    by: 'tag',
    searchterm: category.toLocaleLowerCase(),
    countrycode: 'US',
  };

  const data = await RadioBrowser.getStations(filter);
  return data;
};

const play = (url) => player.play(url);
const stop = () => player.stop();
const status = async () => await player.status();

module.exports = {
  getStations,
  play,
  status,
  stop,
};
