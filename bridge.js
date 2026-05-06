var SerialPort = require('serialport').SerialPort;
var ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
var http = require('http');

var port = new SerialPort({
  path: '/dev/tty.usbserial-A5069RR4',
  baudRate: 9600
});

var parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', function(line) {
  var cleaned = line.trim();
  console.log('Arduino:', cleaned);
  
  if (cleaned.indexOf('MOV:') !== -1 && cleaned.indexOf('STP:') !== -1) {
    var parts = cleaned.split('|');
    var mov = 0, stp = 0;
    
    parts.forEach(function(part) {
      if (part.indexOf('MOV:') === 0) mov = parseInt(part.split(':')[1]) || 0;
      if (part.indexOf('STP:') === 0) stp = parseInt(part.split(':')[1]) || 0;
    });
    
    console.log('Sending - MOV:' + mov + ' STP:' + stp);
    
    var postData = JSON.stringify({
      co_ppm: 5.0,
      step_count: stp,
      temperature: 0,
      impactG: mov / 100.0
    });
    
    var options = {
      hostname: '172.20.62.166',
      port: 3001,
      path: '/api/sensor',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    var req = http.request(options);
    req.on('error', function(err) { console.error('HTTP Error:', err.message); });
    req.write(postData);
    req.end();
  }
});

port.on('open', function() {
  console.log('Bridge READY - Reading Arduino on /dev/tty.usbserial-A5069RR4');
  console.log('Format: MOV:x|STP:x');
});

port.on('error', function(err) {
  console.error('Serial Error:', err.message);
});
