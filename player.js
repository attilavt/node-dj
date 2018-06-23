const lame = require('lame');
var Speaker = require('speaker');
const tools = require('./tools');
const fs = require('fs');
let dj;

const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };
const logLog = true;
const logDebug = true;
const log = tools.logGenerator(() => logLog, "player");
const debug = tools.logGenerator(() => logDebug, "player");
const speaker = new Speaker(audioOptions);
speaker.on('flush', function () {
    log("Done playing");
    playNextSong();
});
const decoder = new lame.Decoder;

class Player {
    constructor(fileName) {
        this.fileName = fileName;
        debug("Creating read stream for", fileName);
        this.inputStream = fs.createReadStream(this.fileName);
        debug("Created read stream for", fileName);
    }

    play() {
        log("Starting to play ", this.fileName);
        this.inputStream.pipe(decoder).pipe(speaker);
        debug("Successfully started to play ", this.fileName);
    }

    stop() {
        log("Stopping to play ", this.fileName);
        this.inputStream.unpipe(decoder).unpipe(speaker);
        this.inputStream.close();
        debug("Successfully stopped to play ", this.fileName);
    }
}

let currentPlayer;

const playSong = function () {
    debug("playSong() called");
    if (currentPlayer) {
        currentPlayer.stop();
    }
    currentPlayer = new Player(dj.getCurrentSong().path);
    currentPlayer.play();
}
const playNextSong = function () {
    debug("playNextSong() called");
    // currentPlayer.stop();
    dj.switchToNextSong();
}
module.exports = {
    skipSong: function () {
        // currentPlayer.stop();
        playSong();
    },
    start: function () {
        playSong();
    },
    setDj: function (theDj) {
        dj = theDj;
    },
};