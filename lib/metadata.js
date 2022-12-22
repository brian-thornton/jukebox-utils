const Musicbrainz = require('../adapters/metadata/musicbrainz');
const dataAccess = require('./data-access');
const collection = 'metadata';
const librarian = require('./librarian');
const log = require('./log');
const metadata = new Musicbrainz();

const getArtistsByGenre = async (genre) => {
  const artistGenreData = await metadata.getArtistsByTag(genre);
  dataAccess.write(collection, `${genre}_genre_artists`, artistGenreData);
};

const getGenreMetadata = genre => dataAccess.get('metadata', `${genre}_genre_artists`);

const linkGenereToLibrary = (genre) => {
  log.logInfo('Loading libraries...');
  const libraries = librarian.getAll();

  log.logInfo('Loading genre artists...');
  const genreArtists = getGenreMetadata(genre);

  libraries?.forEach((library) => {
    log.logInfo(`Scanning ${library.name} for genre match.`)
    library.albums?.forEach((album) => {
      const artistName = album.name?.split('-')[0];
      if (genreArtists.find(a => a.toLowerCase().trim() === artistName.toLowerCase().trim())) {
        log.logInfo(`Found match for ${artistName}`);
        if (album.genres?.length > 0) {
          album.genres.push(genre);
        } else {
          album.genres = [genre];
        }
      }
    })

    log.logInfo(`Destroying outdated library...`);
    librarian.remove(library);
    log.logInfo('Saving updated library...');
    librarian.create(library);
    log.logInfo('Done.');
  })
};

module.exports = {
  getArtistsByGenre,
  linkGenereToLibrary,
}