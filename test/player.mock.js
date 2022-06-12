const tools = require('./tools');

const logLog = true;
const log = tools.logGenerator(() => logLog, "player");
let isPlaying = false;

const stopPlayback = function () {
    if (isPlaying) {
        log("Stopping playback of old song...");
        isPlaying = false;
    }
};

const playSong = function (path, callbackWhenDone, dj) {
    stopPlayback();
    log("playSong called with", path);

    log("Starting to play ", path);
    isPlaying = true;
    setTimeout(() => {
        log("mock play issues callbackWhenDone()");
        isPlaying = false;
        callbackWhenDone(dj);
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