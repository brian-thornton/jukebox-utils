const DataAccess = require('./data-access');
const Player = require('./player');

const player = new Player();

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

  play() {
    console.log(`Now Playing: ${this.queue.tracks[0]}`);
    player.play(this.queue.tracks[0]);
    this.queue.tracks.shift();
    if (this.queue.tracks.length > 0) {
      setInterval(() => {
        if (!player.isPlaying()) {
          this.play();
        }
      }, 2000);
    }
  }
}

module.exports = Queue;
