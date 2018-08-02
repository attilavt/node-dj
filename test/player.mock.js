const tools = require('./tools');
const fs = require('fs');

const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "player");
const debug = tools.logGenerator(() => logDebug, "player");
let inputStream;
let isPlaying = false;

const stopPlayback = function () {
    if (isPlaying) {
        log("Stopping playback of old song...");
        inputStream.close();
        //inputStream.unpipe(speaker).unpipe(decoder);
        isPlaying = false;
    }
};

const playSong = function (path, callbackWhenDone, dj) {
    stopPlayback();
    log("playSong called with", path);
    inputStream = fs.createReadStream(path);

    log("Starting to play ", path);
    isPlaying = true;
    // this.inputStream.pipe(decoder).pipe(speaker);
    setTimeout(() => {
        log("mock play issues callbackWhenDone()");
        isPlaying = false;
        callbackWhenDone();
    }, 10000);
}
module.exports = {
    /**
     * If existing, stops any running playbacks. Then starts the playback of the mp3 file with given path.
     * @param {string} path The path to the mp3 file to be played.
     * @param {function} callbackWhenDone The function to call when done playing.
     * @param {object} dj The dj instance to use as a parameter when calling callbackWhenDone()
     */
    playSong: playSong,

    /**
     * If existing, stops any running playbacks. 
     */
    stopPlayback: stopPlayback,

    /**
     * @returns {boolean} whether there is currently a playback
     */
    isPlaying: () => isPlaying,
};