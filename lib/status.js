const DataAccess = require('./data-access');

class Status {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.settingsStore = 'status';
    this.initializeStatus();
    this.initializeArtHistory();
  }

  initializeStatus() {
    this.systemStatus = this.dataAccess.get('status', 'system_status');

    if (!this.systemStatus.nowPlaying) {
      this.systemStatus.nowPlaying = '';
      this.systemStatus.history = [];
    };

    this.dataAccess.write('status', 'system_status', this.systemStatus);
  }

  initializeArtHistory() {
    this.artHistory = this.dataAccess.get('art_history', 'art_history');

    if (!this.artHistory.requests) {
      this.artHistory.requests = [];
    };

    this.dataAccess.write('art_history', 'art_history', this.artHistory);
  }

  getStatus() {
    return this.dataAccess.get('status', 'system_status');
  }

  updateStatus(status) {
    this.dataAccess.write('status', 'system_status', status);
  }

  getArtHistory() {
    return this.dataAccess.get('art_history', 'art_history');
  }

  updateArtHistory(body) {
    const history = this.getArtHistory();

    if (!history.requests.includes(body.albumPath)) {
      history.requests.push(body.albumPath);
    }

    this.dataAccess.write('art_history', 'art_history', history);
  }
}
module.exports = Status;
