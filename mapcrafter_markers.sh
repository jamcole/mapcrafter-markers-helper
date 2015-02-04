#!/bin/bash

SCRIPT="`readlink -e \"$0\"`"
SCRIPTPATH="`dirname \"$SCRIPT\"`"

set -o pipefail

show_usage() {
	echo Usage: $0 [-u /path/to/minecraft-data-utils/] [-a /path/to/markers-append.js] [-m /path/to/mapcrafter_markers] /path/to/mapcrafter.conf
}

# Reset in case getopts has been used previously in the shell.
OPTIND=1

# Initialize our own variables:
UTILS_DIR=""
MAPCRAFTER_MARKERS=$(which mapcrafter_markers 2>&1)
APPEND_JS="${SCRIPTPATH}/markers-append.js"

while getopts "h:?:u:a:m:" opt; do
	case "$opt" in
	h|\?)
		show_usage
		exit 0
		;;
	u)  UTILS_DIR=$OPTARG
		if [ ! -d "$UTILS_DIR" ]; then
			echo "Unable to find 'minecraft-data-utils' directory: ${UTILS_DIR}" >&2
			echo "--"
			show_usage
			exit 1
		fi
		;;
	a)  APPEND_JS=$OPTARG
		;;
	m)  MAPCRAFTER_MARKERS=$OPTARG
		;;
	esac
done

shift $((OPTIND-1))
[ "$1" = "--" ] && shift

if [ "$MAPCRAFTER_MARKERS" = "" ] || [ ! -x "$MAPCRAFTER_MARKERS" ]; then
	echo "Unable to find 'mapcrafter_markers' or it is not executable: ${MAPCRAFTER_MARKERS}" >&2
	echo "--"
	show_usage
	exit 1
fi

if [ ! -f "$APPEND_JS" ]; then
	echo "Unable to find 'markers-append.js' file: ${APPEND_JS}" >&2
	echo "--"
	show_usage
	exit 1
fi

if [ "$1" = "" ]; then
	echo "Specify path to config file" >&2
	echo "--"
	show_usage
	exit 1
fi

if [ ! -f "$1" ]; then
	echo "Unable to find config file '$1'" >&2
	echo "--"
	show_usage
	exit 1
fi

INPUT_DIR=`cat "$1"|grep input_dir| cut -d '=' -f 2 | sed -E 's/(^ +| +$)//g'`
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status in parsing input_dir from $1 >&2
	exit $E;
fi
OUTPUT_DIR=`cat "$1"|grep output_dir| cut -d '=' -f 2 | sed -E 's/(^ +| +$)//g'`
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status in parsing output_dir from $1 >&2
	exit $E;
fi

if [ "$INPUT_DIR" = "" ]; then
	echo "Unable to find input directory" >&2
	echo "--"
	show_usage
	exit 1;
fi

if [ "$OUTPUT_DIR" = "" ]; then
	echo "Unable to find output directory" >&2
	echo "--"
	show_usage
	exit 1;
fi

if [ ! -d "$INPUT_DIR/region" ]; then
	echo "Unable to find region directory in $INPUT_DIR" >&2
	exit 1;
fi

if [ ! -d "$INPUT_DIR/playerdata" ]; then
	echo "Unable to find playerdata directory in $INPUT_DIR" >&2
	exit 1;
fi

TEMPFILE="`tempfile -m 0644`"

echo "[`date`] Executing '${MAPCRAFTER_MARKERS}'..."
"$MAPCRAFTER_MARKERS" --verbose -c "$1" -o "$TEMPFILE"
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status running $MAPCRAFTER_MARKERS >&2
	rm "$TEMPFILE"
	exit $E;
fi

if [ ! -f "$TEMPFILE" ]; then
	echo Unable to find "$TEMPFILE" >&2
	exit 1;
fi

# uncomment to short-circuit
#mv "$TEMPFILE" "$OUTPUT_DIR/markers-generated.js"
#exit

grep -q MARKERS_CLEANUP_RENDERER "$TEMPFILE"
if [ $? -eq 0 ]; then
	echo $APPEND_JS is already appended to "$TEMPFILE" >&2
	rm "$TEMPFILE"
	exit 1;
fi

ALLPLAYERBASICS="allplayerBasics2json"

if [ "$UTILS_DIR" != "" ]; then
	ALLPLAYERBASICS=$(echo "$UTILS_DIR/$ALLPLAYERBASICS"|tr -s /)
	if [ ! -x "$ALLPLAYERBASICS" ]; then
		echo "Unable to find '$ALLPLAYERBASICS' or it is not executable" >&2
		echo "--"
		show_usage
		rm "$TEMPFILE"
		exit 1;
	fi
else
	if [ "$(which $ALLPLAYERBASICS)" = "" ]; then
		if [ -x "$SCRIPTPATH/$ALLPLAYERBASICS" ]; then
			ALLPLAYERBASICS="$SCRIPTPATH/$ALLPLAYERBASICS"
		elif [ -x "$HOME/bin/$ALLPLAYERBASICS" ]; then
			ALLPLAYERBASICS="$HOME/bin/$ALLPLAYERBASICS"
		else
			echo "Unable to find '$ALLPLAYERBASICS' or it is not executable" >&2
			echo "--"
			show_usage
			rm "$TEMPFILE"
			exit 1;
		fi
	fi
fi

NAMEDENTITIES="namedEntities2json"

if [ "$UTILS_DIR" != "" ]; then
	NAMEDENTITIES=$(echo "$UTILS_DIR/$NAMEDENTITIES"|tr -s /)
	if [ ! -x "$NAMEDENTITIES" ]; then
		echo "Unable to find '$NAMEDENTITIES' or it is not executable" >&2
		echo "--"
		show_usage
		rm "$TEMPFILE"
		exit 1;
	fi
else
	if [ "$(which $NAMEDENTITIES)" = "" ]; then
		if [ -x "$SCRIPTPATH/$NAMEDENTITIES" ]; then
			NAMEDENTITIES="$SCRIPTPATH/$NAMEDENTITIES"
		elif [ -x "$HOME/bin/$NAMEDENTITIES" ]; then
			NAMEDENTITIES="$HOME/bin/$NAMEDENTITIES"
		else
			echo "Unable to find '$NAMEDENTITIES' or it is not executable" >&2
			echo "--"
			show_usage
			rm "$TEMPFILE"
			exit 1;
		fi
	fi
fi

echo "MARKERS_WORLDS={">> "$TEMPFILE"
cat $1|grep -E '(^dimension|\[world:)'|sed 's/\s*dimension\s*=\s*//g'|xargs|sed 's/\[world://g'|sed 's/\] /:"/g'|sed 's/ /",/g'|sed 's/$/"/g' >> "$TEMPFILE"
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status in MARKERS_WORLD step >&2
	rm "$TEMPFILE"
	exit $E;
fi
echo "};">>"$TEMPFILE"

echo -n "PLAYER_LOCATIONS=">>"$TEMPFILE"
echo "[`date`] Executing $ALLPLAYERBASICS..."
"$ALLPLAYERBASICS" "$INPUT_DIR/playerdata/" >> "$TEMPFILE"
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status in PLAYER_LOCATIONS step >&2
	rm "$TEMPFILE"
	exit $E;
fi
echo ";">>"$TEMPFILE"

echo -n "NAMED_ENTITIES=">>"$TEMPFILE"
echo "[`date`] Executing $NAMEDENTITIES..."
"$NAMEDENTITIES" "$INPUT_DIR" >> "$TEMPFILE"
E=$?
if [ $E -ne 0 ]; then
	echo Non-zero exit status in NAMED_ENTITIES step >&2
	rm "$TEMPFILE"
	exit $E;
fi
echo ";">>"$TEMPFILE"

cat "$APPEND_JS" >> "$TEMPFILE"

echo "[`date`] Moving tempfile $TEMPFILE..."
mv "$TEMPFILE" "$OUTPUT_DIR/markers-generated.js"

echo "[`date`] Done!"

