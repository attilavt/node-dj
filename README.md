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
* dj.js->play() sets currentSong and currentAlbum, calls player.start()
* player.js->start() calls playSong, which instantiates a new Player and calls player.play()
* player.js->Player->play() pipes the file inputstream into decoder and speaker
* player.js->speaker sends 'flush' signal when done playing; event listener calls playNextSong()
* player.js->playNextSong() calls dj.js->switchToNextSong()
* dj.js->switchToNextSong() sets currentSong and currentAlbum, then calls player.start()

# Setup
## Windows
For developing and running on windows, the following command must first be run as administrator:
Press windows key -> enter "Powershell" -> right click and choose "Run as administrator" -> enter command
`npm install --global --production windows-build-tools`

## Linux (ubuntu)
For developing and running on linux, the following command must first be run:
`sudo apt-get install -y libasound2-dev make gcc g++`