const FileAdapter = require('../adapters/data/file-adapter');

const storageLocation = './storage';
const adapter = new FileAdapter(storageLocation);

const write = (type, id, object) => adapter.write(type, id, object);
const get = (type, id) => adapter.get(type, id);
const getAll = (type) => adapter.getAll(type);
const remove = (type, id) => adapter.remove(type, id);
const clear = (type) => adapter.clear(type);
const update = (type, id, object) => adapter.update(type, id, object);

module.exports = {
  clear,
  get,
  getAll,
  remove,
  update,
  write,
};
