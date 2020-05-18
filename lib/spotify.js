const fetch = require('node-fetch');
const request = require('request');

class Spotify {
  constructor() {
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  async get(token, url) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        }
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
    }
  }

  async put(url, body) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.bearerToken()}`,
          "Content-type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        },
        json: body
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
    }
  }

  async post(auth_token, url, body) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Basic cc30ac64b20749ce9b9207d65cff8020` },
        json: body
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  getDevices() {
    return this.get(`${this.baseUrl}/me/player/devices`);
  }

  findTrack(token, trackName) {
    return this.get(token, `${this.baseUrl}/search?q=${encodeURI(trackName)}&type=track`);
  }

  findAlbums(token, albumName, limit, offset) {
    if (limit && offset) {
      return this.get(token, `${this.baseUrl}/search?q=${encodeURI(albumName)}&type=album&limit=${limit}&offset=${offset}`);
    } else {
      return this.get(token, `${this.baseUrl}/search?q=${encodeURI(albumName)}&type=album`);
    }
  }

  getTracks(token, albumId) {
    return this.get(token, `${this.baseUrl}/albums/${albumId}/tracks`);
  }

  getCategories(token) {
    return this.get(token, `${this.baseUrl}/browse/categories`);
  }

  newReleases(token, limit, offset) {
    if (limit && offset) {
      return this.get(token, `${this.baseUrl}/browse/new-releases?limit=${limit}&offset=${offset}`);
    } else {
      return this.get(token, `${this.baseUrl}/browse/new-releases`);
    }
  }

  playTrack(track) {
    request({
      method: 'PUT',
      url: `${this.baseUrl}/me/player/play`,
      headers: {
        'Authorization': `Bearer ${track.accessToken}`
      },
      json: {
        uris: [`spotify:track:${track.id}`]
      },
      rejectUnauthorized: false
    }, function (err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log(res);
      }
    });
  }

  stopPlayback(token) {
    request({
      method: 'PUT',
      url: `${this.baseUrl}/me/player/pause`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      rejectUnauthorized: false
    }, function (err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log(res);
      }
    });
  }

  nextTrack(token) {
    request({
      method: 'POST',
      url: `${this.baseUrl}/me/player/next`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      rejectUnauthorized: false
    }, function (err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log(res);
      }
    });
  }
}
module.exports = Spotify;


