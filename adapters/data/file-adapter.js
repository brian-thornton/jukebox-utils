const fs = require('fs');
const path = require('path');

class FileAdapter {
  constructor(storageLocation) {
    this.storageLocation = storageLocation;
    FileAdapter.createIfNotExists(this.storageLocation);
  }

  write(type, id, object) {
    FileAdapter.createIfNotExists(path.join(this.storageLocation, type));
    fs.writeFileSync(path.join(this.storageLocation, type, `${id}.json`), JSON.stringify(object, null, 2));
  }

  get(type, id) {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.storageLocation, type, `${id}.json`)));
    } catch (err) {
      FileAdapter.createIfNotExists(`${this.storageLocation}/${type}`);
      return {};
    }
  }

  getAll(type) {
    try {
      const data = [];
      const files = fs.readdirSync(path.join(this.storageLocation, type));
      files.forEach((file) => {
        data.push(this.get(type, file.replace('.json', '')));
      });

      return data;
    } catch (e) {
      FileAdapter.createIfNotExists(`${this.storageLocation}/${type}`);

      const data = [];
      const files = fs.readdirSync(path.join(this.storageLocation, type));
      files.forEach((file) => {
        data.push(this.get(type, file.replace('.json', '')));
      });

      return data;
    }
  }

  remove(type, id) {
    fs.unlinkSync(path.join(this.storageLocation, type, `${id}.json`));
  }

  clear(type) {
    const files = fs.readdirSync(path.join(this.storageLocation, type));
    files.forEach((file) => {
      fs.unlinkSync(path.join(this.storageLocation, type, file));
    });
  }

  update(type, id, object) {
    this.remove(type, id);
    this.write(type, id, object);
  }

  static createIfNotExists(folder) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }
}
module.exports = FileAdapter;
