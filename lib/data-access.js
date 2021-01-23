const FileAdapter = require('../adapters/data/file-adapter');

class DataAccess {
  constructor(options) {
    if (options.type === 'file') {
      this.adapter = new FileAdapter(options.storageLocation);
    }
  }

  write(type, id, object) {
    this.adapter.write(type, id, object);
  }

  get(type, id) {
    return this.adapter.get(type, id);
  }

  getAll(type) {
    return this.adapter.getAll(type);
  }

  remove(type, id) {
    this.adapter.remove(type, id);
  }

  clear(type) {
    this.adapter.clear(type);
  }

  update(type, id, object) {
    this.adapter.update(type, id, object);
  }
}
module.exports = DataAccess;
