const dataAccess = require('./data-access');

const collection = 'status';
const maxLogSize = 200;

const initializeLog = () => {
  let log = dataAccess.get(collection, 'log');
  if (!log.messages || !log.messages.length) {
    log = {
      messages: [],
    };
  }

  dataAccess.write(collection, 'log', log);
};

const getLogs = (type, start, limit) => {
  initializeLog();
  const logFile = dataAccess.get(collection, 'log');
  let logs = logFile.messages;

  if (type) {
    logs = logs.filter(l => l.type === type);
  }

  return {
    messages: start >= 0 && limit ? logs.slice(start, limit) : logs,
    totalLogs: logFile.messages.length,
  };
};

const prepend = (value, array) => {
  var newArray = array.slice();
  newArray.unshift(value);
  if (newArray.length >= maxLogSize) {
    newArray.splice(maxLogSize);
  }
  return newArray;
};

const logInfo = (message) => {
  initializeLog();
  const log = dataAccess.get(collection, 'log');
  log.messages = prepend({
    message,
    type: 'INFO',
  }, log.messages);

  dataAccess.write(collection, 'log', log);
};

const logError = (message) => {
  initializeLog();
  const log = dataAccess.get(collection, 'log');
  log.messages = prepend({
    message,
    type: 'ERROR',
  }, log.messages);

  dataAccess.write(collection, 'log', log);
};

const logWarning = (message) => {
  initializeLog();
  const log = dataAccess.get(collection, 'log');
  log.messages = prepend({
    message,
    type: 'WARNING',
  }, log.messages);

  dataAccess.write(collection, 'log', log);
};

module.exports = {
  initializeLog,
  logError,
  logInfo,
  logWarning,
  getLogs,
};
