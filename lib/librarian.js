const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('request');

const dataAccess = require('./data-access');
const scanner = require('./scanner');
const log = require('./log');

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
  libraries = getAll();
  return libraries.filter((lib) => lib.category === category).map((lib) => (
    { tracks, albums, ...lib }
  ))
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

const disable = (name) => {
  const library = get(name);
  library.enabled = false;
  dataAccess.write('library', name, library);
};

const enable = (name) => {
  const library = get(name);
  library.enabled = true;
  dataAccess.write('library', name, library);
};

const scan = async (library) => await scanner.scan(library);

const sortAlbumNameAsc = (albums) => {
  return albums.sort((x, y) => {
    const xAlbumName = path.basename(x.path);
    const yAlbumName = path.basename(y.path);

    if (xAlbumName < yAlbumName) {
      return -1;
    }
    if (xAlbumName > yAlbumName) {
      return 1;
    }
    return 0;
  });
};

const sortTrackNameAsc = (tracks) => {
  return tracks.sort((x, y) => {
    const xFileName = path.basename(x.path);
    const yFileName = path.basename(y.path);

    if (xFileName < yFileName) {
      return -1;
    }
    if (xFileName > yFileName) {
      return 1;
    }
    return 0;
  });
};

const sortFileNameAsc = (tracks) => {
  return tracks.sort((x, y) => {
    const xFileName = path.basename(x);
    const yFileName = path.basename(y);

    if (xFileName < yFileName) {
      return -1;
    }
    if (xFileName > yFileName) {
      return 1;
    }
    return 0;
  });
};

const getTracks = (start, limit) => {
  const libraries = dataAccess.getAll('library');
  const tracks = libraries.reduce((allTracks, library) => allTracks.concat(library.tracks), []);
  const sortedTracks = sortFileNameAsc(tracks);
  const limitedTracks = sortedTracks.slice(parseInt(start), parseInt(limit));
  
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

const getAlbums = (start, limit, category, filters = [], restriction, genre) => {
  const libraries = dataAccess.getAll('library');
  let albums = [];
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

  if (query && !startsWithFilter) {
    filterAlbums = data.albums.filter((album) => name(album).includes(text));
  } else if (!query && startsWithFilter) {
    filterAlbums = data.albums.filter((album) => name(album).charAt(0) === startsWithFilter.toLowerCase());
  } else if (query && startsWithFilter) {
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
