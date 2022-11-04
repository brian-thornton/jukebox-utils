const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const scandir = require('scandirectory');

const dataAccess = require('./data-access');
const log = require('./log');

const { logInfo } = log;

const ScanStatus = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETE: 'complete',
  ERROR: 'error',
});

const scan = (library) => {
  return new Promise((resolve) => {
    const updatedLibrary = library;
    logInfo(`scanning ${library.name}...`);
    updatedLibrary.scanStatus = ScanStatus.IN_PROGRESS;
    dataAccess.update('library', updatedLibrary.name, updatedLibrary);

    const isValidType = (file) => {
      return file[0] !== '.' && (file.includes('.mp3') || file.includes('.m4a'));
    };

    const coverArtExists = (albumPath) => {
      if (fs.existsSync(path.join(albumPath, 'folder.jpg'))) {
        logInfo(`found cover art for ${albumPath}`);
        return true;
      } else if (fs.existsSync(path.join(albumPath, 'folder.jpeg'))) {
        logInfo(`found cover art for ${albumPath}`);
        return true;
      }
      logInfo(`no cover art for ${albumPath}`);
      return false;
    };

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
              album.coverArtExists = coverArtExists(`${library.path}/${dir}`);
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
      dataAccess.update('library', updatedLibrary.name, updatedLibrary);

      logInfo(`scanning ${library.name} complete`);
      resolve();
    });
  });
};

module.exports = {
  scan,
};
