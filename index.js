const DataAccess = require('./lib/data-access');
const Librarian = require('./lib/librarian');
const Player = require('./lib/player');
const Volume = require('./lib/volume');

module.exports = {
  dataAccess: DataAccess,
  librarian: Librarian,
  player: Player,
  volume: Volume,
};

// lint
// ./node_modules/.bin/eslint
