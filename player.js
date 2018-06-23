const lame = require('node-lame');
var Speaker = require('speaker');
const tools = require('./tools');
const fs = require('fs');
const dj = require('./dj');

const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };
const debug = true;
const log = tools.logGenerator(() => debug, "player");
const speaker = new Speaker(audioOptions);
speaker.on('flush', function () {
    log("Done playing");
    dj.switchToNextSong();
});
const decoder = new lame.Decoder;

class Player {
    constructor(fileName) {
        this.fileName = fileName;
        log("Creating input stream");
        this.inputStream = fs.createReadStream(this.fileName);
        log("Done creating input stream");
    }

    play() {
        log("Starting to play ", this.fileName);
        this.inputStream.pipe(decoder).pipe(speaker);
    }

    stop() {
        log("Stopping to play ", this.fileName);
        this.inputStream.unpipe(decoder).unpipe(speaker);
        this.inputStream.close();
    }
}

let currentPlayer;

const play = function () {
    currentPlayer = new Player(dj.getCurrentSong().path);
    currentPlayer.play();
}
module.exports = {
    skipSong: function () {
        currentPlayer.stop();
        play();
    },
    start: function () {
        play();
    },
};