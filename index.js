var JZZ = require('jzz');
require('jzz-midi-gear')(JZZ);

const LIBRARY_INDEX = 73;
var isLibrary = true;

const COLORS = {
    "OFF": 12,
    "AMBER_LOW": 29,
    "AMBER_FULL": 63,
    "AMBER_FULL_FLASHING": 59,
    "GREEN_LOW": 28,
    "GREEN_FULL": 60,
    "GREEN_FULL_FLASHING": 56,
    "RED_LOW": 13,
    "RED_FULL": 15,
    "RED_FULL_FLASHING": 11,
    "YELLOW_FULL": 62,
    "YELLOW_FULL_FLASHING": 58
}

const CONTROL_MODES = {
    "LIBRARY": {
        "MAIN": [73]
    },
    "BASIC": {
        "MAIN": [74],
        "CROP": [74,81],
        "SPOT": [74,82],
        "GRAD": [74,83],
        "RAD": [74,84],
        "BRUSH": [74,85],

    },
    "COLORS": {
        "HUE": [75,81],
        "SATURATION": [75,82],
        "LUMINANCE": [75,83],
        "GRAY": [75,84]
    },
    "EFFECT": {
        "MAIN": [76]
    },
    "DETAIL": {
        "MAIN": [77]
    }
};

const CONTROL_INDICES = [...Array(16).keys()].map(x => x + 73)
const MAIN_INDICES = [...Array(6).keys()].map(x => x + 73)
const SUB_INDICES = [...Array(5).keys()].map(x => x + 81)
const STATE_INDICES = MAIN_INDICES.concat(SUB_INDICES);

var output = JZZ().openMidiOut("Launch Control XL");
var setChannel = (out, channel) => {
  console.log(`Setting channel to ${channel}`);
  out.send([240,0,32,41,2,17,119,channel,247])
};

var setLight = (out, channel, note, color) => {
 out.noteOn(channel, note, color);
};

var disableLED = (leds) => {
    leds.forEach(led => {
        setLight(output, 0, led, COLORS.OFF)
    })
};

var toggle = (leds, main) => {
    disableLED(SUB_INDICES)
    if(main) {
        disableLED(CONTROL_INDICES)
    }
    leds.forEach(led => {
        setLight(output, 0, led, COLORS.GREEN_FULL);
    });
};



var init = () => {
    disableLED(CONTROL_INDICES)
    toggle(CONTROL_MODES.LIBRARY.MAIN)
};

init();

var handleInput = (midi) => {
    var note = midi[1];
    var main = note < 80;

    if(CONTROL_INDICES.indexOf(note) >= 0) {
        disableLED([note])
    }
    var stateIndex = STATE_INDICES.indexOf(note);

    if(stateIndex >= 0) {
        isLibrary = (isLibrary && stateIndex > 4) || (stateIndex === 0);

        if(!isLibrary || stateIndex === 0)
            toggle([note], main)
    }
};

var input = JZZ().openMidiIn("Launch Control XL");
input.connect(handleInput);


