const path = require('path');
const DataAccess = require('./data-access');
const Player = require('./player');

const player = new Player();
const status = {
  playing: 'Playing',
  stopped: 'Stopped',
};

class Queue {
  constructor(options) {
    this.queueStatus = status.stopped;
    this.dataAccess = new DataAccess(options.dataAccessOptions);
    this.initializeQueue();
  }

  initializeQueue() {
    this.queue = this.dataAccess.get('queue', 'master_queue');
    if (!this.queue.tracks || !this.queue.tracks.length) {
      this.queue = {
        tracks: [],
      };
    }
  }

  getQueue() {
    this.initializeQueue();
    const queueTracks = [];
    this.queue.tracks.forEach((track) => {
      queueTracks.push({
        name: track.name,
        path: track.path,
      });
    });
    return queueTracks;
  }

  enqueue(track) {
    this.queue.tracks.push(track);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  enqueueTop(track) {
    this.queue.tracks.unshift(track);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  enqueueTracksTop(tracks) {
    this.queue.tracks.unshift(tracks);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  enqueueTracks(tracks) {
    this.queue.tracks = this.queue.tracks.concat(tracks);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  play() {
    console.log(`Now Playing: ${this.queue.tracks[0].path}`);
    this.queueStatus = status.playing;
    player.play(this.queue.tracks[0]);
    this.queue.tracks.shift();
    this.dataAccess.write('queue', 'master_queue', this.queue);
    if (this.queue.tracks.length > 0 && this.queueStatus === status.playing) {
      setInterval(() => {
        if (!player.isPlaying()) {
          this.play();
        }
      }, 2000);
    }
  }

  stop() {
    this.queueStatus = status.stopped;
    player.stop();
  }

  next() {
    if (this.queueStatus === status.playing) {
      this.stop();
    }

    if (this.queue.tracks.length) {
      this.play();
    }
  }
}

module.exports = Queue;
