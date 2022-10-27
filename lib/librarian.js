const fs = require('fs');
const path = require('path');
const request = require('request');
const scandir = require('scandirectory')
const crypto = require('crypto');

const DataAccess = require('./data-access');
const internal = require('stream');

const ScanStatus = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETE: 'complete',
  ERROR: 'error',
});

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
    newLibrary.name = `${library.path.split('/').pop()}_${crypto.randomUUID()}`;
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
    const library = this.get(name);
    library.enabled = false;
    this.dataAccess.write('library', name, library);
  }

  enable(name) {
    const library = this.get(name);
    library.enabled = true;
    this.dataAccess.write('library', name, library);
  }

  coverArtExists(albumPath) {
    if (fs.existsSync(path.join(albumPath, 'folder.jpg'))) {
      console.log(`found cover art for ${albumPath}`);
      return true;
    } else if (fs.existsSync(path.join(albumPath, 'folder.jpeg'))) {
      console.log(`found cover art for ${albumPath}`);
      return true;
    }
    console.log(`no cover art for ${albumPath}`);
    return false;
  }

  scan(library) {
    console.log(library)
    return new Promise((resolve) => {
      const updatedLibrary = library;
      console.log(`scanning ${library.name}...`);
      updatedLibrary.scanStatus = ScanStatus.IN_PROGRESS;
      this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);

      const isValidType = (file) => {
        return file[0] !== '.' && (file.includes('.mp3') || file.includes('.m4a'));
      }

      scandir(library.path, {}, (err, list, tree) => {
        const tracks = [];
        const albums = [];
        Object.keys(tree).map((dir) => {
          if (dir[0] !== '.') {
            const album = {
              id: crypto.randomUUID(),
              path: `${library.path}/${dir}`,
              name: dir,
              trackCount: Object.keys(tree[dir]).map((file) => isValidType(file)).length,
              coverArtExists: false,
              allowCoverArtDownload: library.allowCoverArtDownload,
            };

            Object.keys(tree[dir]).map((file) => {
              if (file[0] !== '.' && file.toLowerCase().includes('folder')) {
                album.coverArtExists = this.coverArtExists(`${library.path}/${dir}`);
              }

              if (isValidType(file)) {
                tracks.push(`${library.path}/${dir}/${file}`);
              }
            });
            albums.push(album);
          }
        });

        updatedLibrary.tracks = tracks;
        updatedLibrary.albums = albums;
        updatedLibrary.totalTracks = tracks.length;
        updatedLibrary.scanStatus = ScanStatus.COMPLETE;
        this.dataAccess.update('library', updatedLibrary.name, updatedLibrary);

        console.log(`scanning ${library.name} complete`);
        resolve();
      })
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

    return {
      tracks: finalTracks,
      totalTracks: sortedTracks.length,
    };

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

  getTrackAlbums(tracks) {
    const albums = [];

    const libraries = this.getAll();

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
  }

  getAlbums(start, limit, category, filters = []) {
    const libraries = this.dataAccess.getAll('library');
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

    return {
      albums: start >= 0 && limit ? albums.slice(start, limit) : albums,
      totalAlbums: albums.length,
    };
  }

  searchTracks(query, start, limit) {
    const data = this.getTracks();
    const filterTracks = data.tracks.filter(track => (
      track.path.toLowerCase().includes(query.toLowerCase())
    ));

    const unpagedResult = Librarian.sortTrackNameAsc(filterTracks);

    return {
      tracks: start >= 0 && limit ? unpagedResult.slice(start, limit) : unpagedResult,
      totalTracks: unpagedResult.length,
    };
  }

  searchAlbums(query, start, limit, startsWithFilter) {
    const data = this.getAlbums();
    const text = query.toLowerCase();
    let filterAlbums;
    
    if (query && !startsWithFilter) {
      filterAlbums = data.albums.filter(album => album.name.toLowerCase().includes(text));
    } else if (!query && startsWithFilter) {
      filterAlbums = data.albums.filter(album => album.name.toLowerCase().charAt(0) === startsWithFilter.toLowerCase());
    } else if (query && startsWithFilter) {
      filterAlbums = data.albums.filter(album => album.name.toLowerCase().includes(text));
      filterAlbums = filterAlbums.filter(album => album.name.toLowerCase().charAt(0) === startsWithFilter.toLowerCase())
    }

    return {
      albums: start >= 0 && limit ? filterAlbums.slice(start, limit) : filterAlbums,
      totalAlbums: filterAlbums.length,
    };
  }

  static sortTrackNameAsc(tracks) {
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
  }

  static sortFileNameAsc(tracks) {
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
  }

  static parseAlbums(tracks) {
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
      }

      if (!exists) {
        albums.push({
          name: path.basename(albumPath),
          path: albumPath,
          coverArtExists: coverArtExists(),
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

  getDirs(p) {
    console.log(p);
    const dirs = [];
    const files = fs.readdirSync(p);

    files.forEach((file) => {
      if (fs.lstatSync(path.join(p, file)).isDirectory()) {
        dirs.push(path.join(p, file));
      }
    });

    return dirs;
  }

  static walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {
            results.push(file);
            Librarian.walk(file, function (err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            // results.push(file);
            next();
          }
        });
      })();
    });
  };

  discover(p) {
    const rootDirs = this.getDirs(p);
    return rootDirs;
  }

  download(url, filename) {
    request(url).pipe(fs.createWriteStream(filename));
  }

  saveCoverArt(cover) {
    try {
      if (fs.existsSync(cover.album.path)) {
        console.log(`Saving cover art for ${cover.album.path}`);
        this.download(cover.url, path.join(cover.album.path, 'folder.jpg'));
      }
    } catch (error) {
      console.log(`Warning: Cover Art Save Failed.`);
    }
  }

  removeCoverArt(album) {
    console.log(`Removing cover art for ${album.path}`);
    fs.unlinkSync(path.join(album.path, 'folder.jpg'));
  }
}
module.exports = Librarian;
