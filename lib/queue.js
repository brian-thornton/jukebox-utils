const DataAccess = require('./data-access');
const Player = require('./player');
const Spotify = require('./spotify');

const player = new Player();
const spotify = new Spotify();
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

  getQueue(start, limit) {
    this.initializeQueue();
    const queueTracks = [];
    this.queue.tracks.forEach((track) => {
      queueTracks.push({
        name: track.name,
        path: track.path,
      });
    });

    return {
      tracks: start >= 0 && limit ? queueTracks.slice(start, limit) : queueTracks,
      totalTracks: this.queue.tracks.length,
    };
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
    this.initializeQueue();

    if (this.queue.tracks.length) {
      this.queue.tracks = tracks.concat(this.queue.tracks);
      this.dataAccess.write('queue', 'master_queue', this.queue);
    } else {
      this.enqueueTracks(tracks);
    }
  }

  enqueueTracks(tracks) {
    this.queue.tracks = this.queue.tracks.concat(tracks);
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  clearQueue() {
    this.queue.tracks = [];
    this.dataAccess.write('queue', 'master_queue', this.queue);
  }

  updateNowPlaying(track) {
    this.systemStatus = this.dataAccess.get('status', 'system_status');
    this.systemStatus.nowPlaying = track;

    if (track !== '') {
      if (this.systemStatus.history) {
        this.systemStatus.history.unshift(track);
      } else {
        this.systemStatus.history = [track];
      }
    }

    this.dataAccess.write('status', 'system_status', this.systemStatus);
  }

  play() {
    this.initializeQueue();
    if (this.queue && this.queue.tracks && this.queue.tracks.length) {
      console.log(`Now Playing: ${this.queue.tracks[0].path}`);
      this.updateNowPlaying(this.queue.tracks[0]);
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
    } else {
      console.log('Queue playback complete.');
      this.stop();
    }
  }

  stop(token) {
    this.updateNowPlaying('');
    this.queueStatus = status.stopped;
    player.stop(token);
  }

  next(token) {
    if (token) {
      spotify.nextTrack(token);
    } else {
      if (this.queueStatus === status.playing) {
        this.stop();
      }

      if (this.queue.tracks.length) {
        this.play();
      }
    }
  }

  removeFromQueue(tracks) {
    const queue = this.getQueue();
    const updatedTracks = [];
    queue.forEach((track) => {
      let found = false;
      tracks.forEach((deleteTrack) => {
        if (track.path === deleteTrack.path) {
          found = true;
        }
      });

      if (!found) {
        updatedTracks.push(track);
      }
      this.clearQueue();
      this.enqueueTracks(updatedTracks);
    });
  }
}

module.exports = Queue;
