
const player = require('./player');

const basePath = "D:\\attila\\Music\\node-dj\\Dubstep Heap\\";
const songPaths = ["07_-_laugh", "07_-_laugh", "09_-_miss", "09_-_miss", "07_-_laugh", "07_-_laugh", "09_-_miss"];
let currentIndex = 0;

const switchToNextSong = function () {
    currentIndex++;
    console.log("Switching to index", currentIndex);
    if (currentIndex >= songPaths.length) {
        console.log("Reached end of playlist");
        return;
    }
    playSong();
};

const playSong = function () {
    console.log("Playsong called with", currentIndex);
    player.playSong(basePath + songPaths[currentIndex] + ".mp3", switchToNextSong);
};

playSong();