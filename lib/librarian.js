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

const add = (library) => {
  const newLibrary = library;
  newLibrary.enabled = true;
  newLibrary.name = `${library.path.split('/').pop()}_${crypto.randomUUID()}`;
  newLibrary.scanStatus = ScanStatus.PENDING;
  newLibrary.albums = [];
  newLibrary.tracks = [];
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
  let tracks = [];
  libraries.forEach((library) => {
    tracks = tracks.concat(library.tracks);
  });

  const sortedTracks = sortFileNameAsc(tracks);
  const limitTracks = start >= 0 && limit ? sortedTracks.slice(start, limit) : sortedTracks;

  const finalTracks = [];
  limitTracks.forEach((track) => {
    finalTracks.push({
      name: path.basename(track),
      path: track,
    });
  });

  return {
    tracks: finalTracks,
    totalTracks: sortedTracks.length,
  };
};

const getAlbumTracks = (albumPath) => {
  const libraries = dataAccess.getAll('library');
  let tracks = [];
  libraries.forEach((library) => {
    tracks = tracks.concat(library.tracks);
  });

  const filter = albumPath.toLowerCase();
  const filterTracks = tracks.filter(track => track.toLowerCase().includes(filter));
  const albumTracks = [];
  filterTracks.forEach((track) => {
    albumTracks.push({
      name: path.basename(track),
      path: track,
    });
  });

  return albumTracks;
};

const getTrackAlbums = (tracks) => {
  const albums = [];

  const libraries = getAll();

  tracks.forEach((track) => {
    if (typeof track.path === 'string') {
      const albumPath = path.dirname(track.path);
      const libraryPath = path.dirname(albumPath);
      const albumLibrary = libraries.find((l) => l.path === libraryPath);

      if (albumLibrary && albumLibrary.albums && albumLibrary.albums.length) {
        albumLibrary.albums.forEach((album) => {
          if (album.path === albumPath) {
            albums.push(album);
          }
        });
      }
    }
  });

  return albums;
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

const parseAlbums = (tracks) => {
  const albums = [];
  tracks.forEach((track) => {
    const albumPath = path.dirname(track);
    const exists = albums.filter(album => album.path === albumPath).length;

    const coverArtExists = () => {
      if (fs.existsSync(path.join(albumPath, 'folder.jpg'))) {
        return true;
      } else if (fs.existsSync(path.join(albumPath, 'folder.jpeg'))) {
        return true;
      }

      return false;
    };

    if (!exists) {
      albums.push({
        name: path.basename(albumPath),
        path: albumPath,
        coverArtExists: coverArtExists(),
        trackCount: countTracks(albumPath, tracks),
      });
    }
  });

  return albums;
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
  create,
  countTracks,
  disable,
  discover,
  download,
  enable,
  get,
  getAlbums,
  getAlbumTracks,
  getAll,
  getDirs,
  getTrackAlbums,
  getTracks,
  parseAlbums,
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
