const Queue = require('./queue');
const DataAccess = require('./data-access');

class ListKeeper {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.queue = new Queue(options);
    this.playlistStore = 'playlist';
  }

  createPlaylist(name, tracks = []) {
    const playlist = {
      name,
      tracks,
    };

    this.dataAccess.write(this.playlistStore, name, playlist);
  }

  getPlaylist(name) {
    return this.dataAccess.get(this.playlistStore, name);
  }

  addToPlaylist(name, tracks) {
    const playlist = this.getPlaylist(name);
    playlist.tracks = playlist.tracks.concat(tracks);
    this.dataAccess.write(this.playlistStore, name, playlist);
  }

  getAllPlaylists() {
    return this.dataAccess.getAll(this.playlistStore);
  }

  enqueuePlaylist(name) {
    const playlist = this.getPlaylist(this.playlistStore, name);
    this.queue.enqueueTracks(playlist.tracks);
  }
}

module.exports = ListKeeper;