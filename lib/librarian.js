const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { resolve } = require('path');
const DataAccess = require('./data-access');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const ScanStatus = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETE: 'complete',
  ERROR: 'error',
});

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

class Librarian {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
  }

  add(library) {
    // Initialize additional values for a new library.
    const newLibrary = library;
    newLibrary.enabled = true;
    newLibrary.scanStatus = ScanStatus.PENDING;
    newLibrary.albums = [];
    newLibrary.tracks = [];
    this.dataAccess.write('library', newLibrary.name, newLibrary);
  }

  remove(library) {
    this.dataAccess.remove('library', library.name);
  }

  scan(library) {
    const updatedLibrary = library;
    console.log(`scanning ${library.name}...`);
    updatedLibrary.scanStatus = ScanStatus.IN_PROGRESS;
    this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);

    getFiles(library.path)
      .then((files) => {
        updatedLibrary.tracks = files;
        updatedLibrary.albums = Librarian.parseAlbums(files);
        updatedLibrary.totalTracks = Librarian.totalTracks(updatedLibrary);
        updatedLibrary.scanStatus = ScanStatus.COMPLETE;
        this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);
        console.log(`scanning ${library.name} complete`);
      })
      .catch(e => console.error(e));
  }

  getTracks(start, limit) {
    const libraries = this.dataAccess.getAll('library');
    let tracks = [];
    libraries.forEach((library) => {
      tracks = tracks.concat(library.tracks);
    });

    const sortedTracks = Librarian.sortFileNameAsc(tracks);
    return start >= 0 && limit ? sortedTracks.slice(start, limit) : sortedTracks;
  }

  getAlbums(start, limit) {
    const libraries = this.dataAccess.getAll('library');
    let albums = [];
    libraries.forEach((library) => {
      albums = albums.concat(library.albums);
    });

    return start >= 0 && limit ? albums.slice(start, limit) : albums;
  }

  searchTracks(query) {
    const tracks = this.getTracks();
    const filterTracks = tracks.filter(track => track.toLowerCase().includes(query.toLowerCase()));
    return Librarian.sortFileNameAsc(filterTracks);
  }

  searchAlbums(query) {
    const albums = this.getAlbums();
    const text = query.toLowerCase();
    const filterAlbums = albums.filter(album => album.name.toLowerCase().includes(text));
    return filterAlbums;
  }

  static sortFileNameAsc(tracks) {
    return tracks.sort(function (x, y) {
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
  }

  static parseAlbums(tracks) {
    const albums = [];
    tracks.forEach((track) => {
      const albumPath = path.dirname(track);
      const exists = albums.filter(album => album.path === albumPath).length;

      if (!exists) {
        albums.push({
          name: path.basename(albumPath),
          path: albumPath,
          trackCount: Librarian.countTracks(albumPath, tracks),
        });
      }
    });

    return albums;
  }

  static countTracks(album, tracks) {
    return tracks.filter(track => path.dirname(track) === album).length;
  }

  static totalTracks(folder) {
    return folder.albums.reduce((a, b) => a + b.trackCount, 0);
  }
}
module.exports = Librarian;
