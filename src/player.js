const tools = require('./tools');
const { exec, ChildProcess } = require('child_process');

const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "player");
const debug = tools.logGenerator(() => logDebug, "player");
let isPlaying = false;

/** @type {string} */
let currentSpeaker;

/** @type {ChildProcess} */
let currentProcess;

const stopPlayback = function () {
    if (currentProcess) {
        log("Stopping playback of old song...");
        isPlaying = false;
        currentProcess.kill(9);
    }
};

const playSong = function (path, callbackWhenDone, dj) {
    stopPlayback();
    log("playSong called with", path);

    const date1 = new Date().valueOf();
    isPlaying = true;
    const date2 = new Date().valueOf();
    const randomNoOfThis = "" + Math.random();
    currentSpeaker = randomNoOfThis;
    /**
     * @param {import('child_process').ExecException} error 
     * @param {string} stdout 
     * @param {string} stderr 
     */
    const callbackForCommandline = function (error, stdout, stderr) {
        log(`stdout ${stdout}`);
        log(`stderr ${stderr}`);
        if(!error) {
            const date3 = new Date().valueOf();
            log("finished playing", path, "after", tools.msToTime(date3 - date1));
            isPlaying = false;
            callbackWhenDone(dj);
        } else {
            log("speaker error for " + path + ", maybe because of skip?", error, stdout, stderr);
            const tenSeconds = 10 * 1000;
            setTimeout(() => {
                if (currentSpeaker === randomNoOfThis) {
                    log("It seems that the music is stuck! Re-issuing playback.");
                    isPlaying = false;
                    callbackWhenDone(dj);
                } else {
                    debug("Music seems to play on even after error.");
                }
            }, tenSeconds);
        }
    };
    currentProcess = exec(`${dj.commandForPlayingFile} "${path}"`, callbackForCommandline);
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