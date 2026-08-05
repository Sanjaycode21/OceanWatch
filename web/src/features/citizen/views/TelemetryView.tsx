"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Droplet,
  Compass,
  Wind,
  Sun,
  Waves,
  RefreshCw,
  Info,
} from "lucide-react";

export default function TelemetryView() {
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [waterTemp, setWaterTemp] = useState(26.4);
  const [swellHeight, setSwellHeight] = useState(1.8);
  const [windSpeed, setWindSpeed] = useState(14);
  const [pH, setPh] = useState(8.1);
  const [turbidity, setTurbidity] = useState(1.2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setWaterTemp(parseFloat((25.5 + Math.random() * 2).toFixed(1)));
      setSwellHeight(parseFloat((1.2 + Math.random() * 1.5).toFixed(2)));
      setWindSpeed(Math.floor(10 + Math.random() * 10));
      setPh(parseFloat((7.9 + Math.random() * 0.4).toFixed(2)));
      setTurbidity(parseFloat((0.8 + Math.random() * 0.8).toFixed(2)));
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    }, 1000);
  };

  // Apple/macOS style spring hover configs
  const hoverSpringTransition = {
    type: "spring",
    stiffness: 300,
    damping: 20
  };

  const cardHoverEffects = {
    y: -4,
    scale: 1.015,
    boxShadow: "0 12px 24px -10px rgba(14, 23, 38, 0.08)",
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header telemetry status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest block">TELEMETRY GRID NODES</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#0E1726] tracking-tight">Sensor telemetry Analytics</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#64748B] font-extrabold uppercase">
            Updated: {lastUpdated}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={`p-2.5 bg-white border border-[#D5E2EC] rounded-xl hover:border-[#CBD5E1] transition-all text-[#64748B] hover:text-[#0E1726] cursor-pointer ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </div>

      {/* Grid: Readout cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Swell Height */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="bg-white border border-[#D5E2EC] p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#2563EB]/10 rounded-2xl text-[#2563EB] border border-[#2563EB]/20">
              <Waves size={20} />
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black border border-emerald-100 uppercase tracking-wide">
              OPTIMAL
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wide">Swell Amplitude</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0E1726]">{swellHeight}</span>
              <span className="text-xs text-[#64748B] font-extrabold">meters</span>
            </div>
          </div>
        </motion.div>

        {/* Water Temp */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="bg-white border border-[#D5E2EC] p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#0D9488]/10 rounded-2xl text-[#0D9488] border border-[#0D9488]/20">
              <Droplet size={20} />
            </div>
            <span className="text-[9px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-black border border-cyan-100 uppercase tracking-wide">
              MILD
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wide">Water Temperature</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0E1726]">{waterTemp}</span>
              <span className="text-xs text-[#64748B] font-extrabold">°C</span>
            </div>
          </div>
        </motion.div>

        {/* Wind Speed */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="bg-white border border-[#D5E2EC] p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#FF7A59]/10 rounded-2xl text-[#FF7A59] border border-[#FF7A59]/20">
              <Wind size={20} />
            </div>
            <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black border border-amber-100 uppercase tracking-wide">
              MODERATE
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wide">Wind Velocity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0E1726]">{windSpeed}</span>
              <span className="text-xs text-[#64748B] font-extrabold">kts</span>
            </div>
          </div>
        </motion.div>

        {/* UV Index */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="bg-white border border-[#D5E2EC] p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
              <Sun size={20} />
            </div>
            <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-black border border-red-100 uppercase tracking-wide">
              HIGH
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase tracking-wide">UV Intensity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0E1726]">6.4</span>
              <span className="text-xs text-[#64748B] font-extrabold">index</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Analytics Chart Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Flow Tide Charts */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="lg:col-span-8 bg-white border border-[#D5E2EC] p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 cursor-default"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-[#0E1726]">Hourly Tide Cycle</h3>
              <p className="text-[10px] text-[#64748B] font-bold uppercase">Dynamic sea-level offsets (Past 12 Hours)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <span className="text-[9px] font-black text-[#64748B] uppercase">Tide Deviation (m)</span>
            </div>
          </div>

          {/* SVG line chart */}
          <div className="h-44 w-full relative pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />

              {/* Tide Wave Curve */}
              <path
                d="M 0 60 Q 62 10, 125 50 T 250 50 T 375 25 T 500 65"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              />
              <path
                d="M 0 60 Q 62 10, 125 50 T 250 50 T 375 25 T 500 65 L 500 100 L 0 100 Z"
                fill="url(#chart-glow)"
              />

              {/* Data points */}
              <circle cx="125" cy="50" r="3" fill="#2563EB" />
              <circle cx="250" cy="50" r="3" fill="#2563EB" />
              <circle cx="375" cy="25" r="3" fill="#2563EB" />
            </svg>
            <div className="absolute inset-0 flex justify-between pointer-events-none text-[8px] font-black text-[#94A3B8] pt-2">
              <span className="self-end">12:00 AM</span>
              <span className="self-end">04:00 AM</span>
              <span className="self-end">08:00 AM</span>
              <span className="self-end">12:00 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Chemical Water Index */}
        <motion.div 
          whileHover={cardHoverEffects}
          transition={hoverSpringTransition}
          className="lg:col-span-4 bg-white border border-[#D5E2EC] p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 cursor-default"
        >
          <div>
            <h3 className="text-sm font-black text-[#0E1726]">Water Quality telemetry</h3>
            <p className="text-[10px] text-[#64748B] font-bold uppercase">Chemical composition readout</p>
          </div>

          <div className="space-y-4 text-left">
            {/* pH Index */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-[#64748B]">ACIDITY INDEX</span>
                <span className="text-[#0D9488]">{pH} pH (Stable)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#0D9488] rounded-full" style={{ width: "81%" }} />
              </div>
            </div>

            {/* Turbidity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-[#64748B]">TURBIDITY (NTU)</span>
                <span className="text-[#2563EB]">{turbidity} NTU (Clear)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "20%" }} />
              </div>
            </div>

            {/* Dissolved Oxygen */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-[#64748B]">DISSOLVED OXYGEN</span>
                <span className="text-emerald-600">8.4 mg/L (Rich)</span>
              </div>
              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "84%" }} />
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#D5E2EC] p-3 rounded-2xl flex gap-2">
            <Info size={14} className="text-[#64748B] shrink-0" />
            <p className="text-[10px] text-[#64748B] font-semibold leading-normal">
              Acidity, salinity, and turbidity indices are captured from coastal telemetry buoys stationed in local buffer sectors.
            </p>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
