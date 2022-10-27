const fetch = require('node-fetch');

class VLCAdapter {
  constructor() {

  }

  play(url) {
    fetch(`http://:jukebox@localhost:8080/requests/status.json?command=in_play&input=${url}`)
      .then(response => console.log(response));
  };

  stop() {
    fetch(`http://:jukebox@localhost:8080/requests/status.json?command=pl_stop`)
      .then(response => console.log(response));
  };

  async status() {
    try {
      const data = await fetch(`http://:jukebox@localhost:8080/requests/status.json`)
      const response = await data.json();
      console.log(response)
      return response;
    } catch {
      console.log('VLC Service Unavailable');
      return {
        error: 'VLC Service Unavailable'
      };
    }
  };
}
module.exports = VLCAdapter;
