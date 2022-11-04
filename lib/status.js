const dataAccess = require('./data-access');

const initializeStatus = () => {
  const systemStatus = dataAccess.get('status', 'system_status');

  if (!systemStatus.nowPlaying) {
    systemStatus.nowPlaying = '';
    systemStatus.history = [];
  }

  dataAccess.write('status', 'system_status', systemStatus);
};

const initializeArtHistory = () => {
  const artHistory = dataAccess.get('art_history', 'art_history');

  if (!artHistory.requests) {
    artHistory.requests = [];
  }

  dataAccess.write('art_history', 'art_history', artHistory);
};

const getStatus = () => {
  initializeStatus();
  return dataAccess.get('status', 'system_status');
};

const updateStatus = (status) => {
  dataAccess.write('status', 'system_status', status);
};

const getArtHistory = () => {
  initializeArtHistory();
  return dataAccess.get('art_history', 'art_history');
};

const updateArtHistory = (body) => {
  const history = getArtHistory();

  if (!history.requests.includes(body.albumPath)) {
    history.requests.push(body.albumPath);
  }

  dataAccess.write('art_history', 'art_history', history);
};

module.exports = {
  getArtHistory,
  getStatus,
  initializeArtHistory,
  initializeStatus,
  updateArtHistory,
  updateStatus,
};
