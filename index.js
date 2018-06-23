const express = require('express');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const port = 3001;
const dj = require('./dj');
const tools = require('./tools');

let data = {
    options: {
        library_folder: ".",
        folder_separator: "/"
    }
};

const runPreconditions = {
    optionsRead: false,
    timesRead: false,
    serverRunnning: false,
    libraryInitialized: false,
    djStateInitialized: false,
};

const debug = true;
const log = tools.logGenerator(() => debug, "index");

const run = function () {
    let unready = [];
    for (let key of Object.keys(runPreconditions)) {
        const value = runPreconditions[key];
        if (!value) {
            unready.push(key);
        }
    }
    if (unready.length !== 0) {
        console.log("Not yet ready:", unready);
        return;
    }
    console.log("Running with options", data.options);
    console.log("Running with times", data.times);

    dj.play();
};

// respond with "hello world" when a GET request is made to the homepage
app.get('/health', function (req, res) {
    res.send('OK');
});

const throwError = function (res, code, msg) {
    res.status(code).send(msg);
    throw `${code} - ${msg}`;
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
    res.send({ hour: tools.getHour() });
});

app.get('/genre-names', function (req, res) {
    handleRequest(req);
    res.send({ genre_names: dj.getGenreNames() });
});

app.get('/genre-name', function (req, res) {
    handleRequest(req);
    res.send({ genre_name: dj.pickOne(dj.getGenreNames()) });
});

app.get('/library', function (req, res) {
    handleRequest(req);
    res.send({ library: dj.getLibrary() });
});

app.put('/library', function (req, res) {
    handleRequest(req);
    dj.readLibrary();
    res.send({ "status": "Started reading library..." });
});

app.get('/next-song', function (req, res) {
    handleRequest(req);
    res.send({ song: dj.pickNextSong() });
});

app.get('/songs', function (req, res) {
    handleRequest(req);
    res.send({ songs: dj.getSongs() });
});

app.put('/skip', function (req, res) {
    handleRequest(req);
    dj.switchToNextSong();
    res.send({ "status": "Issuing request to switch to next song..." });
});

ru('times');
ru('options');

app.listen(port, function () {
    console.log("Listening on port", port);
    runPreconditions.serverRunnning = true;
    run();
});

const readFile = function (fieldName, optionalCallback) {
    const callback = function () {
        runPreconditions[fieldName + 'Read'] = true;
        if (optionalCallback) {
            optionalCallback();
        }
        run();
    };
    tools.readFile(data, fieldName, callback, false);
};

readFile('options', () => {
    dj.setData(data, () => {
        runPreconditions.libraryInitialized = true;
        run();
    }, () => {
        runPreconditions.djStateInitialized = true;
        run();
    });
});
readFile('times');