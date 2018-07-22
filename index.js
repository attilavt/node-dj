const express = require('express');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const port = 3001;
const dj = require('./src/dj');
const tools = require('./src/tools');
const path = require('path');

// allow cors requests
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let data = {
    options: {
        library_folder: ".",
        folder_separator: "/",
        no_album_max_track_count: 10
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
        log("Not yet ready:", unready);
        return;
    }
    log("Running with options", data.options);
    log("Running with times", data.times);

    dj.play();
};

app.use(express.static(path.join(__dirname, "frontend", "build")));

// respond with "hello world" when a GET request is made to the homepage
app.get('/api/health', function (req, res) {
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
    app.get('/api/' + fieldName, function (req, res) {
        handleRequest(req);
        res.send(data[fieldName]);
    });
    app.put('/api/' + fieldName, function (req, res) {
        handleRequest(req);
        if (req.body === undefined || typeof req.body !== "object" || Object.keys(req.body).length <= 0) {
            throwError(res, 400, 'error');
        }
        log(`PUT /api/${fieldName} to ${safeStringify(req.body)}`);
        data[fieldName] = req.body;
        res.send('OK');
    });
};

app.get('/api/hour', function (req, res) {
    handleRequest(req);
    res.send({ hour: tools.getHour(), utc_offset: tools.getUtcOffset() });
});

app.get('/api/genre-names', function (req, res) {
    handleRequest(req);
    res.send({ genre_names: dj.getGenreNames() });
});

app.get('/api/genre-name', function (req, res) {
    handleRequest(req);
    res.send({ genre_name: dj.pickOne(dj.getGenreNames()) });
});

app.get('/api/library', function (req, res) {
    handleRequest(req);
    res.send({ library: dj.getLibrary() });
});

app.put('/api/library', function (req, res) {
    handleRequest(req);
    dj.readLibrary();
    res.send({ "status": "Started reading library..." });
});

app.get('/api/next-song', function (req, res) {
    handleRequest(req);
    res.send({ song: dj.pickNextSong() });
});

app.get('/api/current-song', function (req, res) {
    handleRequest(req);
    const song = dj.getCurrentSong();
    song.isPlaying = dj.musicIsPlaying();
    res.send({ song: song });
});

app.get('/api/songs', function (req, res) {
    handleRequest(req);
    res.send({ songs: dj.getSongs() });
});

app.put('/api/skip-track', function (req, res) {
    handleRequest(req);
    const currentMusic = dj.switchToNextSong();
    currentMusic.status = "Issued request to switch to next track...";
    res.send(currentMusic);
});

app.put('/api/skip-album', function (req, res) {
    handleRequest(req);
    const currentMusic = dj.switchToNextAlbum();
    currentMusic.status = "Issued request to switch to next album...";
    res.send(currentMusic);
});

app.put('/api/music-stop', function (req, res) {
    handleRequest(req);
    dj.stopMusic();
    res.send({ status: "Issued request to stop music." });
});

app.put('/api/music-start', function (req, res) {
    handleRequest(req);
    const currentMusic = dj.play();
    currentMusic.status = "Issued request to start music.";
    res.send(currentMusic);
});

ru('times');
ru('options');

app.get('/api/ip-addresses', function (req, res) {
    handleRequest(req);
    res.send(tools.getIpAddresses());
});

app.listen(port, function () {
    log("Listening on port", port);
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