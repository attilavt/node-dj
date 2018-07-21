# node-dj
node-dj is a parametrizable mp3 jukebox that chooses mp3s based on pre-defined time slots.
## Required parameters:
* options.json -> library_path: The folder where the mp3 files are to be found.
* options.json -> folder_separator: The symbol separating folders, e.g. `\\` for windows systems or `/` for mac/unix systems
* times.json -> time_slots: Object representing a time slot in which to define which genres are applicable for the respective time

## Expected folder structure:
* Genre folder: library/<genre>
* Songs without album: library/<genre>/<filename>.mp3
* Songs within album: library/<genre>/<albumname>/<filename>.mp3

## Lifecycle
* Pre-run actions like readState, readOptions
* index.js->run() calls dj.js->play()
* dj.js->play() sets currentSong and currentAlbum, calls player.playSong() with dj.switchToNextSong() as callback what to do when done playing
* player.js->playSong closes the old speaker (if applicable), instantiates a new speaker and pipes data to it. when the new speaker is done playing, the callback dj.switchToNextSong() is carried out
* dj.switchToNextSong() writes the last song into the history and calls playSong() (see above)

# Next features
* NDJ-0001: restrict NO_ALBUM to x songs
* NDJ-0002: add interface to control volume (https://github.com/jkeylu/node-mpg123-util)
* NDJ-0003: Install script for raspberry pi
* NDJ-0004: ?? add persistent metadata file (surviving library reload)
* NDJ-0005: add option to disable autoplaying music on startup
* NDJ-0006: allow running app without defining times
* NDJ-0007: consider history when picking a new album
* NDJ-0008: pick a certain song as next
* NDJ-0009: pick a certain album as next

# Setup
## Windows
For developing and running on windows, the following command must first be run as administrator:
Press windows key -> enter "Powershell" -> right click and choose "Run as administrator" -> enter command
`npm install --global --production windows-build-tools`

## Linux (ubuntu)
For developing and running on linux, the following command must first be run:
`sudo apt-get install -y libasound2-dev make gcc g++`