// Handle IE missing console
if (window.console == undefined) {
	window.console = {
		log : function() {
			//nothing...
		}
	}
}

function FORMAT_MARKERS_TEXT(markers, log) {
		if (log == undefined) {
				log == true;
		}


		for (var i = 0; i < markers.length; i++) {
				if (markers[i].icon) {
						//append image to legend
						if (log) {
								console.log('name before', markers[i].name);
						}

						var height = markers[i].iconSize && markers[i].iconSize.length > 0 ? markers[i].iconSize[0] : 24;
						var style = 'vertical-align: middle; height:'+height+'px';
						markers[i].name += '&nbsp;<img style="'+style+'" src="static/markers/'+markers[i].icon+'"/>';

						if (log) {
								console.log('name after', markers[i].name);
						}
				}
				for (var world in markers[i].markers) {
						for (var m = 0; m <  markers[i].markers[world].length; m++) {
								if (log) {
										console.log("text before", markers[i].markers[world][m].text);
								}


								//newlines to line breaks
								markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/\n/g, '<br/>');

								//surround text with <b>
								markers[i].markers[world][m].text = '<div style="font-weight: bold; text-align: center;">'+markers[i].markers[world][m].text+'</div>';

								//append text with x, y, z
								var pos = markers[i].markers[world][m].pos;

								markers[i].markers[world][m].text += '<div style="text-align: center; border-top: solid black 1px;">x:'+pos[0] +', z:'+pos[1]+', y:'+pos[2]+'</div>';
								if (log) {
										console.log("text after", markers[i].markers[world][m].text);
								}
						}
				}
		}
		return markers;

}

CLEANUP_RENDERER = document.createElement("div");
function CLEANUP_MARKERS(markers, log){
	if (log == undefined) {
		log == true;
	}
	for (var i = 0; i < markers.length; i++) {
		for (var world in markers[i].markers) {
			// loop in reverse so we can remove elements
			for (var m = markers[i].markers[world].length - 1; m >= 0; m--) {
				if (log) {
					console.log("title before", markers[i].markers[world][m].title);
					console.log("text before", markers[i].markers[world][m].text);
				}
			
				// quotes
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/\\"/g, '&quot;');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/\\"/g, '&quot;');

				// <
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/</g, '&lt;');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/</g, '&lt;');

				// >
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/>/g, '&gt;');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/>/g, '&gt;');

				//extraneous quotes
				//markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/"/g, '');
				//markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/"/g, '');
		
				// unicode references \u0000 
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/\\u(\w{4})/g, '&#x$1;');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/\\u(\w{4})/g, '&#x$1;');
			
				// actual newlines
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/\\n/g, '\n');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/\\n/g, '\n');
			
				// backslashes
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.replace(/\\\\/g, '\\');
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.replace(/\\\\/g, '\\');

				//trim
				markers[i].markers[world][m].title = markers[i].markers[world][m].title.trim();
				markers[i].markers[world][m].text = markers[i].markers[world][m].text.trim();			

				if (markers[i].markers[world][m].title == "" && markers[i].markers[world][m].text == "") {
					if (log) {
						console.log("Empty text, removed marker", markers[i].markers[world][m]);
					}
					markers[i].markers[world].splice(m, 1);
				} else {
					// remove html and entities from title attribute
					CLEANUP_RENDERER.innerHTML = markers[i].markers[world][m].title;
		   	 		markers[i].markers[world][m].title = CLEANUP_RENDERER.textContent;
				
					if (log) {
						console.log("title after", markers[i].markers[world][m].title);
						console.log("text after", markers[i].markers[world][m].text);
					}
				}
			}
		}
	}
	return markers;
}

function CONVERT_ENTITIES_TO_MARKERS(entities, log_info) {
		if (log_info == undefined) {
				// we still log errs if false
				log_info = true;
		}

		if (window.MAPCRAFTER_MARKERS_GENERATED == undefined) {
				console.log("MAPCRAFTER_MARKERS_GENERATED is undefined");
				return;
		}
		if (window.MARKERS_WORLDS == undefined) {
				console.log("MARKERS_WORLDS is undefined");
				return;
		}

	var markers = {};

		var dimensions = {
				'i-1': [], // nether
				'i0': [],  // overworld
				'i1': [] // theend
		}
		for (var key in MARKERS_WORLDS) {
				if (MARKERS_WORLDS[key] == "theend") {
						dimensions['i1'].push(key);
				} else if (MARKERS_WORLDS[key] == "nether") {
						dimensions['i-1'].push(key);
				} else if (MARKERS_WORLDS[key] == "overworld") {
						dimensions['i0'].push(key);
				} else {
						console.log("Unknown dimension", MARKERS_WORLDS[key]);
				}
		}
		if (log_info) {
				console.log('dimensions', dimensions);
		}

		for (var e=0; e<entities.length; e++) {
				var entity = entities[e];
				if (log_info) {
					console.log("entity", entity);
				}
		if (entity.name == undefined) {
			if (log_info) {
				console.log("entity name is null", entity);
			}
		} else if (entity.Pos == undefined || entity.Pos.length != 3) {
						console.log("entity has invalid Pos array", entity);
				} else if (entity.Dimension == undefined || (entity.Dimension != -1 && entity.Dimension != 1 && entity.Dimension != 0)) {
						console.log("entity has invalid Dimension", entity);
				} else {
						var relevant_worlds = dimensions['i'+entity.Dimension];
						for (var i=0;i<relevant_worlds.length; i++) {
								var world = relevant_worlds[i];

								var pos = [Math.round(entity.Pos[0]), Math.round(entity.Pos[2]),Math.round(entity.Pos[1])];
								// Horse has prefix Entity
								var type = entity.type != undefined ? entity.type.replace(/^Entity/, '') : 'Unknown';
								var text = entity.name;

								if (type == 'Player') {
										text = entity.name+'\n<img src="https://minotar.net/avatar/'+entity.name+'/64"/>';
								} else {
					text = entity.name+'\n('+type+')';
				}
								var marker = {
										pos: pos,
										title: entity.name,
										text: text
								};

								// show xp
								if (entity.XpLevel != undefined) {
										marker.text += '\nExperience: '+entity.XpLevel;
								}
								if (entity.filetimestamp != undefined) {
										var modified = new Date(0); // The 0 there is the key, which sets the date to the epoch
										modified.setUTCSeconds(entity.filetimestamp);
										marker.text += '\n'+modified.toString().replace(/ GMT.+/, '');
								}
								if (markers[world] == undefined) {
										markers[world] = [];
								}
								markers[world].push(marker);
						}
				}
		}

		if (log_info) {
				console.log("Entity markers are", markers);
		}

	return markers;
}

function ADD_NAMED_TO_MARKERS(log_info) {
		if (log_info == undefined) {
				// we still log errs if false
				log_info = true;
		}
		if (window.NAMED_ENTITIES == undefined) {
				 console.log("NAMED_ENTITIES is undefined");
				return;
		}
		var markers = CONVERT_ENTITIES_TO_MARKERS(NAMED_ENTITIES, log_info);

		for (var i = 0; i < MAPCRAFTER_MARKERS_GENERATED.length; i++) {
				if (MAPCRAFTER_MARKERS_GENERATED[i].id == "_named_") {
						MAPCRAFTER_MARKERS_GENERATED[i].markers = markers;
						return;
				}
		}
		console.log("No markers group named _named_ found!!");
}


function ADD_PLAYERS_TO_MARKERS(log_info) {
	if (log_info == undefined) {
		// we still log errs if false
		log_info = true;
	}
		if (window.PLAYER_LOCATIONS == undefined) {
				 console.log("PLAYER_LOCATIONS is undefined");
				return;
		}

	var players = [];
	for (var uuid in PLAYER_LOCATIONS) {
		var player = PLAYER_LOCATIONS[uuid];

		players.push(player);
	}

	var markers = CONVERT_ENTITIES_TO_MARKERS(players, log_info);

	for (var i = 0; i < MAPCRAFTER_MARKERS_GENERATED.length; i++) {
		if (MAPCRAFTER_MARKERS_GENERATED[i].id == "_players_") {
			MAPCRAFTER_MARKERS_GENERATED[i].markers = markers;
			return;
		}
	}
	console.log("No markers group named _players_ found!!");
}

//console.log('MARKERS_WORLDS', MARKERS_WORLDS);
//console.log('PLAYER_LOCATIONS', PLAYER_LOCATIONS);

//console.log('MAPCRAFTER_MARKERS BEFORE CLEANUP_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);
//MAPCRAFTER_MARKERS = CLEANUP_MARKERS(MAPCRAFTER_MARKERS, false);
//console.log('MAPCRAFTER_MARKERS AFTER CLEANUP_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);

//console.log('MAPCRAFTER_MARKERS_GENERATED BEFORE CLEANUP_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);
MAPCRAFTER_MARKERS_GENERATED = CLEANUP_MARKERS(MAPCRAFTER_MARKERS_GENERATED, false);
//console.log('MAPCRAFTER_MARKERS_GENERATED AFTER CLEANUP_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);

//console.log('MAPCRAFTER_MARKERS_GENERATED BEFORE ADD_PLAYERS_TO_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);
ADD_PLAYERS_TO_MARKERS(false);
//console.log('MAPCRAFTER_MARKERS_GENERATED AFTER ADD_PLAYERS_TO_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);

//console.log('MAPCRAFTER_MARKERS_GENERATED BEFORE ADD_NAMED_TO_MARKERS()', MAPCRAFTER_MARKERS_GENERATED)
ADD_NAMED_TO_MARKERS(false);
//console.log('MAPCRAFTER_MARKERS_GENERATED AFTER ADD_NAMED_TO_MARKERS()', MAPCRAFTER_MARKERS_GENERATED);

//console.log('MAPCRAFTER_MARKERS BEFORE FORMAT_MARKERS_TEXT()', MAPCRAFTER_MARKERS);
MAPCRAFTER_MARKERS = FORMAT_MARKERS_TEXT(MAPCRAFTER_MARKERS, false);
//console.log('MAPCRAFTER_MARKERS AFTER FORMAT_MARKERS_TEXT()', MAPCRAFTER_MARKERS);

//console.log('MAPCRAFTER_MARKERS_GENERATED BEFORE FORMAT_MARKERS_TEXT()', MAPCRAFTER_MARKERS_GENERATED);
MAPCRAFTER_MARKERS_GENERATED = FORMAT_MARKERS_TEXT(MAPCRAFTER_MARKERS_GENERATED, false);
//console.log('MAPCRAFTER_MARKERS_GENERATED AFTER FORMAT_MARKERS_TEXT()', MAPCRAFTER_MARKERS_GENERATED);

// refresh every 60 seconds
//MAPCRAFTER_RELOAD = setInterval(function(){
//	window.location.reload();
//}, 60000);
window.addEventListener('load', function(){
	var refresh = document.createElement('div');
	refresh.setAttribute('class', 'control-wrapper');
	refresh.setAttribute('style', 'position: absolute; right: 5px; bottom: 15px;');
	var text = document.createTextNode("Page: ");
	refresh.appendChild(text);	

	var button = document.createElement('input');
	button.type='button';
	button.value='Refresh';
	button.onclick=function(){window.location.reload(true);};

	refresh.appendChild(button);

	document.getElementsByTagName('body')[0].appendChild(refresh);
}, false);
//
