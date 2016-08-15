var SerialPort = require('serialport');
var stream = require('stream');
var assign = require('object.assign').getPolyfill();
var util = require('util');

var defaultSettings = {
    type: 'easyapp',
    autoOpen: true,
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    xon: false,
    xoff: false,
    xany: false,
    rtscts: false,
    parser: SerialPort.parsers.readline("\r\n")
};

function TweLite(portname, options, callback) {

    if(typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};

    if(!portname) {
        throw new TypeError('No port name specified');
    }

    this.portname = portname;

    var settings = assign({}, defaultSettings, options);

    //console.log(settings);  // debug

    stream.Stream.call(this);

    this.isOpen = false;

    this.open(portname, settings, function(err) {
        if(err) {
            return this._error(err, callback);
        }
        console.info('twe-lite connected');   // debug
    });
}

util.inherits(TweLite, stream.Stream);  // TweLite extends stream.Stream

TweLite.prototype.serialport = undefined;

TweLite.prototype._error = function(error, callback) {
    if(callback) {
        callback.call(this, error);
    } else {
        this.emit('error', error);
    }
};

TweLite.prototype.open = function(portname, settings, callback) {
    if(this.isOpen) {
        return this._error(new Error('Port is already open'), callback);
    }
    if (this.opening) {
        return this._error(new Error('Port is opening'), callback);
    }
    this.opening = true;
    var tweliteType = settings.type;
    delete settings.type;
    var serialSettings = settings;
    //console.info(serialSettings);
    this.serialport = new SerialPort.SerialPort(portname, serialSettings);
    this.serialport.on('open', function() {
        this.isOpen = true;
        this.opening = false;
        this.listenData(tweliteType);
        if(callback) { callback.call(this, null); }
    }.bind(this));
    this.serialport.on('error', function(err) {
        console.error('SerialPort has an error !');     // debug
        return this._error(err, callback);
    }.bind(this));
    this.serialport.on('disconnect', function() {
        this.opening = false;
        this.isOpen = false;
        console.error('SerialPort disconnected');     // debug
    }.bind(this));
};

TweLite.prototype.listenData = function(type) {
    this.serialport.on('data', function(raw) {
        var obj = this.dispatchDataByType(type, raw);
        this.emit('data', obj);
    }.bind(this));
};

TweLite.prototype.dispatchDataByType = function(type, raw) {
    var obj = {};
    switch(type) {
        case 'easyapp':
            obj = this.parseEasyAppData(raw);
            break;
    }
    return obj;
};

TweLite.prototype.parseEasyAppData = function(buffer) {
    var data = {};
    data.raw = buffer;
    // Ref: http://qiita.com/Omegamega/items/b15bae4654f197ff9da8#%E7%9B%B8%E6%89%8B%E7%AB%AF%E6%9C%AB%E3%81%AE%E7%8A%B6%E6%85%8B%E9%80%9A%E7%9F%A5%E3%81%8B%E3%82%89%E9%9B%BB%E6%B3%A2%E5%BC%B7%E5%BA%A6%E3%81%A8%E9%9B%BB%E6%BA%90%E9%9B%BB%E5%9C%A7%E3%81%8C%E4%B9%97%E3%81%A3%E3%81%A6%E3%81%84%E3%82%8B
    data.deviceId = parseInt(buffer.slice(1,3).toString(), 16);
    data.datatype = buffer.slice(3,5).toString();
    data.packetId = buffer.slice(5,7).toString();
    data.protocol = buffer.slice(7,9).toString();
    data.signal = parseInt(buffer.slice(9,11).toString(), 16);
    data.terminalId = parseInt(buffer.slice(11,19).toString(), 16);
    data.toId = parseInt(buffer.slice(19,21).toString(), 16);
    data.timestamp = parseInt(buffer.slice(21,25).toString(), 16);
    data.repeater_flag = parseInt(buffer.slice(25,27).toString(), 16);
    data.battery = parseInt(buffer.slice(27,31).toString(), 16);
    var rawDigitalIn = parseInt(buffer.slice(33,35).toString(), 16);
    data.digialIn = [
        (rawDigitalIn >> 0 & 1) ? true : false,
        (rawDigitalIn >> 1 & 1) ? true : false,
        (rawDigitalIn >> 2 & 1) ? true : false,
        (rawDigitalIn >> 3 & 1) ? true : false,
    ];
    var rawDigitalChanged = parseInt(buffer.slice(35,37).toString(), 16);
    data.digialChanged = [
        (rawDigitalChanged >> 0 & 1) ? true : false,
        (rawDigitalChanged >> 1 & 1) ? true : false,
        (rawDigitalChanged >> 2 & 1) ? true : false,
        (rawDigitalChanged >> 3 & 1) ? true : false,
    ]
    data.analogIn = [
        parseInt(buffer.slice(37,39).toString(), 16),
        parseInt(buffer.slice(39,41).toString(), 16),
        parseInt(buffer.slice(41,44).toString(), 16),
        parseInt(buffer.slice(43,45).toString(), 16),
    ]
    data.analogOffset = parseInt(buffer.slice(45,47).toString(), 16);
    data.checksum = parseInt(buffer.slice(47,49).toString(), 16);
    return data;
}


module.exports = TweLite;
