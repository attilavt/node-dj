const lame = require('lame');
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

const playSong = function (path, callbackWhenDone) {
    if (speaker) {
        log("Stopping playback of old song...");
        //inputStream.unpipe(speaker).unpipe(decoder);
        speaker.close();
    }
    log("playSong called with", path);
    decoder = new lame.Decoder;

    decoder.on('error', function (e) {
        log("decoder error", e);
    });

    speaker = new Speaker(audioOptions);
    debug("Speaker initialized");

    inputStream = fs.createReadStream(path);
    debug("Read stream created");

    const date1 = new Date().valueOf();
    inputStream.pipe(decoder).pipe(speaker);
    const date2 = new Date().valueOf();
    debug("Stream piped to decoder and speaker");

    speaker.on('flush', function () {
        const date3 = new Date().valueOf();
        log("finished playing", path, "after", tools.msToTime(date3 - date1));
        debug("speaker", speaker);
        speaker = null;
        inputstream = null;
        decoder = null;
        callbackWhenDone();
    });

    speaker.on('error', function (e, b) {
        log("speaker error", e, b);
    });
}
module.exports = {
    playSong: playSong,
};