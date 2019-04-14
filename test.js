const Librarian = require('./lib/librarian');
const Player = require('./lib/player');
const player = new Player();
const Volume = require('./lib/volume');
const volume = new Volume();
const librarian = new Librarian({
  dataAccessOptions: {
    type: 'file',
    storageLocation: './storage'
  }
});

const library = {
  name: 'done',
  path: '/Users/thornton/Desktop/done'
}

//librarian.add(library);
//librarian.scan(library);
const tracks = librarian.getTracks();
console.log(tracks);
player.play(tracks[0]);

setTimeout(function () {
  console.log('here');
  player.stop();

}, 10000);

