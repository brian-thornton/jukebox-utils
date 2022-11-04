const queue = require('./queue');
const dataAccess = require('./data-access');

const playlistStore = 'playlist';

const createPlaylist = (id, name, tracks = []) => {
  const playlist = {
    id,
    name,
    tracks,
  };

  dataAccess.write(playlistStore, name, playlist);
};

const getPlaylist = (name) => dataAccess.get(playlistStore, name);

const addToPlaylist = (name, tracks) => {
  const playlist = getPlaylist(name);
  playlist.tracks = playlist.tracks.concat(tracks);
  dataAccess.write(playlistStore, name, playlist);
};

const removeFromPlaylist = (name, tracks) => {
  const playlist = getPlaylist(name);
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
    dataAccess.write(playlistStore, name, playlist);
  });
};

const addTrackAtPosition = (name, track, position) => {
  const playlist = getPlaylist(name);
  playlist.tracks.splice(position, 0, track);
  dataAccess.write(playlistStore, name, playlist);
};

const getAllPlaylists = (start, limit) => {
  const playlists = dataAccess.getAll(playlistStore);

  return {
    playlists: start >= 0 && limit ? playlists.slice(start, limit) : playlists,
    totalPlaylists: playlists.length,
  };
};

const enqueuePlaylist = (name) => {
  const playlist = getPlaylist(playlistStore, name);
  queue.enqueueTracks(playlist.tracks);
};

const deletePlaylist = (name) => dataAccess.remove('playlist', name);

module.exports = {
  addToPlaylist,
  addTrackAtPosition,
  createPlaylist,
  deletePlaylist,
  enqueuePlaylist,
  getAllPlaylists,
  getPlaylist,
  removeFromPlaylist,
};
