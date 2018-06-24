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
let speaker;
const decoder = new lame.Decoder;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const playSong = function (path, callbackWhenDone) {
    log("playSong called with", path);
    speaker = new Speaker(audioOptions);
    debug("Speaker initialized");
    // Read the first file
    let inputStream = fs.createReadStream(path);
    debug("Read stream created");
    // Pipe the read data into the decoder and then out to the speakers
    const date1 = new Date().valueOf();
    inputStream.pipe(decoder);
    //inputStream.pipe(decoder).pipe(speaker);
    const date2 = new Date().valueOf();
    debug("Stream piped to decoder and speaker");
    speaker.on('error', function (e) {
        log("speaker error", e);
    });
    speaker.on('flush', async function () {
        const date3 = new Date().valueOf();
        log("finished playing", path, "after", date3 - date1, "ms /", date3 - date2, "ms");
        log("speaker", speaker);
        log("checking writable state");
        while (!speaker._writableState.ended) {
            log("Starting to sleep", speaker);
            const date4 = new Date().valueOf();
            await sleep(100);
            const date5 = new Date().valueOf();
            log("Slept", date5 - date4);
        }

        //speaker.end();
        //inputStream.destroy();
        // Play next song, if there is one.
        callbackWhenDone();
    });
    setTimeout(callbackWhenDone, 2000);
}
module.exports = {
    playSong: playSong,
};