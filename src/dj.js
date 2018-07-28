const logLog = true;
const logDebug = false;
let log;
let debug;

/**
 * Writes given state into the state file using given tools
 * @param {Object} tools The tools to use for writing the state file
 * @param {Object} state The state to write into the state file
 */
const writeState = (tools, state) => {
    const stateCopy = { ...state };
    stateCopy.library = null;
    tools.writeFile('data/state.json', JSON.stringify(stateCopy));
};

/**
 * 
 * @param {Object} data 
 * @param {String[]} parts 
 * @returns {String} the new path
 */
const buildPath = (data, parts) => {
    let result = data.options.library_folder;
    for (let arg of parts) {
        result += data.options.folder_separator + arg;
    }
    return result;
};

const NO_ALBUM = "NO_ALBUM";

/**
 * Creates a song object from given parameters
 * @param {Object} album The album object
 * @param {String} songFileName The file name of the song
 * @returns {Object} A song object
 */
const song = (album, songFileName) => {
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

/**
 * @param {Object} song
 * @returns {String} a readable representation of the song object 
 */
const readableSong = function (song) {
    if (!song) {
        return "no song!";
    }
    return song.artist + (song.song ? " - \"" + song.song + "\"" : "");
}

/**
 * @param {Object} album
 * @returns {String} a readable representation of the album object 
 */
const readableAlbum = function (album) {
    if (!album) {
        return "no album!";
    }
    return album.name + " of " + album.genre;
}

/**
 * @param {String} genreName Name of the genre to which the album belongs
 * @param {String} albumName Name of the album
 * @returns {Object} The album object 
 */
const album = function (genreName, albumName) {
    return {
        name: albumName,
        genre: genreName,
        songs: []
    };
};

export class Dj {
    constructor(tools, fs, player) {
        this.tools = tools;
        this.fs = fs;
        this.player = player;

        this.stateHolder = {
            state: {
                currentSong: null,
                currentAlbum: null,
                history: []
            }
        };

        this.data = null;

        this.dateOfLastPlaySongAction = null;

        log = tools.logGenerator(() => logLog, "dj");
        debug = tools.logGenerator(() => logDebug, "dj");
    }

    readLibrary() {
        const lib = this.data.options.library_folder;
        log("Starting to read library.");
        const start = new Date().valueOf();
        const rootCallback = function (err, rootFiles) {
            let newLibrary = {};
            if (err) {
                log("error when reading library root", err);
            } else {
                for (let genreFolderName of rootFiles) {
                    if (!this.fs.lstatSync(lib + this.data.options.folder_separator + genreFolderName).isDirectory()) {
                        log("skipping", genreFolderName, "since it is not a directory");
                        continue;
                    }

                    const genreFolderPath = buildPath(genreFolderName);
                    const genreObj = {};
                    if (this.fs.statSync(genreFolderPath).isDirectory()) {
                        const albumFolderNames = this.fs.readdirSync(genreFolderPath);
                        const noAlbumAlbum = album(genreFolderName, NO_ALBUM);
                        for (let albumFolderName of albumFolderNames) {
                            const albumFolderPath = buildPath(this.data, [genreFolderName, albumFolderName]);
                            if (this.fs.statSync(albumFolderPath).isDirectory()) {
                                const songsInAlbumFolder = this.fs.readdirSync(albumFolderPath);
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
        this.fs.readdir(lib, rootCallback);
    };
};

const pickOne = function (tools, list) {
    if (!list || typeof list !== "object") {
        throw "cannot pick from list " + tools.safeStringify(list);
    }
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    debug("picked " + index + " from list " + this.tools.safeStringify(list));
    return list[index];
};

const pickOneFromObject = function (objectWithKeys) {
    if (!objectWithKeys || typeof objectWithKeys !== "object") {
        throw "cannot pick from object " + this.tools.safeStringify(objectWithKeys);
    }
    const list = Object.keys(objectWithKeys);
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    debug("picked " + index + " from object " + this.tools.safeStringify(list));
    return objectWithKeys[list[index]];
};

const isLastSongOfAlbum = function (album, songFileName) {
    return album.songs.indexOf(songFileName) === album.songs.length - 1;
};

const pickNextAlbum = function () {
    log("picking next album...");
    const genres = getGenreNames();
    let albums = [];
    for (let genre of genres) {
        if (Object.keys(stateHolder.state.library).indexOf(genre) < 0) {
            log("Genre " + genre + " picked from times.json has no entry in library!");
        }
        else {
            const genreObject = stateHolder.state.library[genre];
            const genreAlbumNames = Object.keys(genreObject);
            for (let genreAlbumName of genreAlbumNames) {
                albums.push(genreObject[genreAlbumName]);
            }
        }
    }
    let album;
    do {
        album = pickOne(albums);
        debug("preliminarily picked album", album.name, "with", album.songs.length, "songs. Will be checked...");
    } while (!album || album.songs.length === 0);
    if (album.name === NO_ALBUM) {
        album = { ...album };
        this.tools.shuffle(album.songs);
        const maxTrackCount = data.options.no_album_max_track_count;
        if (maxTrackCount && album.songs.length > maxTrackCount) {
            log("Reducing no_album copy's songs to just " + maxTrackCount);
            album.songs = album.songs.slice(0, maxTrackCount);
        }
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
    const hour = this.tools.getHour();
    for (let time of data.times.time_slots) {
        if (this.tools.isBetweenHours(hour, time.start, time.end)) {
            log("Returning genre names", time.genre_names, "for hour", hour);
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

    const thereIsNoCurrentAlbum = state().currentAlbum === null;
    const currentAlbumsLastSongWasPlayed = thereIsNoCurrentAlbum ? false : isLastSongOfAlbum(state().currentAlbum, state().currentSong);
    const currentAlbumDoesNotFitInTime = thereIsNoCurrentAlbum ? false : getGenreNames().indexOf(state().currentAlbum.genre) < 0;

    if (thereIsNoCurrentAlbum || currentAlbumsLastSongWasPlayed || currentAlbumDoesNotFitInTime) {
        log("picking a new album! Why? thereIsNoCurrentAlbum ", thereIsNoCurrentAlbum, "currentAlbumsLastSongWasPlayed",
            currentAlbumsLastSongWasPlayed, "currentAlbumDoesNotFitInTime", currentAlbumDoesNotFitInTime);
        nextSongAlbum = pickNextAlbum();
        nextSong = getFirstSongInAlbum(nextSongAlbum);
    } else {
        log("picking next song of current album! (" + readableAlbum(state().currentAlbum) + ")");
        nextSongAlbum = state().currentAlbum;
        nextSong = getNextSongInAlbum(nextSongAlbum, state().currentSong);
    }
    return { song: nextSong, album: nextSongAlbum };
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

const currentMusic = function () {
    try {
        return {
            song: readableSong(state().currentSong),
            album: readableAlbum(state().currentAlbum),
            time_playing: this.tools.timeSince(dateOfLastPlaySongAction)
        };
    } catch (err) {
        return { song: "Error in currentMusic(): " + err, album: "Error" };
    }
};

const switchToNextSong = function () {
    writeSongIntoHistory(state().currentSong);
    const before = currentMusic();
    pickTrackAndPlay();
    const after = currentMusic();
    writeState();
    return { before: before, after: after };
};

const switchToNextAlbum = function () {
    writeSongIntoHistory(state().currentSong);
    const before = currentMusic();
    const album = pickNextAlbum();
    state().currentAlbum = album;
    state().currentSong = getFirstSongInAlbum(album);
    const after = currentMusic();
    justPlay();
    writeState();
    return { before: before, after: after };
};

const pickTrackAndPlay = function () {
    const next = whatWillBeTheNextSong();
    state().currentSong = next.song;
    state().currentAlbum = next.album;
    justPlay();
};

const continueMusic = function () {
    if (this.player.isPlaying()) {
        throw "player is already playing!";
    }
    pickTrackAndPlay();
    return currentMusic();
};

const stopMusic = function () {
    if (!this.player.isPlaying()) {
        throw "player is not playing!";
    }
    this.player.stopPlayback();
};

const justPlay = function () {
    dateOfLastPlaySongAction = new Date();
    this.player.playSong(state().currentSong.path, switchToNextSong);
};

/**
 * @param {string} item The name of the file or directory
 * @returns {number} The file size of all mp3 files in the file or directory, in MB (rounded to two decimals) 
 */
const readSizeRecursive = (item) => {
    const stats = this.fs.lstatSync(item);
    let totalMb = (stats.size / (1024 * 1024));
    if (stats.isDirectory()) {
        const list = this.fs.readdirSync(item);
        for (let diritem of list) {
            const size = readSizeRecursive(item + data.options.folder_separator + diritem);
            totalMb += size;
        }
        log("file size of FOLDER " + item, totalMb, "MB");
    } else {
        if (!this.tools.endsWith(item, ".mp3")) {
            return 0;
        }
        log("file size of FILE " + item, totalMb, "MB");
    }
    return Math.floor(totalMb * 100) / 100;
}

/**
 * @param {string} genreName The name of the genre
 * @returns {number} The file size of all mp3 files in the folder, in MB (rounded to two decimals) 
 */
const computeGenreFileSize = (genreName) => {
    return readSizeRecursive(data.options.library_folder + data.options.folder_separator + genreName);
};

const libraryStats = () => {
    const library = { ...state().library };
    const result = {
        genres: {},
        time_slots: {},
    };
    log("Stats for lib ", library);

    let genreFileSizesMb = {};
    for (let genreName of Object.keys(library)) {
        const genre = library[genreName];
        log("Stats for genre " + genreName, genre);
        const genreFileSizeMb = computeGenreFileSize(genreName);
        genreFileSizesMb[genreName] = genreFileSizeMb;
        const genreData = {
            album_amount: Object.keys(genre).length,
            no_album_track_count: genre["NO_ALBUM"].songs.length,
            music_file_size: genreFileSizeMb + " MB",
        };
        result.genres[genreName] = genreData;
    }

    for (let timeSlot of data.times.time_slots) {
        let timeSlotFileSizeMb = 0;
        for (let genreName of timeSlot.genre_names) {
            timeSlotFileSizeMb += genreFileSizesMb[genreName];
        }
        timeSlotFileSizeMb = this.tools.roundStringWithDecimals(timeSlotFileSizeMb, 2);
        result.time_slots[timeSlot.start + "-" + timeSlot.end] = timeSlotFileSizeMb + " MB";
    }

    return result;
};

module.exports = {
    getGenreNames: getGenreNames,
    pickOne: pickOne,
    setData: function (dataFromIndexJs, callbackLibrary, callbackState) {
        data = dataFromIndexJs;
        callbackWhenLibraryRead = callbackLibrary;
        this.tools.readFile(stateHolder, 'state', 'data/state.json', () => { readLibrary(); callbackState(); }, false);
    },
    pickNextSong: whatWillBeTheNextSong,
    getLibrary: function () {
        return stateHolder.state.library;
    },
    readLibrary: readLibrary,
    getSongs: getSongs,
    play: continueMusic,
    stopMusic: stopMusic,
    getCurrentSong: currentMusic,
    switchToNextSong: switchToNextSong,
    switchToNextAlbum: switchToNextAlbum,
    musicIsPlaying: () => player.isPlaying(),
    libraryStats: libraryStats,
};