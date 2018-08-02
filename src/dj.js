const tools = require('./tools');
const logLog = true;
const logDebug = false;
const log = tools.logGenerator(() => logLog, "dj");
const debug = tools.logGenerator(() => logDebug, "dj");
const fs = require('fs');
const player = require('./player');
const djh = require('./dj.helper');
const nodePath = require('path');

const NO_ALBUM = "NO_ALBUM";

const switchToNextSong = (that) => {
    that._writeSongIntoHistory(that._state().currentSong);
    const before = that.currentMusic();
    that._pickTrackAndPlay();
    const after = that.currentMusic();
    djh.writeState(that._state());
    return { before: before, after: after };
};

class Dj {
    constructor() {
        this.stateHolder = {
            state: {
                currentSong: null,
                currentAlbum: null,
                history: []
            }
        };

        this.data = null;
        this.dateOfLastPlaySongAction = null;
    }

    /**
     * Issues reading the library.
     * @param {Function} callbackWhenDoneReadingLibrary The function to call when the library is read
     */
    readLibrary(callbackWhenDoneReadingLibrary) {
        const lib = this.data.options.library_folder;
        log("Starting to read library.");
        const start = new Date().valueOf();
        const that = this;
        const callbackWhenFileRead = (err, rootFiles) => {
            let newLibrary = {};
            if (err) {
                log("error when reading library root", err);
            } else {
                log("Starting to process library");
                for (let genreFolderName of rootFiles) {
                    if (!fs.lstatSync(lib + that.data.options.folder_separator + genreFolderName).isDirectory()) {
                        log("skipping", genreFolderName, "since it is not a directory");
                        continue;
                    }

                    log("starting to process genre folder", genreFolderName);

                    const genreFolderPath = nodePath.join(lib, genreFolderName);
                    const genreObj = {};
                    if (fs.statSync(genreFolderPath).isDirectory()) {
                        const albumFolderOrSongWithoutAlbumNames = fs.readdirSync(genreFolderPath);
                        const noAlbumAlbum = djh.album(genreFolderName, NO_ALBUM);
                        for (let albumFolderOrSongWithoutAlbumName of albumFolderOrSongWithoutAlbumNames) {
                            log("processing genre folder child", albumFolderOrSongWithoutAlbumName);
                            const albumFolderOrSongWithoutAlbumPath = nodePath.join(lib, genreFolderName, albumFolderOrSongWithoutAlbumName);
                            if (fs.statSync(albumFolderOrSongWithoutAlbumPath).isDirectory()) {
                                log("genre folder child", albumFolderOrSongWithoutAlbumName, "is an album folder");
                                const songsInAlbumFolder = fs.readdirSync(albumFolderOrSongWithoutAlbumPath);
                                let albumObj = djh.album(genreFolderName, albumFolderOrSongWithoutAlbumName);
                                for (let songName of songsInAlbumFolder) {
                                    djh.song(albumObj, songName, lib);
                                    log("album folder child", songName, "has been processed");
                                }
                                genreObj[albumFolderOrSongWithoutAlbumName] = albumObj;
                            } else {
                                djh.song(noAlbumAlbum, albumFolderOrSongWithoutAlbumName, lib);
                                log("genre folder child", albumFolderOrSongWithoutAlbumName, "as been processed as a NO_ALBUM file");
                            }
                        }
                        genreObj[NO_ALBUM] = noAlbumAlbum;
                    } else {
                        log("supposed genre folder", genreFolderName, "is not a directory!");
                    }
                    newLibrary[genreFolderName] = genreObj;
                    log("finished processing genre folder", genreFolderName);
                }
                this._state().library = newLibrary;
                const end = new Date().valueOf();
                // log("Finished reading library: ", newLibrary);
                log("Finished reading library. (", end - start, "ms )");
                if (callbackWhenDoneReadingLibrary) {
                    callbackWhenDoneReadingLibrary();
                } else {
                    log("no callback when done reading library defined");
                }
            }
        };
        fs.readdir(lib, callbackWhenFileRead);
    };

    /**
     * @returns {object} an album object for an album whose genre is valid for the current timeframe
     */
    pickNextAlbum() {
        log("picking next album...");
        const genres = this.getGenreNames(this.data);
        let albums = [];
        for (let genre of genres) {
            if (Object.keys(this._state().library).indexOf(genre) < 0) {
                log("Genre " + genre + " picked from times.json has no entry in library!");
            }
            else {
                const genreObject = this._state().library[genre];
                const genreAlbumNames = Object.keys(genreObject);
                for (let genreAlbumName of genreAlbumNames) {
                    albums.push(genreObject[genreAlbumName]);
                }
            }
        }
        let album;
        do {
            album = tools.pickOne(albums);
            debug("preliminarily picked album", album.name, "with", album.songs.length, "songs. Will be checked...");
        } while (!album || album.songs.length === 0);
        if (album.name === NO_ALBUM) {
            album = { ...album };
            tools.shuffle(album.songs);
            const maxTrackCount = this.data.options.no_album_max_track_count;
            if (maxTrackCount && album.songs.length > maxTrackCount) {
                log("Reducing no_album copy's songs to just " + maxTrackCount);
                album.songs = album.songs.slice(0, maxTrackCount);
            }
        }
        log("picked album! ", album.name, "with", album.songs.length, "songs");
        return album;
    }

    /**
     * @returns {array} An array of genre names that are valid for the current hour
     */
    getGenreNames() {
        const hour = tools.getHour();
        for (let time of this.data.times.time_slots) {
            if (tools.isBetweenHours(hour, time.start, time.end)) {
                log("Returning genre names", time.genre_names, "for hour", hour);
                return time.genre_names;
            }
        }
        throw "No valid time found for hour " + hour;
    }

    /**
     * @returns {object} The dj's state
     */
    _state() {
        return this.stateHolder.state;
    }

    /**
     * @returns {object} an object containing a song object and its album, whereas the album's genre is valid for the current hour
     */
    whatWillBeTheNextSong() {
        log("picking a song to be played after", djh.readableSong(this._state().currentSong));
        let nextSongAlbum, nextSong;

        const thereIsNoCurrentAlbum = this._state().currentAlbum === null;
        const currentAlbumsLastSongWasPlayed = thereIsNoCurrentAlbum ? false : djh.isLastSongOfAlbum(this._state().currentAlbum, this._state().currentSong);
        const currentAlbumDoesNotFitInTime = thereIsNoCurrentAlbum ? false : this.getGenreNames().indexOf(this._state().currentAlbum.genre) < 0;

        if (thereIsNoCurrentAlbum || currentAlbumsLastSongWasPlayed || currentAlbumDoesNotFitInTime) {
            log("picking a new album! Why? thereIsNoCurrentAlbum ", thereIsNoCurrentAlbum, "currentAlbumsLastSongWasPlayed",
                currentAlbumsLastSongWasPlayed, "currentAlbumDoesNotFitInTime", currentAlbumDoesNotFitInTime);
            nextSongAlbum = this.pickNextAlbum();
            nextSong = djh.getFirstSongInAlbum(nextSongAlbum);
        } else {
            log("picking next song of current album! (" + djh.readableAlbum(this._state().currentAlbum) + ")");
            nextSongAlbum = this._state().currentAlbum;
            nextSong = djh.getNextSongInAlbum(nextSongAlbum, this._state().currentSong);
        }
        return { song: nextSong, album: nextSongAlbum };
    }

    /**
     * @returns {array} An array of all song objects that are in the library for any album or genre
     */
    getSongs() {
        let result = [];
        for (let genreName of Object.keys(this._state().library)) {
            const genre = this._state().library[genreName];
            for (let albumName of Object.keys(genre)) {
                const album = genre[albumName];
                for (let song of album.songs) {
                    result.push(song);
                }
            }
        }
        return result;
    }

    /**
     * Appends given song to the song history
     * @param {object} song The song to append to the song history 
     */
    _writeSongIntoHistory(song) {
        const date = new Date();
        this._state().history.push({ timestamp: date.valueOf(), time: date.toString(), song: song });
    }

    /**
     * @returns {object} an object containing information about the current song, current album, and playback time
     */
    currentMusic() {
        try {
            return {
                song: djh.readableSong(this._state().currentSong),
                album: djh.readableAlbum(this._state().currentAlbum),
                time_playing: tools.timeSince(this.dateOfLastPlaySongAction)
            };
        } catch (err) {
            return { song: "Error in currentMusic(): " + err, album: "Error" };
        }
    }

    /**
     * Switches to the next song.
     * @returns {object} An object containing information about the songs/albums previous to and following the switch.
     */
    switchToNextSong() {
        return switchToNextSong(this);
    }

    /**
     * Switches to the next album.
     * @returns {object} An object containing information about the songs/albums previous to and following the switch.
     */
    switchToNextAlbum() {
        this._writeSongIntoHistory(this._state().currentSong);
        const before = this.currentMusic();
        const album = this.pickNextAlbum();
        this._state().currentAlbum = album;
        this._state().currentSong = djh.getFirstSongInAlbum(album);
        const after = this.currentMusic();
        this._justPlay();
        djh.writeState(this._state());
        return { before: before, after: after };
    }

    /**
     * Uses whatWillBeTheNextSong() to determine a song and album, writes them into the state, and calls _justPlay().
     */
    _pickTrackAndPlay(data) {
        const next = this.whatWillBeTheNextSong(data);
        this._state().currentSong = next.song;
        this._state().currentAlbum = next.album;
        this._justPlay();
    }

    /**
     * If no music is playing, issues that music is selected and played.
     * @returns {Object} An object describing the music currently playing
     */
    play() {
        if (player.isPlaying()) {
            console.warn("player is already playing!");
            return { "error": "Was already playing" };
        }
        this._pickTrackAndPlay();
        return this.currentMusic();
    }

    /**
     * If music is playing, issues that it is stopped.
     */
    stopMusic() {
        if (!player.isPlaying()) {
            throw "player is not playing!";
        }
        player.stopPlayback();
    }

    /**
     * Takes information from the state on the current song and calls player.js->playSong() with switchToNextSong as callback.
     */
    _justPlay() {
        this.dateOfLastPlaySongAction = new Date();
        player.playSong(this._state().currentSong.path, switchToNextSong, this);
    }

    /**
    * @param {string} genreName The name of the genre
    * @returns {number} The file size of all mp3 files in the folder, in MB (rounded to two decimals) 
    */
    _computeGenreFileSize(genreName) {
        return djh.readSizeRecursive(this.data.options.library_folder + this.data.options.folder_separator + genreName);
    }

    /**
     * @returns {object} An object containing various statistics about the library.
     */
    libraryStats() {
        const library = { ...this._state().library };
        const result = {
            genres: {},
            time_slots: {},
        };
        log("Stats for lib ", library);

        let genreFileSizesMb = {};
        for (let genreName of Object.keys(library)) {
            const genre = library[genreName];
            log("Stats for genre " + genreName, genre);
            const genreFileSizeMb = this._computeGenreFileSize(genreName);
            genreFileSizesMb[genreName] = genreFileSizeMb;
            const genreData = {
                album_amount: Object.keys(genre).length,
                no_album_track_count: genre[NO_ALBUM].songs.length,
                music_file_size: genreFileSizeMb + " MB",
            };
            result.genres[genreName] = genreData;
        }

        for (let timeSlot of this.data.times.time_slots) {
            let timeSlotFileSizeMb = 0;
            for (let genreName of timeSlot.genre_names) {
                timeSlotFileSizeMb += genreFileSizesMb[genreName];
            }
            timeSlotFileSizeMb = tools.floatToStringWithMaxDecimals(timeSlotFileSizeMb, 2);
            result.time_slots[timeSlot.start + "-" + timeSlot.end] = timeSlotFileSizeMb + " MB";
        }

        return result;
    }

    /**
     * Must be used for initally setting the data into the DJ object. Issues that the state and the library are read.
     * State must be already read when starting to read library in order not to overwrite the library with the empty library
     * saved in the state. (The library is not saved in the state file.)
     * @param {Object} dataFromIndexJs The data needed by the DJ
     * @param {Function} callbackLibrary The function to call when the library is read
     * @param {Function} callbackState The function to call when the state is read
     */
    setData(dataFromIndexJs, callbackLibrary, callbackState) {
        this.data = dataFromIndexJs;
        tools.readFile(this.stateHolder, 'state', 'data/state.json', () => { this.readLibrary(callbackLibrary); callbackState(); }, false);
    }

    getLibrary() {
        return this._state().library;
    }

    /**
     * @returns {boolean} whether music is currently playing
     */
    isMusicPlaying() {
        return player.isPlaying();
    }
};

module.exports = {
    /**
     * @returns {Object} a new instance of the dj class
     */
    newInstance: () => new Dj()
};
