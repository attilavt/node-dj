const tools = require('./tools');
const { spawn } = require('child_process');

const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "player");
const debug = tools.logGenerator(() => logDebug, "player");
let isPlaying = false;

/** @type {string} */
let randomNoOfCurrentSong;

/** @type {import('child_process').ChildProcessWithoutNullStreams} */
let currentProcess;

/** @type {string} */
let currentSongPath;

const clearCurrentSongData = function(source, whichSong) {
    if(whichSong && whichSong !== currentSongPath) {
        log('Not clearing current song data from', source);
        return;
    }
    log('Clearing current song data from', source, 'for', currentSongPath);
    randomNoOfCurrentSong = undefined;
    currentProcess = undefined;
    currentSongPath = undefined;
};

const stopPlayback = function () {
    if (!currentProcess) {
        log("Why is there no currentProcess?", randomNoOfCurrentSong, currentSongPath);
        return;
    }
    log("Stopping playback of old song:", currentSongPath);
    isPlaying = false;
    currentProcess.kill();
    clearCurrentSongData('stopPlayback');
};

const playSong = function (path, callbackWhenDone, dj) {
    stopPlayback();
    log("playSong called with", path);

    const timestampStart = new Date().valueOf();
    isPlaying = true;
    const randomNoOfThis = "" + Math.random();
    randomNoOfCurrentSong = randomNoOfThis;
    currentSongPath = path;

    const exitFunction = function(code, signal) {
        const timestampExit = new Date().valueOf();
        if(signal === 'SIGTERM') {
            log("SIGTERM for", path, "after", tools.msToTime(timestampExit - timestampStart), '= not calling callback. received:', code, signal);
        } else if(randomNoOfCurrentSong !== randomNoOfThis) {
            log("finished playing", path, "after", tools.msToTime(timestampExit - timestampStart), 'with signal', signal, 'but player has already progressed to', currentSongPath, '= not calling callback.');
        } else {
            log("finished playing", path, "after", tools.msToTime(timestampExit - timestampStart), code, signal);
            isPlaying = false;
            clearCurrentSongData('exitFunction success', currentSongPath);
            callbackWhenDone(dj);
        }
    };

    /** @param {Error} error */
    const errorFunction = function(error) {
        log("speaker error for " + path + ", maybe because of skip?", error);
            const oneSecond = 1 * 1000;
            setTimeout(() => {
                if (randomNoOfCurrentSong === randomNoOfThis) {
                    log("It seems that the music is stuck! Re-issuing playback.");
                    isPlaying = false;
                    clearCurrentSongData('errorFunction', currentSongPath);
                    callbackWhenDone(dj);
                } else {
                    debug("Music seems to play on even after error.");
                }
            }, oneSecond);
    }
    currentProcess = spawn(dj.commandForPlayingFile, [path]);

    currentProcess.on('error', errorFunction);
    currentProcess.on('exit', exitFunction);
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