const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;

let data = {};

const runPreconditions = {
    optionsRead: false,
    timesRead: false,
    serverRunnning: false
};

const run = function () {
    for (let key of Object.keys(runPreconditions)) {
        const value = runPreconditions[key];
        if (!value) {
            console.log("Not yet ready:", key);
            return;
        }
    }

    console.log("Running with options", data.options);
    console.log("Running with times", data.times);
    const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };

    // Create Decoder and Speaker
    //const decoder = lame.Decoder();
    //let speaker = new Speaker(audioOptions);
};

// respond with "hello world" when a GET request is made to the homepage
app.get('/health', function (req, res) {
    res.send('OK')
});

app.listen(port, function () {
    console.log("Listening on port", port);
    runPreconditions.serverRunnning = true;
    run();
});

const readFile = function (fieldName) {
    fs.readFile(fieldName + '.json', function (err, readData) {
        if (err) {
            console.error("Error", err);
            throw err;
        }
        data[fieldName] = JSON.parse(readData);
        runPreconditions[fieldName + 'Read'] = true;
        run();
    });
};

readFile('options');
readFile('times');