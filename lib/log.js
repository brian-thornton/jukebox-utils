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
  let logs = type ? logFile.messages.filter((l) => l.type === type) : logFile.messages;

  return {
    messages: start >= 0 && limit ? logs.slice(start, start + limit) : logs,
    totalLogs: logFile.messages.length,
  };
};

const prepend = (value, array) => {
  return [value, ...array].slice(0, maxLogSize);
};

const logMessage = (message, type) => {
  initializeLog();
  const log = dataAccess.get(collection, 'log');
  log.messages = prepend({ message, type }, log.messages);
  dataAccess.write(collection, 'log', log);
};

const logInfo = (message) => {
  logMessage(message, 'INFO');
};

const logError = (message) => {
  logMessage(message, 'ERROR');
};

const logWarning = (message) => {
  logMessage(message, 'WARNING');
};

module.exports = {
  initializeLog,
  logError,
  logInfo,
  logWarning,
  getLogs,
};
