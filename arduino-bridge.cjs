const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');

const port = new SerialPort({ 
  path: '/dev/tty.usbserial-A5069RR4',
  baudRate: 9600 
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line) => {
  const cleaned = line.trim();
  console.log('Arduino:', cleaned);  
  
  // Parse format: MOV:5|HR:120|CO:43|STP:3
  if (cleaned.includes('STP:')) {
    const parts = cleaned.split('|');
    let stepCount = null;
    
    for (const part of parts) {
      if (part.startsWith('STP:')) {
        stepCount = parseInt(part.split(':')[1]);
        break;
      }
    }
    
    if (stepCount !== null && !isNaN(stepCount)) {
      console.log('Step count:', stepCount);
      
      // Send to server
      const data = JSON.stringify({
        co_ppm: 5.0,
        step_count: stepCount
      });
      
      const options = {
        hostname: '172.20.62.166',
        port: 3001,
        path: '/api/sensor',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`Sent step count ${stepCount} to dashboard`);
      });
      
      req.on('error', (err) => {
        console.error('Error sending to server:', err.message);
      });
      
      req.write(data);
      req.end();
    }
  }
});

port.on('open', () => {
  console.log('Arduino bridge started - listening to /dev/tty.usbserial-A5069RR4');
  console.log('Waiting for step count data (STP:X)...');
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message);
});
