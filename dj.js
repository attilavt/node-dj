const tools = require('./tools');
const debug = true;
const log = tools.logGenerator(() => debug, "dj");
const fs = require('fs');

const writeState = function () {
    fs.writeFile('state.json', JSON.stringify(state), function (err) {
        log("error when writing state!");
    });
};

let stateHolder = {
    state: {
        currentSong: null,
        currentAlbum: null
    }
};

tools.readFile(stateHolder, 'state', () => { });

let data = null;


const pickOne = function (list) {
    const size = list.length;
    const index = Math.floor(Math.random() * size);
    return list[index];
};

const isLastSongOfAlbum = function (album, songFileName) {
    return album.songs.indexOf(songFileName) === album.songs.length - 1;
};

const pickNextAlbum = function () {
    log("picking next album");
    return { songs: ["hi", "ho", "are", "you"] };
};

const getFirstSongInAlbum = function (album) {
    return album.songs[0];
};

const getNextSongInAlbum = function (album, currentSong) {
    const index = album.songs.indexOf(currentSong);
    return album.songs[index + 1];
};

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

const whatWillBeTheNextSong = function () {
    log("picking next song...");
    let nextSongAlbum, nextSong;
    if (state.currentAlbum === null || isLastSongOfAlbum(state.currentAlbum, state.currentSong)) {
        nextSongAlbum = pickNextAlbum();
        nextSong = getFirstSongInAlbum(nextSongAlbum);
    } else {
        log("picking next song of current album!");
        nextSongAlbum = state.currentAlbum;
        nextSong = getNextSongInAlbum(nextSongAlbum, state.currentSong);
    }
    return nextSong;
};

module.exports = {
    getGenreNames: getGenreNames,
    pickOne: pickOne,
    setData: function (dataFromIndexJs) {
        data = dataFromIndexJs;
    },
    pickNextSong: whatWillBeTheNextSong
};