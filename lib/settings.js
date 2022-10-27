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
        features: {
          albums: true,
          tracks: true,
          playlists: true,
          radio: true,
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
          deletePlaylist: true,
          admin: true,
          downloadTrack: false,
          isLocked: false,
        },
        preferences: {
          name: 'Jukebox',
          showAlbumName: true,
          showAlbumsWithoutCoverArt: true,
          pinEnabled: true,
          pin: '111',
          startsWithLocation: "left",
          showLibraryFilter: true,
          showAlbumTable: true,
          vlcHost: "localhost",
          vlcPort: "8080",
          vlcPassword: "jukebox",
        },
        pin: '123456',
        styles: {
          headerColor: '#343339',
          footerColor: '#343339',
          fontColor: '#FFFFFF',
          fontWeight: 'normal',
          backgroundColor: '#232323',
          popupBackgroundColor: '#48484a',
          buttonBackgroundColor: 'linear-gradient(180deg, rgba(8,8,8,1) 0%, rgba(66,66,67,1) 100%',
          buttonFontColor: '#FFFFFF',
          buttonFontWeight: 'bold',
          trackBackgroundColor: "linear-gradient(180deg, rgba(67,67,67,1) 0%, rgba(14,14,14,1) 100%",
          navButtonType: 'buttons',
        },
        categories: ['Albums'],
      };
      this.dataAccess.write('settings', 'master_settings', this.masterSettings);
    }
  }

  getSettings() {
    return this.dataAccess.get('settings', 'master_settings');
  }

  updateSettings(settings) {
    this.dataAccess.write('settings', 'master_settings', settings);
  }
}
module.exports = Settings;
