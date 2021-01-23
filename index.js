const DataAccess = require('./lib/data-access');
const Librarian = require('./lib/librarian');
const Player = require('./lib/player');
const Volume = require('./lib/volume');
const Queue = require('./lib/queue');
const ListKeeper = require('./lib/list-keeper');
const Spotify = require('./lib/spotify');
const Settings = require('./lib/settings');
const Status = require('./lib/status');
const StyleManager = require('./lib/style-manager');

module.exports = {
  DataAccess: DataAccess,
  Librarian: Librarian,
  player: Player,
  volume: Volume,
  queue: Queue,
  listKeeper: ListKeeper,
  spotify: Spotify,
  settings: Settings,
  status: Status,
  styleManager: StyleManager,
};

