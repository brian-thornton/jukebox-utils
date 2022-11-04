const dataAccess = require('./data-access');

const initializeSettings = () => {
  let masterSettings = dataAccess.get('settings', 'master_settings');
  if (!masterSettings.features) {
    masterSettings = {
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
        startsWithLocation: 'left',
        showLibraryFilter: true,
        showAlbumTable: true,
        vlcHost: 'localhost',
        vlcPort: '8080',
        vlcPassword: 'jukebox',
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
        trackBackgroundColor: 'linear-gradient(180deg, rgba(67,67,67,1) 0%, rgba(14,14,14,1) 100%',
        navButtonType: 'buttons',
      },
      categories: ['Albums'],
    };
    dataAccess.write('settings', 'master_settings', masterSettings);
  }
};

const getSettings = () => {
  const results = dataAccess.get('settings', 'master_settings');
  if (!results.features) {
    initializeSettings();
    return dataAccess.get('settings', 'master_settings');
  }

  return results;
};

const updateSettings = (settings) => {
  dataAccess.write('settings', 'master_settings', settings);
};

const createRestrictionGroup = (name, type) => {
  const restrictionGroup = {
    name,
    type,
    content: [],
  };

  dataAccess.write('content_restrictions', name, restrictionGroup);
};

const getRestrictionGroup = (name) => dataAccess.get('content_restrictions', name);

const deleteRestrictionGroup = (name) => {
  dataAccess.remove('content_restrictions', name);
};

const getRestrictionGroups = () => dataAccess.getAll('content_restrictions');

const addRestrictedContent = (contentPath, name) => {
  const restrictionGroup = getRestrictionGroup(name);
  restrictionGroup.content.push(contentPath);
  dataAccess.update('content_restrictions', restrictionGroup.name, restrictionGroup);
};

const removeRestrictedContent = (contentPath, restrictionGroup) => {

};

module.exports = {
  addRestrictedContent,
  createRestrictionGroup,
  deleteRestrictionGroup,
  getRestrictionGroup,
  getRestrictionGroups,
  getSettings,
  initializeSettings,
  removeRestrictedContent,
  updateSettings,
};
