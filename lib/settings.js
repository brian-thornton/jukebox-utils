const fetch = require('node-fetch');
const request = require('request');
const DataAccess = require('./data-access');

class Settings {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.settingsStore = 'settings';
    this.initializeSettings();
  }

  initializeSettings() {
    this.masterSettings = this.dataAccess.get('settings', 'master_settings');
    if (!this.masterSettings.features) {
      this.masterSettings = {
        spotify: {
          useSpotify: false,
          clientId: '',
          clientSecret: '',
          spotifyFeatures: {
            albums: true,
            newReleases: true,
            categories: true
          }
        },
        features: {
          albums: true,
          tracks: true,
          playlists: true,
          queue: true,
          settings: true,
          volume: true,
          next: true,
          stop: true,
          play: true,
          playNow: true,
          enqueue: true,
          playAlbum: true,
          addToPlaylist: true,
          deletePlaylist: true
        }
      }
      this.dataAccess.write('settings', 'master_settings', this.masterSettings);
    }
  }

  getSettings() {
    return this.dataAccess.get('settings', 'master_settings');
  }
}
module.exports = Settings;


