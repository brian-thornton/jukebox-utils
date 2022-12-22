const fetch = require('node-fetch');

const log = require('../../lib/log');

const { logInfo, logError } = log;

class Musicbrainz {
  getArtistsByTag = async (tag) => {
    logInfo(`Getting artist data from Musicbrainz for tag: ${tag}`);
    const artists = []
    let offset = 0;
    let totalArtists = 0;
    const initialRequest = `http://musicbrainz.org/ws/2/artist/?query=tag:${tag}&fmt=json&limit=100&offset=0`
    const initialResponse = await fetch(initialRequest);

    try {
      const json = await initialResponse.json();
      totalArtists = json.count;
      json.artists.forEach(a => artists.push(a.name));
      offset += 100;
      logInfo(`Found ${totalArtists} artists with tag: ${tag}`);
    } catch (err) {
      logError(err);
      return null;
    }

    while (offset <= totalArtists) {
      const pageRequest = `http://musicbrainz.org/ws/2/artist/?query=tag:${tag}&fmt=json&limit=100&offset=${offset}`
      const pageResponse = await fetch(pageRequest);

      try {
        logInfo(`Now loading data page: ${pageRequest}`);
        const json = await pageResponse.json();
        json?.artists?.forEach(a => artists.push(a.name));
        offset += 100;
      } catch (err) {
        logError(err);
        return null;
      }
    }

    logInfo(`Finished loading metadata for tag: ${tag}`);
    return artists;
  }
};

module.exports = Musicbrainz;