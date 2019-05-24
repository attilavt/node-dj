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

# Setup
## Windows
For developing and running on windows, the following command must first be run as administrator:

Press windows key -> enter "Powershell" -> right click and choose "Run as administrator" -> enter command
`npm install --global --production windows-build-tools`

## Linux (ubuntu)
The first step would be to carry out `install-linux-prepull.sh`, which does the following:
* Installing git and the ssh server
* Making sure that the ssh daemon is run on boot with the following command: `sudo systemctl enable sshd.service`.
* Cloning this repository and carrying out `install-linux.sh`.
If you have already checked out the repository and do not need ssh, you can also simply carry out `install-linux.sh`, which does the following:
* Installing dependencies
* Building node-dj and node-dj-controller
* Generating the run-script `run.sh`
* Generating the string to copy into crontab and opening crontab
If necessary, set the correct time zone, issue the following command: `sudo timedatectl set-timezone "Europe/Istanbul"`
If you are running node-dj on a raspberry pi, don't forget to set the audio output with `sudo raspi-config`

# Integration tests
Run `integration_tests.sh` to run a local instance and the server, wait until it's up and then run the integration tests.
