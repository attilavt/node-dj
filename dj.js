const tools = require('./tools');
const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "dj");
const debug = tools.logGenerator(() => logDebug, "dj");
const fs = require('fs');
const player = require('./player');

const writeState = function () {
    tools.writeFile('data/state.json', JSON.stringify(state()));
};

let stateHolder = {
    state: {
        currentSong: null,
        currentAlbum: null,
        history: []
    }
};

let data = null;

const buildPath = function () {
    let result = data.options.library_folder;
    for (let arg of arguments) {
        result += data.options.folder_separator + arg;
    }
    return result;
};

const NO_ALBUM = "NO_ALBUM";
const song = function (album, songFileName) {
    if (songFileName.indexOf(".mp3") !== (songFileName.length - 4)) {
        debug("Is not an mp3 file, skipping: ", songFileName);
        return;
    }
    const songFileNameClean = songFileName.substring(0, songFileName.length - 4);
    const songFileNameCleanSplit = songFileNameClean.split(" - ");
    const songName = songFileNameCleanSplit[1];
    const artistName = songFileNameCleanSplit[0];
    const path = album.name === NO_ALBUM ? buildPath(album.genre, songFileName) : buildPath(album.genre, album.name, songFileName);
    album.songs.push({
        genre: album.genre,
        album: album.name,
        artist: artistName,
        song: songName,
        songFileName: songFileNameClean,
        path: path,
    });
}

const readableSong = function (song) {
    if (!song) {
        return "no song!";
    }
    return song.artist + (song.song ? " - \"" + song.song + "\"" : "");
}

const album = function (genreName, albumName) {
    return {
        name: albumName,
        genre: genreName,
        songs: []
    };
};

const readLibrary = function () {
    const lib = data.options.library_folder;
    log("Starting to read library.");
    const start = new Date().valueOf();
    const rootCallback = function (err, rootFiles) {
        let newLibrary = {};
        if (err) {
            log("error when reading library root", err);
        } else {
            for (let genreFolderName of rootFiles) {
                const genreFolderPath = buildPath(genreFolderName);
                const genreObj = {};
                if (fs.statSync(genreFolderPath).isDirectory()) {
                    const albumFolderNames = fs.readdirSync(genreFolderPath);
                    const noAlbumAlbum = album(genreFolderName, NO_ALBUM);
                    for (let albumFolderName of albumFolderNames) {
                        const albumFolderPath = buildPath(genreFolderName, albumFolderName);
                        if (fs.statSync(albumFolderPath).isDirectory()) {
                            const songsInAlbumFolder = fs.readdirSync(albumFolderPath);
                            let albumObj = album(genreFolderName, albumFolderName);
                            for (let songName of songsInAlbumFolder) {
                                song(albumObj, songName);
                            }
                            genreObj[albumFolderName] = albumObj;
                        } else {
                            song(noAlbumAlbum, albumFolderName);
                        }
                    }
                    genreObj[NO_ALBUM] = noAlbumAlbum;
                }
                newLibrary[genreFolderName] = genreObj;
            }
            stateHolder.state.library = newLibrary;
            const end = new Date().valueOf();
            // log("Finished reading library: ", newLibrary);
            log("Finished reading library. (", end - start, "ms )");
            callbackWhenLibraryRead();
        }
    };
    fs.readdir(lib, rootCallback);
};

const pickOne = function (list) {
    if (!list || typeof list !== "object") {
        throw "cannot pick from list " + tools.safeStringify(list);
    }
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    debug("picked " + index + " from list " + tools.safeStringify(list));
    return list[index];
};

const pickOneFromObject = function (objectWithKeys) {
    if (!objectWithKeys || typeof objectWithKeys !== "object") {
        throw "cannot pick from object " + tools.safeStringify(objectWithKeys);
    }
    const list = Object.keys(objectWithKeys);
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    debug("picked " + index + " from object " + tools.safeStringify(list));
    return objectWithKeys[list[index]];
};

const isLastSongOfAlbum = function (album, songFileName) {
    return album.songs.indexOf(songFileName) === album.songs.length - 1;
};

const pickNextAlbum = function () {
    log("picking next album...");
    const genre = pickOne(getGenreNames());
    log("picked genre ", genre);
    if (Object.keys(stateHolder.state.library).indexOf(genre) < 0) {
        throw "Genre " + genre + " picked from times.json has no entry in library!";
    }
    let album;
    do {
        album = pickOneFromObject(stateHolder.state.library[genre]);
        debug("picked album?", album.name, "with", album.songs.length, "songs");
    } while (!album || album.songs.length === 0);
    if (album.name === NO_ALBUM) {
        tools.shuffle(album.songs);
    }
    log("picked album! ", album.name, "with", album.songs.length, "songs");
    return album;
};

const getFirstSongInAlbum = function (album) {
    return album.songs[0];
};

const getNextSongInAlbum = function (album, currentSong) {
    const index = album.songs.indexOf(currentSong);
    return album.songs[index + 1];
};

const getGenreNames = function () {
    const hour = tools.getHour();
    for (let time of data.times.time_slots) {
        if (tools.isBetweenHours(hour, time.start, time.end)) {
            debug("Returning genre names", time.genre_names);
            return time.genre_names;
        }
    }
    throw "No valid time found for hour " + hour;
}

const state = function () {
    return stateHolder.state;
}

const whatWillBeTheNextSong = function () {
    log("picking a song to be played after", readableSong(state().currentSong));
    let nextSongAlbum, nextSong;
    if (state().currentAlbum === null || isLastSongOfAlbum(state().currentAlbum, state().currentSong)) {
        nextSongAlbum = pickNextAlbum();
        nextSong = getFirstSongInAlbum(nextSongAlbum);
    } else {
        log("picking next song of current album!");
        nextSongAlbum = state().currentAlbum;
        nextSong = getNextSongInAlbum(nextSongAlbum, state().currentSong);
    }
    return nextSong;
};

const getSongs = function () {
    let result = [];
    for (let genreName of Object.keys(state().library)) {
        const genre = state().library[genreName];
        for (let albumName of Object.keys(genre)) {
            const album = genre[albumName];
            for (let song of album.songs) {
                result.push(song);
            }
        }
    }
    return result;
}

let callbackWhenLibraryRead;

const findAlbumByNames = function (genreName, albumName) {
    for (let loopGenreName of Object.keys(state().library)) {
        const genre = state().library[loopGenreName];
        if (loopGenreName === genreName) {
            debug("matched genre", genreName, Object.keys(genre));
            for (let loopAlbumName of Object.keys(genre)) {
                const album = genre[loopAlbumName];
                if (albumName === loopAlbumName) {
                    return album;
                } else {
                    debug("did not match album", albumName, album);
                }
            }
        }
    }
    throw "Could not find album with name " + albumName + " in genre with name " + genreName + " in lib with " + Object.keys(state().library);
};

const writeSongIntoHistory = function (song) {
    const date = new Date();
    state().history.push({ timestamp: date.valueOf(), time: date.toString(), song: song });
}

const switchToNextSong = function () {
    writeSongIntoHistory(state().currentSong);
    playSong();
    writeState();
};

const playSong = function () {
    state().currentSong = whatWillBeTheNextSong();
    state().currentAlbum = findAlbumByNames(state().currentSong.genre, state().currentSong.album);
    player.playSong(state().currentSong.path, switchToNextSong);
};

module.exports = {
    getGenreNames: getGenreNames,
    pickOne: pickOne,
    setData: function (dataFromIndexJs, callbackLibrary, callbackState) {
        data = dataFromIndexJs;
        callbackWhenLibraryRead = callbackLibrary;
        readLibrary();
        tools.readFile(stateHolder, 'state', () => { callbackState(); }, false);
    },
    pickNextSong: whatWillBeTheNextSong,
    getLibrary: function () {
        return stateHolder.state.library;
    },
    readLibrary: readLibrary,
    getSongs: getSongs,
    play: playSong,
    getCurrentSong: function () {
        return state().currentSong;
    },
    switchToNextSong: switchToNextSong
};