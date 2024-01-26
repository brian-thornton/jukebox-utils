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

const modifyPlaylist = (name, modifier) => {
  const playlist = getPlaylist(name);
  modifier(playlist);
  dataAccess.write(playlistStore, name, playlist);
};


const getPlaylist = (name) => dataAccess.get(playlistStore, name);

const addToPlaylist = (name, tracks) => {
  modifyPlaylist(name, playlist => {
    playlist.tracks = playlist.tracks.concat(tracks);
  });
};

const removeFromPlaylist = (name, tracksToRemove) => {
  const tracksToRemovePaths = tracksToRemove.map(track => track.path);
  
  modifyPlaylist(name, playlist => {
    playlist.tracks = playlist.tracks.filter(track => !tracksToRemovePaths.includes(track.path));
  });
};

const addTrackAtPosition = (name, track, position) => {
  modifyPlaylist(name, playlist => {
    playlist.tracks.splice(position, 0, track);
  });
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
