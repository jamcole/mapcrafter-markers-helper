## About

A wrapper for *mapcrafter_markers* from [mapcrafter](http://mapcrafter.org) (*[github](https://github.com/mapcrafter/mapcrafter)*) that adds:

* Player locations
* Named Entity locations (ex: mobs with name tags, like your horse)

![Example Image](https://raw.githubusercontent.com/mapcrafter/mapcrafter-markers-helper/blob/master/example.png)

As per the mapcrafter documentation, mapcrafter_markers will generate a markers_generated.js with *prefixed* sign locations for usage on your map.

This script uses [minecraft-data-utils](https://github.com/jamcole/minecraft-data-utils) to post-process the markers-generated.js file from mapcrafter_markers and append the additional markers.

This was written for my personal use, the bash script is pretty ugly, so I'm open to suggestions for improvement.

## Requirements

* **[mapcrafter](http://mapcrafter.org)** (*[github](https://github.com/mapcrafter/mapcrafter)*)
* standard linux environment (bash etc)
* **dirname**
* **python 2.x**
* **[minecraft-data-utils](https://github.com/jamcole/minecraft-data-utils)**
	* namedEntities2json, allplayerBasics2json (they will depend on other utils)

## Usage

1. Generate a map using [mapcrafter](http://mapcrafter.org)
2. Insure that *mapcrafter_markers* can run successfully (You probably want to add your spawn point to markers.js in the generated map).
3. Append the *[mapcrafter.example.conf](https://github.com/mapcrafter/mapcrafter-markers-helper/blob/master/mapcrafter.example.conf)* contents to the bottom of your *mapcrafter.conf* file.
	* The marker:\_named\_ and marker:\_players\_ are all that's needed by this wrapper.
	* If you copy all the config, signs that start with the [marker] or [home] prefix will also have their own sections on the map.
4. Run mapcrafter_markers.sh instead of mapcrafter_markers. (*The first run may take a while because it has to look at every region file and contact the mojang api for nicknames to build the local caches.*)

## Important Notes

* The [minecraft-data-utils](https://github.com/jamcole/minecraft-data-utils) programs will leave cached .yaml files along side your game data, so whichever user runs this program will need write access to those directories.
* We only read the minecraft files, never write to them, but anything can happen; it's always a good idea to backup your minecraft world beforehand.
