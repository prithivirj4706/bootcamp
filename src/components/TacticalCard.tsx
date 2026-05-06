import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon, AlertTriangle, Zap } from 'lucide-react';

interface TacticalCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  unit: string;
  isDanger: boolean;
  dangerMessage?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TacticalCard({
  title,
  icon: Icon,
  value,
  unit,
  isDanger,
  dangerMessage = "WITHDRAWAL ALERT",
  className
}: TacticalCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border transition-all duration-300",
        isDanger 
          ? "border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
          : "border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80",
        className
      )}
    >
      {/* Structural Accents */}
      <div className="absolute top-0 right-0 h-8 w-8 opacity-20 pointer-events-none">
        <div className="absolute top-2 right-2 h-1 w-1 bg-white rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded border transition-colors",
              isDanger 
                ? "border-red-500/50 bg-red-500/10 text-red-500" 
                : "border-zinc-700 bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
            )}>
              <Icon size={14} strokeWidth={2.5} />
            </div>
            <h3 className={cn(
              "font-display text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              isDanger ? "text-red-400" : "text-zinc-500 group-hover:text-zinc-400"
            )}>
              {title}
            </h3>
          </div>
          {isDanger && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center rounded-sm bg-red-600 px-1.5 py-0.5 text-[8px] font-black text-white"
            >
              BREACH
            </motion.div>
          )}
        </div>

        <div className="mt-5 flex items-baseline gap-2">
          <span className={cn(
            "font-mono text-4xl font-bold tracking-tight leading-none tabular-nums",
            isDanger ? "text-red-500" : "text-white"
          )}>
            {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
          </span>
          <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">{unit}</span>
        </div>

        {/* Dynamic Status Indicator */}
        <div className="mt-5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800/50">
            <motion.div 
              className={cn("h-full", isDanger ? "bg-red-500" : "bg-zinc-600")}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "circOut" }}
            />
          </div>
          <span className="font-mono text-[9px] font-bold text-zinc-700">LVL_04</span>
        </div>

        <AnimatePresence>
          {isDanger && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded border border-red-500/30 bg-red-600/10 px-2 py-2 text-[9px] font-bold text-red-100 uppercase tracking-widest leading-none">
                <Zap size={10} fill="currentColor" />
                {dangerMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Industrial Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none industrial-grid" />
    </motion.div>
  );
}

// Simple Helper
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
