import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import {
  Battery,
  Sliders,
  ChevronRight,
  Zap,
  Bluetooth,
  Wifi,
  Shield,
  Activity,
  ShieldAlert,
  LucideIcon,
} from 'lucide-react';
import { SensorData } from '../../types';

// =========================================
// 1. CONFIGURATION & DATA TYPES
// =========================================

export type ProductId = 'helmet' | 'armband';

export interface FeatureMetric {
  label: string;
  value: number; // 0-100
  displayValue?: string;
  icon: LucideIcon;
}

export interface ProductData {
  id: ProductId;
  label: string; // Display name for the switcher
  title: string;
  description: string;
  image: string;
  colors: {
    gradient: string; // Tailwind gradient classes
    glow: string;     // Tailwind color class for accents
    ring: string;     // Tailwind border color for rings
  };
  stats: {
    connectionStatus: string;
    batteryLevel: number;
  };
  features: FeatureMetric[];
}

// Default Data (Adapted for tactical dashboard)
export const PRODUCT_DATA: Record<ProductId, ProductData> = {
  helmet: {
    id: 'helmet',
    label: 'Helmet',
    title: 'A.S.T.R.A Unit S3',
    description: 'The primary sensory node. Handles environmental scanning, vital optics, and encrypted low-latency tactical uplinks.',
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800&bg=000000',
    colors: {
      gradient: 'from-blue-600 to-indigo-900',
      glow: 'bg-blue-500',
      ring: 'border-l-blue-500/50',
    },
    stats: { connectionStatus: 'Uplink Stable', batteryLevel: 92 },
    features: [
      { label: 'Armor Integrity', value: 98, icon: Shield },
      { label: 'Sync Rate', value: 99, icon: Wifi },
    ],
  },
  armband: {
    id: 'armband',
    label: 'Armband',
    title: 'Bio-Metric Band',
    description: 'Continuous biometric tracking. Measures SpO2, Heart Rate, and fatigue levels with medical-grade precision.',
    image: 'https://images.unsplash.com/photo-1510017098143-4e8e040aa9a7?auto=format&fit=crop&q=80&w=800&bg=000000',
    colors: {
      gradient: 'from-brand-red to-red-950', // Using brand-red
      glow: 'bg-red-500',
      ring: 'border-r-red-500/50',
    },
    stats: { connectionStatus: 'Paired Active', batteryLevel: 85 },
    features: [
      { label: 'Sensor Link', value: 94, icon: Bluetooth },
      { label: 'Vital Accuracy', value: 98, icon: Activity },
    ],
  },
};

// =========================================
// 2. ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
  },
  image: (isLeft: boolean): Variants => ({
    initial: {
      opacity: 0,
      scale: 1.5,
      filter: 'blur(15px)',
      rotate: isLeft ? -10 : 10,
      x: isLeft ? -40 : 40,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: 0,
      x: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      filter: 'blur(20px)',
      transition: { duration: 0.25 },
    },
  }),
};

// =========================================
// 3. SUB-COMPONENTS
// =========================================

const BackgroundGradient = ({ isLeft }: { isLeft: boolean }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
    <motion.div
      animate={{
        background: isLeft
          ? 'radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.15), transparent 50%)'
          : 'radial-gradient(circle at 100% 50%, rgba(204, 0, 0, 0.15), transparent 50%)',
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    />
  </div>
);

const ProductVisual = ({ data, isLeft }: { data: ProductData; isLeft: boolean }) => (
  <motion.div layout="position" className="relative group shrink-0">
    {/* Animated Rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className={`absolute inset-[-20%] rounded-full border border-dashed border-white/5 ${data.colors.ring}`}
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-30`}
    />

    {/* Image Container */}
    <div className="relative h-64 w-64 md:h-[350px] md:w-[350px] rounded-full border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center p-4"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={data.id}
            src={data.image}
            alt={`${data.title}`}
            variants={ANIMATIONS.image(isLeft)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full object-cover rounded-full mix-blend-screen opacity-90 sepia-[0.3]"
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Status Label */}
    <motion.div
      layout="position"
      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-950/80 px-4 py-2 rounded border border-white/5 backdrop-blur">
        <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
        {data.stats.connectionStatus}
      </div>
    </motion.div>
  </motion.div>
);

const ProductDetails = ({ data, isLeft }: { data: ProductData; isLeft: boolean; key?: string }) => {
  const alignClass = isLeft ? 'items-start text-left' : 'items-end text-right';
  const flexDirClass = isLeft ? 'flex-row' : 'flex-row-reverse';
  const barColorClass = isLeft ? 'left-0 bg-blue-500' : 'right-0 bg-brand-red';

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignClass}`}
    >
      <motion.h2 variants={ANIMATIONS.item} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
        {data.label} Link
      </motion.h2>
      <motion.h1 variants={ANIMATIONS.item} className="font-display text-3xl md:text-5xl font-black tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase">
        {data.title}
      </motion.h1>
      <motion.p variants={ANIMATIONS.item} className={`text-xs text-zinc-400 tracking-wide mb-8 max-w-sm leading-relaxed ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
        {data.description}
      </motion.p>

      {/* Feature Grid */}
      <motion.div variants={ANIMATIONS.item} className="w-full space-y-6 bg-zinc-900/40 p-6 rounded border border-white/5 backdrop-blur-sm">
        {data.features.map((feature, idx) => (
          <div key={feature.label} className="group">
            <div className={`flex items-center justify-between mb-3 text-sm flex-row`}>
              <div className={`flex items-center gap-2 ${feature.value > 50 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                <feature.icon size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">{feature.label}</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">{feature.displayValue ?? `${Math.round(feature.value)}%`}</span>
            </div>
            <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feature.value}%` }}
                transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                className={`absolute top-0 bottom-0 ${barColorClass} opacity-80`}
              />
            </div>
          </div>
        ))}

        <div className={`pt-4 flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
          <button type="button" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors group">
            <Sliders size={14} /> Diagnostics
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Battery */}
      <motion.div variants={ANIMATIONS.item} className={`mt-6 flex items-center gap-2 text-zinc-500 ${flexDirClass}`}>
        <Battery size={14} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{data.stats.batteryLevel}% Charge</span>
      </motion.div>
    </motion.div>
  );
};

const Switcher = ({ 
  activeId, 
  onToggle 
}: { 
  activeId: ProductId; 
  onToggle: (id: ProductId) => void 
}) => {
  const options = Object.values(PRODUCT_DATA).map(p => ({ id: p.id, label: p.label }));

  return (
    <div className="absolute bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
      <motion.div layout className="pointer-events-auto flex items-center gap-1 p-1 rounded bg-zinc-900/80 backdrop-blur-md border border-white/5">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            whileTap={{ scale: 0.96 }}
            className="relative w-24 h-8 rounded flex items-center justify-center text-[10px] font-black uppercase tracking-widest focus:outline-none"
          >
            {activeId === opt.id && (
              <motion.div
                layoutId="island-surface"
                className="absolute inset-0 rounded bg-white/10 shadow-inner"
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${activeId === opt.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {opt.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

// =========================================
// 4. MAIN COMPONENT
// =========================================

export function EquipmentShowcase({ activeWorker }: { activeWorker?: SensorData }) {
  const [activeSide, setActiveSide] = useState<ProductId>('helmet');
  
  // Clone current data so we can mutate safely
  const currentData = { ...PRODUCT_DATA[activeSide] };
  const isLeft = activeSide === 'helmet';

  if (activeWorker) {
    if (activeSide === 'helmet') {
      currentData.stats = {
        connectionStatus: activeWorker.helmetConnected ? 'Uplink Stable' : 'Uplink Lost',
        batteryLevel: Math.round(activeWorker.helmetBattery)
      };
      
      const features = [...PRODUCT_DATA.helmet.features];
      features.splice(1, 0, {
        label: 'Impact',
        value: Math.min((activeWorker.impactG / 5) * 100, 100),
        displayValue: `${activeWorker.impactG.toFixed(1)} G`,
        icon: ShieldAlert
      });
      currentData.features = features;
      
    } else if (activeSide === 'armband') {
      currentData.stats = {
        connectionStatus: activeWorker.armbandConnected ? 'Paired Active' : 'Offline',
        batteryLevel: Math.round(activeWorker.armbandBattery)
      };
      
      const features = [...PRODUCT_DATA.armband.features];
      // You could dynamically update armband feature values here if needed.
      features[1] = {
        ...features[1],
        value: Math.min((100 - activeWorker.fatigueScore), 100), // example mapping
        displayValue: `${activeWorker.heartRate} BPM`
      };
      currentData.features = features;
    }
  }

  return (
    <div className="relative min-h-[500px] w-full bg-zinc-950/50 rounded border border-white/5 overflow-hidden flex flex-col items-center justify-center">
      
      <BackgroundGradient isLeft={isLeft} />

      <main className="relative z-10 w-full px-6 py-12 flex flex-col justify-center max-w-5xl mx-auto">
        <motion.div
          layout
          transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
          className={`flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full ${
            isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          {/* Left Column: Visuals */}
          <ProductVisual data={currentData} isLeft={isLeft} />

          {/* Right Column: Content */}
          <motion.div layout="position" className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              <ProductDetails 
                key={activeSide} // Key forces re-render for animation
                data={currentData} 
                isLeft={isLeft} 
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      <Switcher activeId={activeSide} onToggle={setActiveSide} />
    </div>
  );
}
