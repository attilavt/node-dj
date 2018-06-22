const express = require('express');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const port = 3001;
const dj = require('./dj');

let data = {};

const runPreconditions = {
    optionsRead: false,
    timesRead: false,
    serverRunnning: false
};

const pickOne = function (list) {
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    return list[index];
}

const getHour = function () {
    return new Date().getHours();
}

const getGenreNames = function () {
    const hour = getHour();
    for (let time of data.times.time_slots) {
        if (hour > (time.start % 24) && hour < (time.end % 24)) {
            log("Returning genre names", time.genre_names);
            return time.genre_names;
        }
    }
    throw "No valid time found for hour " + hour;
}

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
    res.send('OK');
});

const log = function () {
    let toLog = "";
    for (let arg of arguments) {
        if (typeof arg === "object") {
            console.log("arg is object", arg);
            toLog += safeStringify(arg) + " ";
        } else {
            toLog += arg + " ";
        }
    }
    console.log(`${new Date().toISOString()} ${toLog}`);
};

const throwError = function (res, code, msg) {
    res.status(code).send(msg);
    throw `${code} - ${msg}`;
};

const safeStringify = function (obj) {
    try {
        return JSON.stringify(obj);
    } catch (err) {
        console.log("Catching1");
        let firstLevel = true;
        const replacer = function (key, value) {
            if (typeof value === "object" && firstLevel) {
                firstLevel = false;
                return value;
            }
            if (typeof value === "object" && !firstLevel) {
                return "an object";
            }
            return value;
        }
        return JSON.stringify(obj, replacer);

    }
};

const handleRequest = function (req) {
    log(`${req.method} ${req.url} received`);
};

const ru = function (fieldName) {
    app.get('/' + fieldName, function (req, res) {
        handleRequest(req);
        res.send(data[fieldName]);
    });
    app.put('/' + fieldName, function (req, res) {
        handleRequest(req);
        if (req.body === undefined || typeof req.body !== "object" || Object.keys(req.body).length <= 0) {
            throwError(res, 400, 'error');
        }
        log(`PUT /${fieldName} to ${safeStringify(req.body)}`);
        data[fieldName] = req.body;
        res.send('OK');
    });
};

app.get('/hour', function (req, res) {
    handleRequest(req);
    res.send({ hour: getHour() });
});

app.get('/genre-names', function (req, res) {
    handleRequest(req);
    res.send({ genre_names: getGenreNames() });
});

app.get('/genre-name', function (req, res) {
    handleRequest(req);
    res.send({ genre_name: pickOne(getGenreNames()) });
});

app.get('/next-song', function (req, res) {
    handleRequest(req);
    res.send({ song_name: dj.pickNextSong() });
});

ru('times');
ru('options');

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