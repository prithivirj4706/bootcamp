import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

let latestData = {
  co_ppm: 0,
  step_count: 0,
  temperature: 26.2,
  impactG: 1.0,
  status: 'SAFE',
  timestamp: new Date().toISOString()
};

function broadcast(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify(latestData));
});

// --- ADD THIS TO BRIDGE YOUR ARDUINO ---
const arduinoPort = new SerialPort({ 
  path: '/dev/cu.usbserial-A5069RR4', // Use your Mac's port here
  baudRate: 9600,
  autoOpen: false // Don't open automatically so we can catch errors
});

arduinoPort.open(function (err) {
  if (err) {
    console.error('\n🔴 Serial Port Error:', err.message);
    console.error('💡 HINT: Is your Arduino IDE Serial Monitor open? If so, close it and restart the server!\n');
  } else {
    console.log('🟢 Serial Port connected successfully!');
  }
});

arduinoPort.on('error', function(err) {
  console.error('Serial Port Error: ', err.message);
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data: string) => {

  try {
    const parts = data.split('|').reduce((acc: any, part) => {
      const [key, val] = part.split(':');
      if (key && val !== undefined) {
        acc[key.toLowerCase()] = parseFloat(val);
      }
      return acc;
    }, {});

    // Update your state
    latestData = {
      co_ppm: parts.co !== undefined ? parts.co : latestData.co_ppm,
      step_count: parts.stp !== undefined ? parts.stp : latestData.step_count,
      temperature: 26.2, // Simulated or from sensor
      impactG: parts.mov !== undefined ? parts.mov : latestData.impactG,
      status: (parts.co > 35) ? 'DANGER' : 'SAFE',
      timestamp: new Date().toISOString()
    };

    // Push to your App.tsx via WebSocket
    broadcast(latestData);
  } catch (err) {
    console.error("Error parsing Serial data:", err);
  }
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket is listening on ws://localhost:${PORT}`);
});