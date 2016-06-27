'use strict';

var NodeTwelite = require('../twelite.js');

var portName = '/dev/tty.usbserial-MWEUO5W';
var twelite = new NodeTwelite(portName);

twelite.on('data', function(data) {
    console.log(data);
});
