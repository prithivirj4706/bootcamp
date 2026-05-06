export interface SensorData {
  id: string;
  name: string;
  // Armband Data
  heartRate: number;
  spO2: number;
  fatigueScore: number;
  stepCount: number;
  
  // Helmet Data
  coPpm: number;
  h2sPpm: number;
  o2Level: number;
  ambientTemp: number;
  impactG: number;
  
  // Status
  armbandBattery: number;
  helmetBattery: number;
  armbandConnected: boolean;
  helmetConnected: boolean;
  
  // History
  fatigueHistory: { time: string; score: number }[];
}

export type ModuleType = 'Armband' | 'Helmet';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'alert' | 'success';
}
