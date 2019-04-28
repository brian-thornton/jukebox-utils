const DataAccess = require('./lib/data-access');
const Librarian = require('./lib/librarian');
const Player = require('./lib/player');
const Volume = require('./lib/volume');
const Queue = require('./lib/queue');

module.exports = {
  dataAccess: DataAccess,
  librarian: Librarian,
  player: Player,
  volume: Volume,
  queue: Queue,
};

// lint
// ./node_modules/.bin/eslint
