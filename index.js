const DataAccess = require('./lib/data-access');
const Librarian = require('./lib/librarian');
const Player = require('./lib/player');
const Volume = require('./lib/volume');
const Queue = require('./lib/queue');
const ListKeeper = require('./lib/list-keeper');
const Spotify = require('./lib/spotify');

module.exports = {
  dataAccess: DataAccess,
  librarian: Librarian,
  player: Player,
  volume: Volume,
  queue: Queue,
  listKeeper: ListKeeper,
  spotify: Spotify
};

// lint
// ./node_modules/.bin/eslint
