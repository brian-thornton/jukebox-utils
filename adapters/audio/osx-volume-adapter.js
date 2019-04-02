const { exec } = require('child_process');

class OSXVolumeAdapter {
  static getVolume() {
    const promise = new Promise((resolve, reject) => {
      exec("osascript -e 'output volume of (get volume settings)'", (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    return promise;
  }

  static isMuted() {
    const promise = new Promise((resolve, reject) => {
      exec("osascript -e 'output muted of (get volume settings)'", (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.toString().trim() === 'true');
        }
      });
    });

    return promise;
  }

  static increaseVolume() {
    OSXVolumeAdapter.getVolume().then((currentVolume) => {
      let newVolume = parseInt(currentVolume, 10);
      newVolume += 5;
      exec(`osascript -e 'set Volume output volume ${newVolume}'`);
    });
  }

  static decreaseVolume() {
    OSXVolumeAdapter.getVolume().then((currentVolume) => {
      let newVolume = parseInt(currentVolume, 10);
      newVolume -= 5;
      exec(`osascript -e 'set Volume output volume ${newVolume}'`);
    });
  }

  static toggleMute() {
    OSXVolumeAdapter.isMuted().then((muted) => {
      exec(`osascript -e 'set volume output muted ${!muted}'`);
    });
  }
}
module.exports = OSXVolumeAdapter;
