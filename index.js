const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;

let runOptions = {};

const run = function () {
    console.log("Running with options", runOptions);
    const audioOptions = { channels: 2, bitDepth: 16, sampleRate: 44100 };

    // Create Decoder and Speaker
    const decoder = lame.Decoder();
    let speaker = new Speaker(audioOptions);
};

// respond with "hello world" when a GET request is made to the homepage
app.get('/health', function (req, res) {
    res.send('OK')
});

app.listen(port, function () {
    console.log("Listening");
    fs.readFile('options.json', function (err, data) {
        if (err) {
            console.error("Error", err);
            throw err;
        }
        runOptions = JSON.parse(data);
        run();
    });
});