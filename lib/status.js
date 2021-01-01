const DataAccess = require('./data-access');

class Status {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.settingsStore = 'status';
    this.initializeStatus();
  }

  initializeStatus() {
    this.systemStatus = this.dataAccess.get('status', 'system_status');
    if (!this.systemStatus.nowPlaying) {
      this.systemStatus = {
        nowPlaying: '',
        history: [],
      };

      this.dataAccess.write('status', 'system_status', this.systemStatus);
    }
  }

  getStatus() {
    return this.dataAccess.get('status', 'system_status');
  }

  updateStatus(status) {
    this.dataAccess.write('status', 'system_status', status);
  }
}
module.exports = Status;
