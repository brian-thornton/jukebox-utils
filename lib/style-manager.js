const fs = require('fs');
const path = require('path');

const dataAccess = require('./data-access');

const skinsStore = 'skins';
const createSkin = (name, skin) => dataAccess.write(skinsStore, name, skin);

const getAll = () => {
  const existingSkins = dataAccess.getAll(skinsStore);

  fs.readdir(path.resolve(__dirname, '../model-skins'), function (err, files) {
    files.forEach(function (file) {
      const skinData = fs.readFileSync(path.resolve(__dirname, `../model-skins/${file}`));
      const skin = JSON.parse(skinData);

      if (!existingSkins.find((es) => es.name === skin.name)) {
        dataAccess.write(skinsStore, skin.name, skin);
      }
    });
  });

  return dataAccess.getAll(skinsStore);
};

const deleteSkin = (name) => dataAccess.remove('skins', name);

module.exports = {
  createSkin,
  deleteSkin,
  getAll,
};
