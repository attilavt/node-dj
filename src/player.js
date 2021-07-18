const Decoder = require('minimp3');
var Speaker = require('speaker');
const tools = require('./tools');
const fs = require('fs');

const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };
const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "player");
const debug = tools.logGenerator(() => logDebug, "player");
let speaker;
let inputStream;
let decoder;
let isPlaying = false;

const stopPlayback = function () {
    if (speaker) {
        log("Stopping playback of old song...");
        //inputStream.unpipe(speaker).unpipe(decoder);
        isPlaying = false;
        speaker.close();
    }
};

let currentSpeaker;

const playSong = function (path, callbackWhenDone, dj) {
    stopPlayback();
    log("playSong called with", path);
    decoder = new Decoder();

    decoder.on('error', function (e) {
        log("decoder error", e);
    });

    speaker = new Speaker(audioOptions);
    debug("Speaker initialized");

    inputStream = fs.createReadStream(path);
    debug("Read stream created");

    const date1 = new Date().valueOf();
    isPlaying = true;
    inputStream.pipe(decoder).pipe(speaker);
    const date2 = new Date().valueOf();
    const randomNoOfThis = "" + Math.random();
    currentSpeaker = randomNoOfThis;
    debug("Stream piped to decoder and speaker");

    speaker.on('flush', function () {
        const date3 = new Date().valueOf();
        log("finished playing", path, "after", tools.msToTime(date3 - date1));
        debug("speaker", speaker);
        speaker = null;
        inputstream = null;
        decoder = null;
        isPlaying = false;
        callbackWhenDone(dj);
    });

    speaker.on('error', function (e, b) {
        log("speaker error for " + path + ", maybe because of skip?", e, b);
        const tenSeconds = 10 * 1000;
        setTimeout(() => {
            if (currentSpeaker === randomNoOfThis) {
                log("It seems that the music is stuck! Re-issuing playback.");
                speaker = null;
                inputstream = null;
                decoder = null;
                isPlaying = false;
                callbackWhenDone(dj);
            } else {
                debug("Music seems to play on even after error.");
            }
        }, tenSeconds);
    });
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
