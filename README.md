# node-dj
node-dj is a parametrizable mp3 jukebox that automatically plays mp3s, choosing music based on pre-defined time slot - genre folder combinations.

> "You have bought a fiddle. But have you also bought the man who can play the fiddle?"

_Teacher to his pupil, ca. 1937_


## Required parameters
* [command line parameter #0] folder_separator: The symbol separating folders, e.g. `\\` for windows systems or `/` for mac/unix systems
* [command line parameter #1] library_path: The folder where the mp3 files are to be found.
* [file in library path] times.json (see template in `data` folder) -> time_slots: Object representing a time slot in which to define which genres are applicable for the respective time

## Expected folder structure
* Genre folder: `library/<genre>`
* Songs without album: `library/<genre>/<filename>.mp3`
* Songs within album: `library/<genre>/<albumname>/<filename>.mp3`

## Lifecycle
* Pre-run actions like readState
* index.js->run() calls dj.js->play()
* dj.js->play() sets currentSong and currentAlbum, calls player.playSong() with dj.switchToNextSong() as callback what to do when done playing
* player.js->playSong() closes the old speaker (if applicable), instantiates a new speaker and pipes data to it. when the new speaker is done playing, the callback dj.switchToNextSong() is carried out
* dj.switchToNextSong() writes the last song into the history and calls playSong() (see above)

# Features
* NDJ-0001: restrict NO_ALBUM to x songs
* NDJ-0010: interface to get IP addresses
* NDJ-0011: set up controller frontend
* NDJ-0003: Install script for raspberry pi
* NDJ-0016: instead of picking genre first and album second, pick from all albums with qualified genre
* NDJ-0017: make hash of current git commit accessible via web request
* NDJ-0015: read options.json from command line
* NDJ-0014: read times.json from library folder
* NDJ-0020: serve library and times statistics

# Next tasks
(next index: NDJ-0021)
* NDJ-0019: serve logs via web
* NDJ-0012: show last 10 songs
* NDJ-0013: refresh current song automatically
* NDJ-0018: refactor to allow for unit tests & write docu
* NDJ-0002: add interface to control volume (https://github.com/jkeylu/node-mpg123-util)
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
* For developing and running on linux, the following command must first be run:
`sudo apt-get install -y libasound2-dev make gcc g++`
* For making sure that node-dj is run at each startup, I recommend using the following command:
`crontab -e`
and entering the following line:
`@reboot /path/to/script` (where the script should contain switching to the node-dj folder and running the `run.sh` script)
* To make sure that the ssh daemon is run on boot, issue the following command: `sudo systemctl enable sshd.service`.
* To set the correct time zone, issue the following command: `sudo timedatectl set-timezone "Europe/Istanbul"`
* if you are running node-dj on a raspberry pi, don't forget to set the audio output with `sudo raspi-config`
