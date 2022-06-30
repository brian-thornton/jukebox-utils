const Queue = require('./queue');
const DataAccess = require('./data-access');

class ListKeeper {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.queue = new Queue(options);
    this.playlistStore = 'playlist';
  }

  createPlaylist(id, name, tracks = []) {
    const playlist = {
      id,
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

  removeFromPlaylist(name, tracks) {
    const playlist = this.getPlaylist(name);
    const updatedTracks = [];
    playlist.tracks.forEach((track) => {
      let found = false;
      tracks.forEach((deleteTrack) => {
        if (track.path === deleteTrack.path) {
          found = true;
        }
      });

      if (!found) {
        updatedTracks.push(track);
      }
      playlist.tracks = updatedTracks;
      this.dataAccess.write(this.playlistStore, name, playlist);
    });
  }

  addTrackAtPosition(name, track, position) {
    const playlist = this.getPlaylist(name);
    playlist.tracks.splice(position, 0, track);
    this.dataAccess.write(this.playlistStore, name, playlist);
  }

  getAllPlaylists(start, limit) {
    const playlists = this.dataAccess.getAll(this.playlistStore);

    return {
      playlists: start >= 0 && limit ? playlists.slice(start, limit) : playlists,
      totalPlaylists: playlists.length,
    };
  }

  enqueuePlaylist(name) {
    const playlist = this.getPlaylist(this.playlistStore, name);
    this.queue.enqueueTracks(playlist.tracks);
  }

  deletePlaylist(name) {
    return this.dataAccess.remove('playlist', name);
  }
}

module.exports = ListKeeper;
