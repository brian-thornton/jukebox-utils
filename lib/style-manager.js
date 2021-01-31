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

    this.dataAccess.write(this.skinsStore, 'default_skin', defaultSkin);
    return this.dataAccess.getAll(this.skinsStore);
  }

  deleteSkin(name) {
    return this.dataAccess.remove('skins', name);
  }
}

module.exports = StyleManager;
