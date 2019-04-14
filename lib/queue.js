const DataAccess = require('./data-access');

class Queue {
  constructor(options) {
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.initializeQueue();
  }

  initializeQueue() {
    this.queue = this.dataAccess.get('queue', 'master_queue');
    if (!this.queue.tracks) {
      this.queue = {
        tracks: [],
      };
    }
  }

  enqueue(track) {
    this.queue.tracks.push(track);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }
}

module.exports = Queue;
