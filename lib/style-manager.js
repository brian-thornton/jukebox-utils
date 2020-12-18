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
      headerColor: "linear-gradient(180deg, rgba(51,28,166,1) 0%, rgba(137,24,130,1) 100%",
      footerColor: "linear-gradient(180deg, rgba(61,54,98,1) 0%, rgba(64,41,178,1) 100%",
      fontColor: "#7d6ade",
      backgroundColor: "linear-gradient(180deg, rgba(25,26,25,1) 0%, rgba(132,234,12,1) 100%",
      popupBackgroundColor: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(44,0,255,1) 100%",
      buttonBackgroundColor: "linear-gradient(180deg, rgba(218,52,13,1) 0%, rgba(36,35,35,1) 100%",
      buttonTextColor: "#FFFFFF"
    };

    this.dataAccess.write(this.skinsStore, 'default_skin', defaultSkin);
    return this.dataAccess.getAll(this.skinsStore);
  }

  deleteSkin(name) {
    const skin = this.dataAccess.get(this.skinsStore, name);
    return this.dataAccess.remove('skins', name);
  }
}

module.exports = StyleManager;