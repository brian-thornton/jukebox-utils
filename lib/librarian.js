const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { resolve } = require('path');
const DataAccess = require('./data-access');
const request = require('request');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const ScanStatus = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETE: 'complete',
  ERROR: 'error',
});

async function getFiles(dir) {
  console.log(`scanning ${dir}`);
  const subdirs = await readdir(dir);
  let files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));

  files = files.filter(file => !file.toString().includes('.jpg'))
  return files.reduce((a, f) => a.concat(f), []);
}

class Librarian {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
  }

  getAll() {
    return this.dataAccess.getAll('library');
  }

  add(library) {
    // Initialize additional values for a new library.
    const newLibrary = library;
    newLibrary.enabled = true;
    newLibrary.name = library.path.split("/").pop();
    newLibrary.scanStatus = ScanStatus.PENDING;
    newLibrary.albums = [];
    newLibrary.tracks = [];
    this.dataAccess.write('library', newLibrary.name, newLibrary);
  }

  remove(library) {
    this.dataAccess.remove('library', library.name);
  }

  get(name) {
    return this.dataAccess.get('library', name);
  }

  disable(name) {
    let library = this.get(name);
    library.enabled = false;
    this.dataAccess.write('library', name, library);
  }

  enable(name) {
    let library = this.get(name);
    library.enabled = true;
    this.dataAccess.write('library', name, library);
  }

  scan(library) {
    const updatedLibrary = library;
    console.log(`scanning ${library.name}...`);
    updatedLibrary.scanStatus = ScanStatus.IN_PROGRESS;
    this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);

    return new Promise((resolve, reject) => {
      getFiles(library.path)
        .then((files) => {
          updatedLibrary.tracks = files;
          updatedLibrary.albums = Librarian.parseAlbums(files);
          updatedLibrary.totalTracks = Librarian.totalTracks(updatedLibrary);
          updatedLibrary.scanStatus = ScanStatus.COMPLETE;
          this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);
          console.log(`scanning ${library.name} complete`);
          resolve();
        })
        .catch((e) => {
          console.error(e);
          reject(e);
        });
    });
  }

  getTracks(start, limit) {
    const libraries = this.dataAccess.getAll('library');
    let tracks = [];
    libraries.forEach((library) => {
      tracks = tracks.concat(library.tracks);
    });

    const sortedTracks = Librarian.sortFileNameAsc(tracks);
    const limitTracks = start >= 0 && limit ? sortedTracks.slice(start, limit) : sortedTracks;

    const finalTracks = [];
    limitTracks.forEach((track) => {
      finalTracks.push({
        name: path.basename(track),
        path: track,
      });
    });
    return finalTracks;
  }

  getAlbumTracks(albumPath) {
    const libraries = this.dataAccess.getAll('library');
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
  }

  getAlbums(start, limit) {
    const libraries = this.dataAccess.getAll('library');
    let albums = [];
    libraries.forEach((library) => {
      if (library.enabled) {
        albums = albums.concat(library.albums);
      }
    });

    return start >= 0 && limit ? albums.slice(start, limit) : albums;
  }

  searchTracks(query) {
    console.log(query);
    const tracks = this.getTracks();
    console.log(tracks[0]);
    const filterTracks = tracks.filter(track => track.path.toLowerCase().includes(query.toLowerCase()));
    return Librarian.sortTrackNameAsc(filterTracks).slice(0, 99);
  }

  searchAlbums(query) {
    const albums = this.getAlbums();
    const text = query.toLowerCase();
    const filterAlbums = albums.filter(album => album.name.toLowerCase().includes(text));
    return filterAlbums;
  }

  static sortTrackNameAsc(tracks) {
    return tracks.sort(function (x, y) {
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
          coverArtExists: fs.existsSync(path.join(albumPath, 'folder.jpg')),
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

  download(url, filename) {
    request(url).pipe(fs.createWriteStream(filename));
  }

  saveCoverArt(cover) {
    console.log(cover);
    this.download(cover.url, path.join(cover.album.path, 'folder.jpg'));
  }

  removeCoverArt(album) {
    console.log(`Removing cover art for ${album.path}`);
    fs.unlinkSync(path.join(album.path, 'folder.jpg'));
  }
}
module.exports = Librarian;
