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

# Setup
For developing and running on windows, the following command must first be run as administrator:
Press windows key -> enter "Powershell" -> right click and choose "Run as administrator" -> enter command
`npm install --global --production windows-build-tools`