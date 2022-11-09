const dataAccess = require('./data-access');
const fs = require('fs');
const path = require('path');

const skinsStore = 'skins';

const createSkin = (name, skin) => dataAccess.write(skinsStore, name, skin);

const getAll = () => {
  const existingSkins = dataAccess.getAll(skinsStore);

  fs.readdir(path.resolve(__dirname, '../model-skins'), function (err, files) {
    console.log(err);
    files.forEach(function (file) {
      console.log(file);
      let skinData = fs.readFileSync(path.resolve(__dirname, `../model-skins/${file}`));
      let skin = JSON.parse(skinData);

      if (!existingSkins.find((es) => es.name === skin.name)) {
        dataAccess.write(skinsStore, skin.name, skin);
      }
    })
  });

  // const defaultSkin = {
  //   name: 'default_skin',
  //   isEditable: false,
  //   headerColor: '#343339',
  //   footerColor: '#343339',
  //   fontColor: '#FFFFFF',
  //   fontWeight: 'normal',
  //   backgroundColor: '#232323',
  //   popupBackgroundColor: '#48484a',
  //   buttonBackgroundColor: 'linear-gradient(180deg, rgba(8,8,8,1) 0%, rgba(66,66,67,1) 100%',
  //   buttonFontColor: '#FFFFFF',
  //   buttonFontWeight: 'bold',
  //   trackBackgroundColor: 'linear-gradient(180deg, rgba(67,67,67,1) 0%, rgba(14,14,14,1) 100%',
  // };

  // const iceSkin = {
  //   name: 'ice',
  //   isEditable: false,
  //   headerColor: 'linear-gradient(180deg, rgba(14,14,14,1) 0%, rgba(11,1,61,1) 100%',
  //   footerColor: 'linear-gradient(180deg, rgba(14,14,14,1) 0%, rgba(11,1,61,1) 100%',
  //   fontColor: '#FFFFFF',
  //   fontWeight: 'normal',
  //   backgroundColor: 'linear-gradient(180deg, rgba(48,5,245,1) 0%, rgba(14,14,14,1) 100%',
  //   popupBackgroundColor: '#48484a',
  //   buttonBackgroundColor: 'linear-gradient(180deg, rgba(12,12,12,1) 0%, rgba(209,207,216,1) 100%',
  //   buttonFontColor: '#FFFFFF',
  //   buttonFontWeight: 'bold',
  //   trackBackgroundColor: 'linear-gradient(180deg, rgba(117,117,119,1) 0%, rgba(12,12,12,1) 100%',
  // };

  // const coolSkin = {
  //   name: 'cool',
  //   isEditable: false,
  //   headerColor: 'linear-gradient(180deg, rgba(62,62,63,1) 0%, rgba(9,87,222,1) 100%',
  //   footerColor: 'linear-gradient(180deg, rgba(62,62,63,1) 0%, rgba(9,87,222,1) 100%',
  //   fontColor: '#FFFFFF',
  //   fontWeight: 'normal',
  //   backgroundColor: 'linear-gradient(180deg, rgba(50,50,51,1) 0%, rgba(93,93,94,1) 100%',
  //   popupBackgroundColor: '#48484a',
  //   buttonBackgroundColor: 'linear-gradient(180deg, rgba(8,8,8,1) 0%, rgba(66,66,67,1) 100%',
  //   buttonFontColor: '#FFFFFF',
  //   buttonFontWeight: 'bold',
  //   trackBackgroundColor: 'linear-gradient(180deg, rgba(67,67,67,1) 0%, rgba(14,14,14,1) 100%',
  // };

  // dataAccess.write(skinsStore, 'cool_skin', coolSkin);
  // dataAccess.write(skinsStore, 'default_skin', defaultSkin);
  // dataAccess.write(skinsStore, 'ice_skin', iceSkin);
  return dataAccess.getAll(skinsStore);
};

const deleteSkin = (name) => dataAccess.remove('skins', name);

module.exports = {
  createSkin,
  deleteSkin,
  getAll,
};
