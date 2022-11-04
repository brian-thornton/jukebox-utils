const Librarian = require('./lib/librarian');
const Lighting = require('./lib/lighting');
const Player = require('./lib/player');
const Volume = require('./lib/volume');
const Queue = require('./lib/queue');
const ListKeeper = require('./lib/list-keeper');
const Spotify = require('./lib/spotify');
const Settings = require('./lib/settings');
const Status = require('./lib/status');
const StyleManager = require('./lib/style-manager');
const Radio = require('./lib/radio');
const Log = require('./lib/log');

module.exports = {
  librarian: Librarian,
  player: Player,
  volume: Volume,
  queue: Queue,
  listKeeper: ListKeeper,
  spotify: Spotify,
  settings: Settings,
  status: Status,
  styleManager: StyleManager,
  lighting: Lighting,
  radio: Radio,
  log: Log,
};
