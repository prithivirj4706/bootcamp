import { useEffect, useState } from 'react';

export interface SensorData {
  co_ppm: number;
  status: 'SAFE' | 'DANGER';
  timestamp: string;
}

export function useSensorData() {
  const [data, setData] = useState<SensorData>({
    co_ppm: 0,
    status: 'SAFE',
    timestamp: ''
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to ASTRA server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const parsed: SensorData = JSON.parse(event.data);
      setData(parsed);
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, []);

  return { data, connected };
}