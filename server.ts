import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const HTTP_PORT = parseInt(process.env.SERVER_PORT || '3001');
const WS_PORT = parseInt(process.env.WS_PORT || '3002');

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ port: WS_PORT });

let latestData = {
  co_ppm: 0,
  status: 'SAFE',
  timestamp: ''
};

function broadcast(data: object) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

app.post('/api/sensor', (req, res) => {
  const { co_ppm } = req.body;
  latestData = {
    co_ppm: parseFloat(parseFloat(co_ppm).toFixed(1)),
    status: co_ppm > 35 ? 'DANGER' : 'SAFE',
    timestamp: new Date().toISOString()
  };
  broadcast(latestData);
  res.json({ received: true });
});

app.get('/api/status', (req, res) => {
  res.json({ running: true, latest: latestData });
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server → http://localhost:${HTTP_PORT}`);
  console.log(`WebSocket server → ws://localhost:${WS_PORT}`);
});