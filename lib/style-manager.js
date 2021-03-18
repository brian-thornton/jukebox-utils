const DataAccess = require('./data-access');

class StyleManager {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.skinsStore = 'skins';
  }

  createSkin(name, skin) {
    this.dataAccess.write(this.skinsStore, name, skin);
  }

  getAll() {
    const defaultSkin = {
      name: 'default_skin',
      isEditable: false,
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
    };

    const iceSkin = {
      name: 'ice',
      isEditable: false,
      headerColor: 'linear-gradient(180deg, rgba(14,14,14,1) 0%, rgba(11,1,61,1) 100%',
      footerColor: 'linear-gradient(180deg, rgba(14,14,14,1) 0%, rgba(11,1,61,1) 100%',
      fontColor: '#FFFFFF',
      fontWeight: 'normal',
      backgroundColor: 'linear-gradient(180deg, rgba(48,5,245,1) 0%, rgba(14,14,14,1) 100%',
      popupBackgroundColor: '#48484a',
      buttonBackgroundColor: 'linear-gradient(180deg, rgba(12,12,12,1) 0%, rgba(209,207,216,1) 100%',
      buttonFontColor: '#FFFFFF',
      buttonFontWeight: 'bold',
      trackBackgroundColor: "linear-gradient(180deg, rgba(117,117,119,1) 0%, rgba(12,12,12,1) 100%",
    };

    const coolSkin = {
      name: 'cool',
      isEditable: false,
      headerColor: 'linear-gradient(180deg, rgba(62,62,63,1) 0%, rgba(9,87,222,1) 100%',
      footerColor: 'linear-gradient(180deg, rgba(62,62,63,1) 0%, rgba(9,87,222,1) 100%',
      fontColor: '#FFFFFF',
      fontWeight: 'normal',
      backgroundColor: 'linear-gradient(180deg, rgba(50,50,51,1) 0%, rgba(93,93,94,1) 100%',
      popupBackgroundColor: '#48484a',
      buttonBackgroundColor: 'linear-gradient(180deg, rgba(8,8,8,1) 0%, rgba(66,66,67,1) 100%',
      buttonFontColor: '#FFFFFF',
      buttonFontWeight: 'bold',
      trackBackgroundColor: "linear-gradient(180deg, rgba(67,67,67,1) 0%, rgba(14,14,14,1) 100%",
    };

    this.dataAccess.write(this.skinsStore, 'cool_skin', coolSkin);
    this.dataAccess.write(this.skinsStore, 'default_skin', defaultSkin);
    this.dataAccess.write(this.skinsStore, 'ice_skin', iceSkin);
    return this.dataAccess.getAll(this.skinsStore);
  }

  deleteSkin(name) {
    return this.dataAccess.remove('skins', name);
  }
}

module.exports = StyleManager;
