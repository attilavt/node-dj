const tools = require('./tools');
const fs = require('fs');
let dj;

const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };
const debug = true;
const log = tools.logGenerator(() => debug, "player");

class Player {
    constructor(fileName) {
        this.fileName = fileName;
        this.inputStream = fs.createReadStream(this.fileName);
    }

    play() {
        log("Starting to play ", this.fileName);
        // this.inputStream.pipe(decoder).pipe(speaker);
        setTimeout(() => {
            log("mock play issues next playNextSong()");
            playNextSong();
        }, 10000);
    }

    stop() {
        log("Stopping to play ", this.fileName);
        //  this.inputStream.unpipe(decoder).unpipe(speaker);
        this.inputStream.close();
    }
}

let currentPlayer;

const playSong = function () {
    log("playSong() called");
    currentPlayer = new Player(dj.getCurrentSong().path);
    currentPlayer.play();
}
const playNextSong = function () {
    log("playNextSong() called");
    dj.switchToNextSong();
}
module.exports = {
    skipSong: function () {
        currentPlayer.stop();
        playSong();
    },
    start: function () {
        playSong();
    },
    setDj: function (theDj) {
        dj = theDj;
    },
};