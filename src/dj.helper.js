const tools = require('./tools');
const nodePath = require('path');
const fs = require('fs');

const log = tools.logGenerator(() => true, "djh");
const debug = tools.logGenerator(() => true, "(djh)");
const NO_ALBUM = "NO_ALBUM";

const readSizeRecursive = (item) => {
    const stats = fs.lstatSync(item);
    let totalMb = (stats.size / (1024 * 1024));
    if (stats.isDirectory()) {
        const list = fs.readdirSync(item);
        for (let diritem of list) {
            const size = readSizeRecursive(nodePath.join(item, diritem));
            totalMb += size;
        }
        log("file size of FOLDER " + item, totalMb, "MB");
    } else {
        if (!tools.endsWith(item, ".mp3")) {
            return 0;
        }
        log("file size of FILE " + item, totalMb, "MB");
    }
    return Math.floor(totalMb * 100) / 100;
};

module.exports = {
    /**
    * Writes given state into the state file
    * @param {object} state The state to write into the state file
    */
    writeState: (state) => {
        if (!state) {
            console.warn("Attempting to write empty state!");
            return;
        }
        const stateCopy = { ...state };
        stateCopy.library = null;
        tools.writeFile('data/state.json', JSON.stringify(stateCopy));
    },

    /**
    * @param {object} song
    * @returns {string} a readable representation of the song object 
    */
    readableSong: (song) => {
        if (!song) {
            return "no song!";
        }
        return song.artist + (song.song ? " - \"" + song.song + "\"" : "");
    },

    /**
    * @param {object} album
    * @returns {string} a readable representation of the album object 
    */
    readableAlbum: (album) => {
        if (!album) {
            return "no album!";
        }
        return album.name + " of " + album.genre;
    },

    /**
    * Creates an album object from given parameters
    * @param {string} genreName Name of the genre to which the album belongs
    * @param {string} albumName Name of the album
    * @returns {object} The album object 
    */
    album: (genreName, albumName) => {
        return {
            name: albumName,
            genre: genreName,
            songs: []
        };
    },

    /**
    * Creates a song object from given parameters
    * @param {object} album The album object
    * @param {string} songFileName The file name of the song
    * @param {string} libPath The path of the library root
    * @returns {object} A song object
    */
    song: (album, songFileName, libPath) => {
        if (songFileName.indexOf(".mp3") !== (songFileName.length - 4)) {
            debug("Is not an mp3 file, skipping: ", songFileName);
            return;
        }
        const songFileNameClean = songFileName.substring(0, songFileName.length - 4);
        const songFileNameCleanSplit = songFileNameClean.split(" - ");
        const songName = songFileNameCleanSplit[1];
        const artistName = songFileNameCleanSplit[0];
        const path = album.name === NO_ALBUM ? nodePath.join(libPath, album.genre, songFileName) : nodePath.join(libPath, album.genre, album.name, songFileName);
        album.songs.push({
            genre: album.genre,
            album: album.name,
            artist: artistName,
            song: songName,
            songFileName: songFileNameClean,
            path: path,
        });
    },

    /**
     * @param {object} album the album object to inspect
     * @param {string} songFileName the file name of the song to inspect
     * @returns {boolean} whether the song with given name is the last within given album 
     */
    isLastSongOfAlbum: (album, songFileName) => {
        return album.songs.indexOf(songFileName) === album.songs.length - 1;
    },

    /**
     * @param {object} album the album object to inspect
     * @returns {object} the first song object of the album
     */
    getFirstSongInAlbum: (album) => {
        return album.songs[0];
    },

    /**
    * @param {object} album the album object to inspect
    * @param {object} currentSong the song object of the current song
    * @returns {object} the song object of the song of given album that comes after given song
    */
    getNextSongInAlbum: (album, currentSong) => {
        const index = album.songs.indexOf(currentSong);
        return album.songs[index + 1];
    },

    /**
    * @param {string} item The name of the file or directory
    * @returns {number} The file size of all mp3 files in the file or directory, in MB (rounded to two decimals) 
    */
    readSizeRecursive: readSizeRecursive,
};


