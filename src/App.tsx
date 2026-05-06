/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Wind, 
  Thermometer, 
  Battery, 
  Wifi, 
  ShieldAlert,
  Radio,
  Zap,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Clock,
  Scan,
  Compass,
  Users,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TacticalCard } from './components/TacticalCard';
import { EquipmentShowcase } from './components/ui/spatial-product-showcase';
import { THRESHOLDS, MOCK_RANGES } from './constants';
import { SensorData, LogEntry } from './types';

const INITIAL_PERSONNEL: SensorData[] = [
  {
    id: 'ASTRA-01',
    name: 'Cpt. Miller',
    heartRate: 75,
    spO2: 98,
    fatigueScore: 12,
    coPpm: 5,
    h2sPpm: 2,
    o2Level: 20.9,
    ambientTemp: 28,
    impactG: 1.0,
    armbandBattery: 85,
    helmetBattery: 92,
    armbandConnected: true,
    helmetConnected: true,
    fatigueHistory: Array.from({ length: 30 }, (_, i) => ({ 
      time: new Date(Date.now() - (30 - i) * 1200).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
      score: 10 + Math.random() * 5 
    })),
  },
  {
    id: 'ASTRA-02',
    name: 'Sgt. Chen',
    heartRate: 82,
    spO2: 97,
    fatigueScore: 45,
    coPpm: 12,
    h2sPpm: 1,
    o2Level: 20.5,
    ambientTemp: 31,
    impactG: 1.2,
    armbandBattery: 78,
    helmetBattery: 65,
    armbandConnected: true,
    helmetConnected: true,
    fatigueHistory: Array.from({ length: 30 }, (_, i) => ({ 
      time: new Date(Date.now() - (30 - i) * 1200).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
      score: 40 + Math.random() * 10 
    })),
  },
  {
    id: 'ASTRA-03',
    name: 'Rsc. Rodriguez',
    heartRate: 110,
    spO2: 94,
    fatigueScore: 68,
    coPpm: 28,
    h2sPpm: 8,
    o2Level: 19.8,
    ambientTemp: 38,
    impactG: 1.0,
    armbandBattery: 42,
    helmetBattery: 39,
    armbandConnected: true,
    helmetConnected: false,
    fatigueHistory: Array.from({ length: 30 }, (_, i) => ({ 
      time: new Date(Date.now() - (30 - i) * 1200).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
      score: 60 + Math.random() * 10 
    })),
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function App() {
  const [personnel, setPersonnel] = useState<SensorData[]>(INITIAL_PERSONNEL);
  const [activeId, setActiveId] = useState<string>(INITIAL_PERSONNEL[0].id);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastVibeReceived, setLastVibeReceived] = useState<string | null>(null);

  const activeWorker = personnel.find(p => p.id === activeId) || personnel[0];

  const addLog = useCallback((message: string, type: 'info' | 'alert' | 'success') => {
    setLogs(prev => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message,
        type
      },
      ...prev
    ].slice(0, 50));
  }, []);

  // Simulation logic for all personnel
  const simulateData = useCallback(() => {
    setPersonnel((prev) => 
      prev.map(p => {
        // Organic drifting with occasional spikes
        const drift = (val: number, range: { min: number, max: number }, speed = 1, spikeChance = 0.02) => {
          const change = (Math.random() - 0.48) * speed; 
          const isSpike = Math.random() < spikeChance;
          const spikeValue = isSpike ? (Math.random() - 0.5) * speed * 15 : 0;
          return Math.max(range.min, Math.min(range.max, val + change + spikeValue));
        };

        const next = {
          ...p,
          heartRate: drift(p.heartRate, MOCK_RANGES.BPM, 6),
          spO2: drift(p.spO2, MOCK_RANGES.SPO2, 0.3, 0.01),
          fatigueScore: Math.min(MOCK_RANGES.FATIGUE.max, p.fatigueScore + (Math.random() > 0.96 ? 1 : (Math.random() > 0.99 ? 5 : 0))),
          coPpm: p.id === 'ASTRA-01' ? p.coPpm : drift(p.coPpm, MOCK_RANGES.CO, 3, 0.05),
          h2sPpm: drift(p.h2sPpm, MOCK_RANGES.H2S, 1.5, 0.03),
          o2Level: drift(p.o2Level, MOCK_RANGES.O2, 0.15, 0.01),
          ambientTemp: drift(p.ambientTemp, MOCK_RANGES.TEMP, 0.8),
          impactG: Math.random() > 0.98 ? 3.0 + Math.random() * 5 : 1.0 + (Math.random() - 0.5) * 0.1,
          armbandBattery: Math.max(0, p.armbandBattery - (Math.random() * 0.01)),
          helmetBattery: Math.max(0, p.helmetBattery - (Math.random() * 0.01)),
          fatigueHistory: [
            ...p.fatigueHistory,
            { 
              time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
              score: Math.min(MOCK_RANGES.FATIGUE.max, p.fatigueScore + (Math.random() > 0.96 ? 1 : (Math.random() > 0.99 ? 5 : 0)))
            }
          ].slice(-250) // Keep ~5 minutes trailing data (1.2s * 250 = 300s)
        };

        // Alert logging per personnel
        if (next.heartRate > THRESHOLDS.HEART_RATE && p.heartRate <= THRESHOLDS.HEART_RATE) addLog(`ALERT [${p.id}]: Critical HR Detected (${Math.round(next.heartRate)} BPM)`, "alert");
        if (next.coPpm > THRESHOLDS.CO && p.coPpm <= THRESHOLDS.CO) addLog(`GAS [${p.id}]: Dangerous CO Levels (${next.coPpm.toFixed(1)} PPM)`, "alert");
        if (next.impactG > THRESHOLDS.IMPACT && p.impactG <= THRESHOLDS.IMPACT) addLog(`IMPACT [${p.id}]: High G-Force Detected (${next.impactG.toFixed(1)}G)`, "alert");

        return next;
      })
    );
  }, [addLog]);

  // Real sensor WebSocket
useEffect(() => {
  const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3002');

  ws.onopen = () => {
    addLog('UPLINK: ASTRA-01 hardware sensor connected', 'success');
  };

  ws.onmessage = (event) => {
    const { co_ppm, status } = JSON.parse(event.data);
    setPersonnel(prev => prev.map(p => {
      if (p.id !== 'ASTRA-01') return p;
      return { ...p, coPpm: co_ppm };
    }));
    if (status === 'DANGER') {
      addLog(`GAS [ASTRA-01]: LIVE CO reading ${co_ppm} PPM — HARDWARE ALERT`, 'alert');
    }
  };

  ws.onclose = () => {
    addLog('UPLINK: ASTRA-01 hardware sensor disconnected', 'info');
  };

  return () => ws.close();
}, [addLog]);

  useEffect(() => {
    const interval = setInterval(simulateData, 1200);
    return () => clearInterval(interval);
  }, [simulateData]);

  const sendVibration = (pattern: string) => {
    setLastVibeReceived(pattern);
    addLog(`TALKBACK: ${pattern} sent to ${activeWorker.name}`, "success");
    setTimeout(() => setLastVibeReceived(null), 1500);
  };

  const isDanger = {
    heartRate: activeWorker.heartRate > THRESHOLDS.HEART_RATE,
    spO2: activeWorker.spO2 < THRESHOLDS.SPO2_MIN,
    co: activeWorker.coPpm > THRESHOLDS.CO,
    h2s: activeWorker.h2sPpm > THRESHOLDS.H2S,
    o2: activeWorker.o2Level < THRESHOLDS.O2_MIN,
    impact: activeWorker.impactG > THRESHOLDS.IMPACT,
  };

  const activeAlerts = [
    isDanger.heartRate && `Heart Rate (${Math.round(activeWorker.heartRate)} BPM)`,
    isDanger.spO2 && `SpO2 (${activeWorker.spO2.toFixed(1)}%)`,
    isDanger.co && `CO (${activeWorker.coPpm.toFixed(1)} PPM)`,
    isDanger.h2s && `H2S (${activeWorker.h2sPpm.toFixed(1)} PPM)`,
    isDanger.o2 && `O2 (${activeWorker.o2Level.toFixed(1)}%)`,
    isDanger.impact && `Impact (${activeWorker.impactG.toFixed(1)} G)`,
  ].filter(Boolean) as string[];

  const hasGlobalAlert = activeAlerts.length > 0;

  return (
    <div className="min-h-screen bg-surface-950 p-4 font-sans text-zinc-300 antialiased selection:bg-brand-red/30 md:p-8">
      {/* Background Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 industrial-grid opacity-20" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-40" />

      <header className="relative z-10 mx-auto mb-6 flex max-w-[1600px] flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-16 w-16 items-center justify-center rounded border border-white/10 bg-zinc-900/50 shadow-inner"
          >
            <Scan className="text-brand-red" size={32} strokeWidth={1.5} />
          </motion.div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-black tracking-tight text-white uppercase">A.S.T.R.A</h1>
              <span className="rounded bg-brand-red px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">COMMANDER v2.4</span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
              <span className="flex items-center gap-1.5"><Compass size={12} className="text-zinc-600" /> Sector 04-A // Red Aegis</span>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <span className="text-emerald-500/80">Uplink Stable: {personnel.length} Nodes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10 rounded-lg border border-white/5 bg-zinc-900/30 p-4 backdrop-blur-md">
          <ModuleStatus name="Helmet Unit" connected={activeWorker.helmetConnected} battery={activeWorker.helmetBattery} />
          <div className="h-8 w-[1px] bg-white/5" />
          <ModuleStatus name="Bio-Armband" connected={activeWorker.armbandConnected} battery={activeWorker.armbandBattery} />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-12">
        {/* Personnel Sidebar */}
        <aside className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">

            <div className="flex items-center gap-2">
              <Users size={14} className="text-zinc-600" />
              <h2 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Deployed Units</h2>
            </div>
          </div>
          <div className="space-y-3">
            {personnel.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`group relative flex w-full flex-col overflow-hidden rounded border p-4 transition-all duration-200 ${
                  activeId === p.id 
                    ? "border-brand-red/50 bg-brand-red/5 ring-1 ring-brand-red/20 shadow-[inset_0_0_20px_rgba(204,0,0,0.05)]" 
                    : "border-white/5 hover:border-white/10 bg-zinc-900/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${activeId === p.id ? "text-brand-red" : "text-zinc-600"}`}>{p.id}</span>
                  {activeId === p.id && <div className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />}
                </div>
                <span className={`mt-1.5 text-sm font-bold tracking-tight ${activeId === p.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>{p.name}</span>
                
                {/* Visual Status Bar */}
                <div className="mt-4 grid grid-cols-4 gap-1">
                  {[...Array(4)].map((_, i) => {
                    const threshold = (i + 1) * 25;
                    const isActive = p.heartRate < THRESHOLDS.HEART_RATE; // Simple health check
                    return (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full ${isActive ? "bg-zinc-800" : "bg-red-900/30"}`} 
                      >
                        {activeId === p.id && isActive && (
                          <div className="h-full bg-zinc-600" style={{ width: '100%' }} />
                        )}
                        {activeId === p.id && !isActive && (
                          <div className="h-full bg-brand-red animate-pulse" style={{ width: '100%' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Dashboard */}
        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-10 grid gap-6 lg:grid-cols-5"
        >
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {hasGlobalAlert && (
                <motion.div
                  key="alert"
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between rounded border border-brand-red/30 bg-brand-red p-4 shadow-[0_0_30px_rgba(204,0,0,0.2)]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-white/20">
                        <AlertCircle className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-black tracking-widest text-white uppercase">Unit Status Breach: {activeWorker.name}</h2>
                        <p className="mt-1 text-[10px] font-bold text-red-100/90 tracking-widest uppercase">
                          Critical Parameters: {activeAlerts.join(' // ')}
                        </p>
                      </div>
                    </div>
                    <div className="hidden border-l border-white/20 pl-6 sm:block">
                      <div className="text-[9px] font-black text-white/50 uppercase tracking-widest">Protocol ID</div>
                      <div className="font-mono text-sm font-bold text-white uppercase">AEGIS-09</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div variants={itemVariants}>
                <TacticalCard
                  title="Heart Rate"
                  icon={Heart}
                  value={Math.round(activeWorker.heartRate)}
                  unit="BPM"
                  isDanger={isDanger.heartRate}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TacticalCard
                  title="SpO2 Level"
                  icon={Activity}
                  value={activeWorker.spO2.toFixed(1)}
                  unit="%"
                  isDanger={isDanger.spO2}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TacticalCard title="Carb-Monox" icon={Wind} value={activeWorker.coPpm.toFixed(1)} unit="PPM" isDanger={isDanger.co} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TacticalCard title="Oxygen" icon={Wind} value={activeWorker.o2Level.toFixed(1)} unit="%" isDanger={isDanger.o2} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TacticalCard title="Thermal" icon={Thermometer} value={activeWorker.ambientTemp.toFixed(1)} unit="°C" isDanger={activeWorker.ambientTemp > 45} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TacticalCard title="Helmet G-Force" icon={ShieldAlert} value={activeWorker.impactG.toFixed(1)} unit="G" isDanger={isDanger.impact} />
              </motion.div>
            </div>

            {/* Talkback Control */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded border border-white/5 bg-zinc-900/30 p-6 backdrop-blur-md">
              <div className="relative z-10 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display flex items-center gap-3 text-xl font-black tracking-tight text-white uppercase">
                    <Radio size={24} className="text-brand-red" />
                    Directive Hub: {activeWorker.id}
                  </h3>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase italic">Encrypted Uplink Established</p>
                </div>
                <AnimatePresence>
                  {lastVibeReceived && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest"
                    >
                      ACKNOWLEDGED: {lastVibeReceived}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <TalkbackButton label="Emergency SOS" onClick={() => sendVibration('SOS')} icon={AlertCircle} color="red" />
                <TalkbackButton label="Base RTB" onClick={() => sendVibration('RETURN')} icon={Compass} color="blue" />
                <TalkbackButton label="Status Check" onClick={() => sendVibration('CHECK')} icon={CheckCircle2} color="emerald" />
                <TalkbackButton label="Critical Prio" onClick={() => sendVibration('CRITICAL')} icon={Zap} color="amber" />
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 h-16 w-16 opacity-5 pointer-events-none">
                <Scan size={64} strokeWidth={1} />
              </div>
            </motion.div>
          </div>

          {/* Right Side Info */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            {/* Fatigue Trend Chart */}
            <section className="space-y-6 min-w-0">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <TrendingUp size={14} className="text-zinc-600" />
                <h2 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Operational Load</h2>
              </div>
              <div className="h-[220px] w-full min-w-0 rounded border border-white/5 bg-zinc-900/40 p-4">
                <div style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={activeWorker.fatigueHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      hide 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '9px', textTransform: 'uppercase' }}
                      itemStyle={{ color: '#cc0000', fontWeight: 'bold' }}
                      labelStyle={{ color: '#52525b', marginBottom: '4px' }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="score" 
                      stroke="#cc0000" 
                      strokeWidth={1.5} 
                      dot={false}
                      animateNewValues={false}
                    />
                  </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="text-center">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Analytics Range [5m]</span>
              </div>
            </section>

            {/* Fleet Event Log */}
            <section className="space-y-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Terminal size={14} className="text-zinc-600" />
                <h2 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">System Events</h2>
              </div>
              <div className="h-[350px] space-y-2 overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "group relative overflow-hidden rounded border p-3 text-[10px] font-medium leading-relaxed transition-colors",
                        log.type === 'alert' ? "alert-pulse bg-brand-red/5 text-red-500" :
                        log.type === 'success' ? "border-emerald-900/30 bg-emerald-950/10 text-emerald-200" :
                        "border-white/5 bg-zinc-900/20 text-zinc-400"
                      )}
                    >
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1.5 mb-1.5 font-mono text-[9px] opacity-40 uppercase">
                        <Clock size={8} />
                        {log.time}
                        <span className="ml-auto opacity-50">#LOG_{log.id.toString().slice(-4)}</span>
                      </div>
                      <div className="tracking-tight">{log.message}</div>
                      {/* Log status icon */}
                      {log.type === 'alert' && <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-brand-red animate-pulse" />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </motion.main>
      </div>

      {/* Equipment Specs Showcase */}
      <div className="relative z-10 mx-auto max-w-[1600px] mt-8">
        <EquipmentShowcase activeWorker={activeWorker} />
      </div>

      <footer className="relative z-10 mx-auto mt-8 flex max-w-[1600px] flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-[9px] font-black tracking-[0.4em] text-zinc-700 uppercase">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p>MAIN_GRID_SECURE</p>
          </div>
          <p>OPS_ENCRYPTION_v4</p>
        </div>
        <div className="flex items-center gap-4">
          <p>EST_RELAY: 14ms</p>
          <span className="h-1 w-1 rounded-full bg-zinc-800" />
          <p>SYS_UPTIME: 08:44:12</p>
        </div>
      </footer>
    </div>
  );
}

function ModuleStatus({ name, connected, battery }: { name: string, connected: boolean, battery: number }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-brand-red animate-pulse'
        )} />
        <span className="font-display text-[10px] font-black tracking-widest text-zinc-300 uppercase">{name}</span>
      </div>
      <div className="flex items-center gap-4 pl-4">
        <div className="flex items-center gap-2">
          <Battery size={11} className={battery < 20 ? 'animate-pulse text-brand-red' : 'text-zinc-600'} />
          <span className={cn("font-mono text-[10px] font-bold", battery < 20 ? 'text-brand-red' : 'text-zinc-500')}>{Math.round(battery)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={11} className={connected ? 'text-emerald-500/50' : 'text-zinc-800'} />
          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none">{connected ? 'LINKED' : 'OFF'}</span>
        </div>
      </div>
    </div>
  );
}

function TalkbackButton({ label, onClick, icon: Icon, color }: { label: string, onClick: () => void, icon: any, color: string }) {
  const colors: Record<string, string> = {
    red: "bg-brand-red/5 hover:bg-brand-red border-brand-red/20 text-brand-red/80 hover:text-white",
    blue: "bg-blue-500/5 hover:bg-blue-600 border-blue-500/20 text-blue-400 hover:text-white",
    emerald: "bg-emerald-500/5 hover:bg-emerald-600 border-emerald-500/20 text-emerald-400 hover:text-white",
    amber: "bg-amber-500/5 hover:bg-amber-600 border-amber-500/20 text-amber-400 hover:text-white",
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center gap-3 rounded border py-6 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300",
        colors[color]
      )}
    >
      <Icon size={18} strokeWidth={2} className="transition-transform group-hover:scale-110" />
      <span className="font-display">{label}</span>
    </motion.button>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
