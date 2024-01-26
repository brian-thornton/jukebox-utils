const dataAccess = require('./data-access');
const log = require('./log');
const player = require('./player');

const { logError, logInfo } = log;
const status = {
  playing: 'Playing',
  stopped: 'Stopped',
};

let queueStatus = status.stopped;

const initializeQueue = () => {
  let queue = dataAccess.get('queue', 'master_queue');
  if (!queue.tracks || !queue.tracks.length) {
    queue = {
      tracks: [],
    };

    dataAccess.write('queue', 'master_queue', queue);
  }
};

const getQueue = (start, limit) => {
  initializeQueue();
  const queue = dataAccess.get('queue', 'master_queue');
  const queueTracks = [];
  queue.tracks.forEach((track) => {
    queueTracks.push({
      name: track.name,
      path: track.path,
    });
  });

  return {
    tracks: start >= 0 && limit ? queueTracks.slice(start, limit) : queueTracks,
    totalTracks: queue.tracks.length,
  };
};

const modifyQueue = (modifier) => {
  const queue = dataAccess.get('queue', 'master_queue');
  modifier(queue);
  dataAccess.write('queue', 'master_queue', queue);
};

const enqueue = (track) => {
  modifyQueue(queue => queue.tracks.push(track));
};

const enqueueTop = (track) => {
  modifyQueue(queue => queue.tracks.unshift(track));
};

const enqueueTracks = (tracks) => {
  modifyQueue(queue => queue.tracks = queue.tracks.concat(tracks));
};

const enqueueTracksTop = (tracks) => {
  modifyQueue(queue => {
    if (queue.tracks.length) {
      queue.tracks = tracks.concat(queue.tracks);
    } else {
      enqueueTracks(tracks);
    }
  });
};

const clearQueue = () => {
  modifyQueue(queue => queue.tracks = []);
};

const updateNowPlaying = (track) => {
  const systemStatus = dataAccess.get('status', 'system_status');
  systemStatus.nowPlaying = track;

  if (track !== '') {
    if (systemStatus.history) {
      systemStatus.history.unshift(track);
    } else {
      systemStatus.history = [track];
    }
  }

  dataAccess.write('status', 'system_status', systemStatus);
};

let queueMonitor;

const stop = () => {
  clearInterval(queueMonitor);
  updateNowPlaying('');
  queueStatus = status.stopped;
  player.stop();
};

const play = () => {
  initializeQueue();
  const q = getQueue();
  if (q && q.tracks && q.tracks.length) {
    logInfo(`Starting playback: ${q.tracks[0].path}`);
    updateNowPlaying(q.tracks[0]);
    queueStatus = status.playing;
    player.play(q.tracks[0]);
    q.tracks.shift();
    dataAccess.write('queue', 'master_queue', q);
    if (queueStatus === status.playing) {
      queueMonitor = setInterval(() => {
        player.isPlaying().then((isPlaying) => {
          if (!isPlaying) {
            clearInterval(queueMonitor);
            play();
          }
        }).catch((e) => logError(e));
      }, 2000);
    }
  } else {
    logInfo('Queue playback complete.');
    stop();
  }
};

const next = (token) => {
  if (queueStatus === status.playing) {
    stop();
  }

  const queue = dataAccess.get('queue', 'master_queue');

  if (queue.tracks.length) {
    play();
  }
};

const removeFromQueue = (tracksToRemove) => {
  modifyQueue(queue => {
    queue.tracks = queue.tracks.filter(track => !tracksToRemove.some(t => t.path === track.path));
  });
};

module.exports = {
  clearQueue,
  enqueue,
  enqueueTop,
  enqueueTracks,
  enqueueTracksTop,
  getQueue,
  initializeQueue,
  next,
  play,
  removeFromQueue,
  stop,
  updateNowPlaying,
};
