const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('request');

const dataAccess = require('./data-access');
const scanner = require('./scanner');
const log = require('./log');
const { off } = require('process');

const ScanStatus = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETE: 'complete',
  ERROR: 'error',
});
const { logInfo, logWarning } = log;
const getAll = () => dataAccess.getAll('library');
const remove = (library) => dataAccess.remove('library', library.name);
const get = (name) => dataAccess.get('library', name);
const create = (library) => dataAccess.write('library', library.name, library);

const getByCategory = (category) => {
  console.log(`get by category ${category}`)
  libraries = getAll();

  return libraries.filter((lib) => lib.category === category);
};

const add = (library) => {
  const newLibrary = library;
  newLibrary.enabled = true;
  newLibrary.name = `${library.path.split('/').pop()}_${crypto.randomUUID()}`;
  newLibrary.scanStatus = ScanStatus.PENDING;
  newLibrary.albums = library.albums || [];
  newLibrary.tracks = library.tracks || [];
  dataAccess.write('library', newLibrary.name, newLibrary);
};

const updateLibrary = (name, enabled) => {
  const library = get(name);
  library.enabled = enabled;
  dataAccess.write('library', name, library);
};

const sortByNameAsc = (items, getPath) => {
  return items.sort((x, y) => {
    const xName = path.basename(getPath(x));
    const yName = path.basename(getPath(y));

    if (xName < yName) {
      return -1;
    }
    if (xName > yName) {
      return 1;
    }
    return 0;
  });
};

const disable = (name) => updateLibrary(name, false);
const enable = (name) => updateLibrary(name, true);
const scan = async (library) => await scanner.scan(library);
const sortAlbumNameAsc = (albums) => sortByNameAsc(albums, album => album.path);
const sortTrackNameAsc = (tracks) => sortByNameAsc(tracks, track => track.path);
const sortFileNameAsc = (tracks) => sortByNameAsc(tracks, track => track);

const getTracks = (start, limit) => {
  const libraries = dataAccess.getAll('library');
  const tracks = libraries.reduce((allTracks, library) => allTracks.concat(library.tracks), []);
  const sortedTracks = sortFileNameAsc(tracks);
  let limitedTracks;

  if (limit) {
    limitedTracks = sortedTracks.slice(parseInt(start), parseInt(limit));
  } else {
    limitedTracks = sortedTracks;
  }

  return {
    tracks: limitedTracks.map(track => ({
      name: path.basename(track),
      path: track,
    })),
    totalTracks: sortedTracks.length,
  };
};

const getAlbumTracks = (albumPath) => {
  const libraries = dataAccess.getAll('library');
  const tracks = libraries.reduce((allTracks, library) => allTracks.concat(library.tracks), []);
  const filter = albumPath.toLowerCase();

  return tracks
    .filter(track => track.toLowerCase().includes(filter))
    .map(track => ({
      name: path.basename(track),
      path: track,
    }));
};

const getTrackAlbums = (tracks) => {
  const libraries = getAll();
  return tracks.reduce((albums, track) => {
    if (typeof track.path === 'string') {
      const albumPath = path.dirname(track.path);
      const libraryPath = path.dirname(albumPath);
      const albumLibrary = libraries.find((l) => l.path === libraryPath);

      if (albumLibrary && albumLibrary.albums) {
        const album = albumLibrary.albums.find((a) => a.path === albumPath);
        if (album) albums.push(album);
      }
    }
    return albums;
  }, []);
};

const getAlbums = (start, limit, category, filters = [], restriction, genre, offlineLibraries = 'true') => {
  let libraries = dataAccess.getAll('library');
  let albums = [];

  if (offlineLibraries !== 'true') {
    libraries = libraries.filter((l) => l.enabled);
  }

  libraries.forEach((library) => {
    if (category && library.category && category === library.category) {
      albums = albums.concat(library.albums);
    } else if (filters.includes(library.path)) {
      albums = albums.concat(library.albums);
    } else if (!category && !filters.length) {
      albums = albums.concat(library.albums);
    }
  });

  if (restriction) {
    const restrictionGroup = dataAccess.get('content_restrictions', restriction);

    if (restrictionGroup.type === 'blacklist') {
      albums = albums.filter((a) => !restrictionGroup.content.includes(a.path));
    } else if (restrictionGroup.type === 'whitelist') {
      albums = albums.filter((a) => restrictionGroup.content.includes(a.path));
    }
  }

  if (genre) {
    albums = albums.filter((a) => a.genres?.includes(genre));
  }

  albums = sortAlbumNameAsc(albums);

  return {
    albums: start >= 0 && limit ? albums.slice(start, limit) : albums,
    totalAlbums: albums.length,
  };
};

const searchTracks = (query, start, limit) => {
  const data = getTracks();
  const filterTracks = data.tracks.filter(track => (
    track.path.toLowerCase().includes(query.toLowerCase())
  ));

  const unpagedResult = sortTrackNameAsc(filterTracks);

  return {
    tracks: start >= 0 && limit ? unpagedResult.slice(start, limit) : unpagedResult,
    totalTracks: unpagedResult.length,
  };
};

const searchAlbums = (query, start, limit, startsWithFilter) => {
  const data = getAlbums();
  const text = query.toLowerCase();
  let filterAlbums;

  const name = (album) => album.name.toLowerCase();

  if (query !== 'undefined' && !startsWithFilter) {
    filterAlbums = data.albums.filter((album) => name(album).includes(text));
  } else if (query === 'undefined' && startsWithFilter) {
    filterAlbums = data.albums.filter((album) => name(album).charAt(0) === startsWithFilter.toLowerCase());
  } else if (query !== 'undefined' && startsWithFilter) {
    filterAlbums = data.albums.filter((album) => name(album).includes(text));
    filterAlbums = filterAlbums.filter((album) => name(album).charAt(0) === startsWithFilter.toLowerCase());
  }

  return {
    albums: start >= 0 && limit ? filterAlbums.slice(start, limit) : filterAlbums,
    totalAlbums: filterAlbums.length,
  };
};

const countTracks = (album, tracks) => {
  return tracks.filter(track => path.dirname(track) === album).length;
};

const totalTracks = (folder) => {
  return folder.albums.reduce((a, b) => a + b.trackCount, 0);
};

const getDirs = (p) => {
  const dirs = [];
  const files = fs.readdirSync(p);

  files.forEach((file) => {
    if (fs.lstatSync(path.join(p, file)).isDirectory()) {
      dirs.push(path.join(p, file));
    }
  });

  return dirs;
};

const discover = (p) => {
  const rootDirs = getDirs(p);
  return rootDirs;
};

const download = (url, filename) => {
  request(url).pipe(fs.createWriteStream(filename));
};

const saveCoverArt = (cover) => {
  try {
    if (fs.existsSync(cover.album.path)) {
      logInfo(`Saving cover art for ${cover.album.path}`);
      download(cover.url, path.join(cover.album.path, 'folder.jpg'));
    }
  } catch (error) {
    logWarning('Warning: Cover Art Save Failed.');
  }
};

const removeCoverArt = (album) => {
  logInfo(`Removing cover art for ${album.path}`);
  fs.unlinkSync(path.join(album.path, 'folder.jpg'));
};

module.exports = {
  add,
  countTracks,
  create,
  disable,
  discover,
  download,
  enable,
  get,
  getAlbums,
  getAlbumTracks,
  getAll,
  getByCategory,
  getDirs,
  getTrackAlbums,
  getTracks,
  remove,
  removeCoverArt,
  saveCoverArt,
  scan,
  searchAlbums,
  searchTracks,
  sortFileNameAsc,
  sortTrackNameAsc,
  totalTracks,
};
