'use strict';

var NodeTwelite = require('../twelite.js');

var portName = '[YOUR USB PORT NAME]';
var twelite = new NodeTwelite(portName);

twelite.on('data', function(data) {
    console.log(data);
});
