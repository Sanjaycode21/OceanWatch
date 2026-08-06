"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  AlertTriangle,
  ChevronRight,
  Waves,
  Droplet,
  Trash2,
  Fish,
  AlertOctagon,
  LifeBuoy,
  Compass,
  Activity,
  Wind,
  Thermometer,
  ShieldCheck,
  Cpu,
  RefreshCw,
  BellRing,
  FileSpreadsheet,
} from "lucide-react";

interface LocalReport {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  timestamp: string;
  imagePreset: string;
  synced: boolean;
  status: string;
}

const getSourceIcon = (source: string) => {
  switch (source.toLowerCase()) {
    case "citizen": return "📱";
    case "x": return "🕏";
    case "facebook": return "📘";
    case "reddit": return "🍊";
    case "news": return "📰";
    case "government": return "🏛️";
    case "coast guard": return "⚓";
    case "weather agency": return "🌀";
    default: return "🌐";
  }
};

interface HomeViewProps {
  userName: string;
  reports: LocalReport[];
  offlineQueueLength: number;
  onNavigateTab: (tab: "home" | "map" | "telemetry" | "report" | "alerts" | "reports" | "sos" | "profile", preset?: string) => void;
  onTriggerSos: () => void;
  locationName?: string;
  weatherSummary?: string;
  oceanStatus?: string;
}

export default function HomeView({
  userName,
  reports,
  offlineQueueLength,
  onNavigateTab,
  onTriggerSos,
  locationName = "Marina Beach, Chennai",
  weatherSummary = "Partly Cloudy, 31°C",
  oceanStatus = "Moderate Swells / SW Currents",
}: HomeViewProps) {
  
  // Simulated list of nearby alerts containing only name, distance, and severity
  const nearbyAlerts = [
    {
      id: "osint-a1",
      hazard: "🚨 OSINT: Oil Slick Clustered",
      distance: "Marina Beach Sector B",
      severity: "CRITICAL",
      color: "text-red-600 bg-red-50 border-red-100",
      sources: ["X", "Facebook", "News", "Coast Guard", "Reddit"],
    },
    {
      id: "osint-a2",
      hazard: "🦠 OSINT: Red Tide Plume Clustered",
      distance: "Key Largo Sound",
      severity: "HIGH",
      color: "text-orange-600 bg-orange-50 border-orange-100",
      sources: ["Citizen", "X", "Facebook", "News", "Weather Agency"],
    },
    {
      id: "a1",
      hazard: "High Wave sweeps",
      distance: "2.4 km away",
      severity: "CRITICAL",
      color: "text-red-600 bg-red-50 border-red-100",
    },
    {
      id: "a2",
      hazard: "Chemical discharge runoffs",
      distance: "8.7 km away",
      severity: "HIGH",
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
  ];

  // Quick report touch categories
  const categories = [
    {
      label: "High Waves",
      emoji: "🌊",
      preset: "stormwave.png",
      desc: "Storm surges & swell waves",
      color: "hover:border-cyan-300 hover:bg-cyan-50/20"
    },
    {
      label: "Oil Spill",
      emoji: "🛢",
      preset: "oilslick.png",
      desc: "Oil sheen & chemical slicks",
      color: "hover:border-amber-300 hover:bg-amber-50/20"
    },
    {
      label: "Dead Marine Life",
      emoji: "🐟",
      preset: "deadmarine.png",
      desc: "Fish wash-ups & species deaths",
      color: "hover:border-emerald-300 hover:bg-emerald-50/20"
    },
    {
      label: "Floating Debris",
      emoji: "🗑",
      preset: "debris.png",
      desc: "Trash, plastic & wood obstacles",
      color: "hover:border-slate-300 hover:bg-slate-50/20"
    },
    {
      label: "Emergency SOS",
      emoji: "🚨",
      preset: "sos",
      desc: "Vessel capsized or active distress",
      color: "hover:border-red-300 hover:bg-red-50/20"
    }
  ];

  const hoverSpringTransition = {
    type: "spring",
    stiffness: 300,
    damping: 20
  } as const;

  const cardHoverEffects = {
    y: -5,
    scale: 1.012,
    boxShadow: "0 20px 38px -10px rgba(14, 23, 38, 0.1)",
  };

  return (
    <div className="space-y-8 text-[#0E1726] animate-fade-in font-sans pb-16">
      
      {/* Scoped CSS animations */}
      <style>{`
        @keyframes wave-swing {
          0% { transform: translate3d(-90px, 0, 0); }
          100% { transform: translate3d(85px, 0, 0); }
        }
        .animate-wave-layer-1 {
          animation: wave-swing 16s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        }
        .animate-wave-layer-2 {
          animation: wave-swing 11s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
          animation-delay: -3s;
        }
        .animate-wave-layer-3 {
          animation: wave-swing 7s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
          animation-delay: -5s;
        }
        .animate-wave-layer-4 {
          animation: wave-swing 4s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
          animation-delay: -2s;
        }
        @keyframes radar-scan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-scan 5s linear infinite;
        }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-slow {
          animation: subtle-float 6s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Redesigned Hero Section with floating stats */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E0F2FE] via-[#F0FDFA] to-[#EFF6FF] pt-14 pb-16 px-6 border border-[#B8CCD9] rounded-[36px] flex flex-col justify-center items-center text-center shadow-[0_10px_35px_rgba(37,99,235,0.04)]">
        
        {/* Grid overlay mesh */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#b8ccd9_1px,transparent_1px),linear-gradient(to_bottom,#b8ccd9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.25] pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-24 translate-x-24 w-[350px] h-[350px] bg-gradient-to-tr from-[#2563EB]/15 to-[#0D9488]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic flowing ocean waves SVG overlay */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-10 h-20">
          <svg className="w-full h-full min-h-[60px] max-h-[100px] block" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="ocean-wave-path" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
            </defs>
            <g>
              <use href="#ocean-wave-path" x="48" y="0" fill="rgba(37,99,235,0.05)" className="animate-wave-layer-1" />
              <use href="#ocean-wave-path" x="48" y="3" fill="rgba(13,148,136,0.07)" className="animate-wave-layer-2" />
              <use href="#ocean-wave-path" x="48" y="5" fill="rgba(37,99,235,0.03)" className="animate-wave-layer-3" />
              <use href="#ocean-wave-path" x="48" y="7" fill="rgba(255,255,255,1)" className="animate-wave-layer-4" />
            </g>
          </svg>
        </div>

        {/* Hero content */}
        <div className="max-w-3xl mx-auto space-y-6 relative z-20 pb-4">
          <h1 className="text-3xl md:text-5xl font-black text-[#0E1726] leading-[1.15] tracking-tight">
            See Something <span className="text-[#2563EB]">Dangerous</span> at Sea?
          </h1>
          <p className="text-base md:text-lg text-[#334155] font-extrabold max-w-2xl mx-auto leading-relaxed">
            Report hazards instantly and help protect coastal communities.
          </p>
          
          <div className="pt-2 flex justify-center">
            <motion.button
              onClick={() => onNavigateTab("report")}
              whileHover={{ scale: 1.05, y: -4, boxShadow: "0 15px 30px rgba(37,99,235,0.25)" }}
              whileTap={{ scale: 0.97 }}
              transition={hoverSpringTransition}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm md:text-base px-10 py-4.5 rounded-[22px] shadow-[0_6px_20px_rgba(37,99,235,0.15)] flex items-center justify-center gap-3 transition-colors cursor-pointer group"
            >
              <Camera size={20} className="transition-transform group-hover:scale-110" />
              <span>Report Incident</span>
            </motion.button>
          </div>
        </div>

        {/* Deck of 5 floating glass AI telemetry cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full max-w-5xl mt-6 relative z-20">
          
          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm animate-float-slow">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 mb-1 border border-emerald-500/10 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-wider">AI Live</span>
            </div>
            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Vision Status</span>
            <span className="text-xs font-black text-[#0E1726] mt-0.5">Active Scanner</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm animate-float-slow" style={{ animationDelay: "1s" }}>
            <div className="p-1.5 bg-[#2563EB]/10 rounded-lg text-[#2563EB] mb-1 border border-[#2563EB]/10">
              <Waves size={12} />
            </div>
            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Ocean Condition</span>
            <span className="text-xs font-black text-[#0E1726] mt-0.5">Moderate Swells</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm animate-float-slow" style={{ animationDelay: "2s" }}>
            <div className="p-1.5 bg-[#FF7A59]/10 rounded-lg text-[#FF7A59] mb-1 border border-[#FF7A59]/10">
              <AlertTriangle size={12} />
            </div>
            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Active Hazards</span>
            <span className="text-xs font-black text-[#0E1726] mt-0.5">3 Local Alerts</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm animate-float-slow" style={{ animationDelay: "1.5s" }}>
            <div className="p-1.5 bg-[#0D9488]/10 rounded-lg text-[#0D9488] mb-1 border border-[#0D9488]/10">
              <FileSpreadsheet size={12} />
            </div>
            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Reports Today</span>
            <span className="text-xs font-black text-[#0E1726] mt-0.5">142 Processed</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex flex-col justify-center items-center text-center shadow-sm col-span-2 sm:col-span-1 animate-float-slow" style={{ animationDelay: "2.5s" }}>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600 mb-1 border border-emerald-500/10">
              <ShieldCheck size={12} />
            </div>
            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">AI Precision</span>
            <span className="text-xs font-black text-[#0E1726] mt-0.5">94.2% Accuracy</span>
          </div>

        </div>

      </section>

      {/* 2. Quick Report Categories Shortcuts */}
      <section className="space-y-4">
        <div className="text-left">
          <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest block">QUICK SELECT</span>
          <h2 className="text-lg font-black text-[#0E1726]">Choose a Category to Report</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.button
              key={idx}
              whileHover={cardHoverEffects}
              whileTap={{ scale: 0.98 }}
              transition={hoverSpringTransition}
              onClick={() => {
                if (cat.preset === "sos") {
                  onTriggerSos();
                } else {
                  onNavigateTab("report", cat.preset);
                }
              }}
              className={`p-5 bg-white border border-[#B8CCD9] rounded-[24px] text-left flex flex-col justify-between min-h-[140px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-colors cursor-pointer group ${cat.color}`}
            >
              <span className="text-3xl block filter drop-shadow-sm group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#0E1726]">{cat.label}</h4>
                <p className="text-[9px] text-[#64748B] font-semibold leading-snug">{cat.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Rich Grid of Interactive Widgets to Eliminate Empty Space */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Live Radar Risk Scanner & Climate Telemetry (Colspan 5) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Live Risk Radar Widget */}
          <motion.div
            whileHover={cardHoverEffects}
            transition={hoverSpringTransition}
            className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-5 text-left relative overflow-hidden"
          >
            {/* Background scanner line overlay */}
            <div className="absolute inset-0 bg-[#E0F2FE]/10 pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest">LOCAL DATA SENSORS</span>
                <h3 className="text-sm font-black text-[#0E1726]">Ecosystem Risk Radar</h3>
              </div>
              <span className="px-2 py-0.5 bg-[#E2E8F0] border border-[#CBD5E1] rounded-full text-[8px] font-black tracking-wider uppercase">
                Chennai Node
              </span>
            </div>

            <div className="flex items-center gap-6 relative z-10 py-2">
              {/* Radar Circle */}
              <div className="relative w-24 h-24 rounded-full border-2 border-[#B8CCD9]/60 flex items-center justify-center bg-[#F4F8FA] overflow-hidden shrink-0">
                {/* Rotating scanner sweep line */}
                <div className="absolute inset-0 border-r border-[#2563EB]/40 animate-radar-sweep origin-center" />
                <div className="absolute inset-2 border border-dashed border-[#B8CCD9]/60 rounded-full" />
                <div className="absolute inset-6 border border-[#B8CCD9]/60 rounded-full" />
                <Compass size={24} className="text-[#2563EB] animate-pulse" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Computed Threat Level</span>
                <h4 className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck size={18} />
                  LOW RISK (24/100)
                </h4>
                <p className="text-[9px] text-[#64748B] font-semibold leading-relaxed">
                  Local sensors report wave height vectors and chemical composition indices are well within safety boundaries.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Climate Telemetry Widget */}
          <motion.div
            whileHover={cardHoverEffects}
            transition={hoverSpringTransition}
            className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4 text-left"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest block">TELEMETRY SCANNER</span>
              <h3 className="text-sm font-black text-[#0E1726]">Ecosystem Indicators</h3>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#B8CCD9] text-[#2563EB] shadow-sm">
                  <Thermometer size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Water Temp</span>
                  <span className="text-xs font-black text-[#0E1726]">28.4°C</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#B8CCD9] text-[#2563EB] shadow-sm">
                  <Wind size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Wind Speed</span>
                  <span className="text-xs font-black text-[#0E1726]">12 knots</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#B8CCD9] text-[#2563EB] shadow-sm">
                  <Waves size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Wave Height</span>
                  <span className="text-xs font-black text-[#0E1726]">1.4 meters</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#B8CCD9] text-[#2563EB] shadow-sm">
                  <Activity size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Current Velocity</span>
                  <span className="text-xs font-black text-[#0E1726]">0.8 m/s</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Center/Right Column: Active Alerts Feed (Colspan 7) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Government Advisories Card */}
          <motion.div
            whileHover={cardHoverEffects}
            transition={hoverSpringTransition}
            className="bg-[#FFFEEB]/60 border border-[#EBE2A5] p-5 rounded-[28px] text-left flex gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.01)]"
          >
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 shrink-0 border border-amber-500/15 flex items-center justify-center">
              <BellRing size={18} className="animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-amber-700 font-black uppercase tracking-widest block">GOVERNMENT ADVISORY</span>
              <h4 className="text-xs font-black text-[#0E1726]">High Swell Warning: Chennai Sector</h4>
              <p className="text-[10px] text-amber-900/80 leading-relaxed font-bold">
                Fishermen are advised not to venture into deep sea quadrants near Chennai due to southwesterly currents and waves reaching heights up to 2.8m.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            
            {/* Active Alerts List Widget */}
            <div className="sm:col-span-7 space-y-4">
              <div className="text-left flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <h2 className="text-sm font-black text-[#0E1726]">Active Hazards Near You</h2>
                </div>
                <button
                  onClick={() => onNavigateTab("alerts")}
                  className="text-[9px] text-[#2563EB] hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Full Feed</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="bg-white border border-[#B8CCD9] p-4.5 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-3">
                {nearbyAlerts.map((alt) => {
                  const isCritical = alt.severity === "CRITICAL";
                  const isHigh = alt.severity === "HIGH";
                  
                  const cardBg = isCritical 
                    ? "bg-rose-50/50 hover:bg-rose-50/90 border-[#FCA5A5]/40 border-l-rose-500" 
                    : isHigh 
                    ? "bg-orange-50/40 hover:bg-orange-50/80 border-[#FED7AA]/40 border-l-orange-500"
                    : "bg-blue-50/40 hover:bg-blue-50/80 border-[#BFDBFE]/40 border-l-blue-500";
                  
                  const distanceText = isCritical 
                    ? "text-rose-700/80" 
                    : isHigh 
                    ? "text-[#C2410C]/80" 
                    : "text-blue-700/80";

                  return (
                    <motion.div
                      key={alt.id}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.15 }}
                      className={`p-3 border-l-4 border bg-white rounded-xl flex justify-between items-center transition-all cursor-default text-left ${cardBg}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-[#0E1726]">{alt.hazard}</h4>
                          {alt.sources && (
                            <span className="bg-blue-600/10 text-blue-600 border border-blue-500/20 px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider animate-pulse">
                              OSINT
                            </span>
                          )}
                        </div>
                        <p className={`text-[9px] font-bold ${distanceText}`}>{alt.distance}</p>
                        {alt.sources && (
                          <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-[#64748B]">
                            <span className="uppercase tracking-wider mr-1 text-[7px]">Sources:</span>
                            <div className="flex items-center gap-1">
                              {alt.sources.map((src, sIdx) => (
                                <span key={sIdx} title={src} className="opacity-90">
                                  {getSourceIcon(src)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider border uppercase ${alt.color}`}>
                        {alt.severity}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Live SOS Distress Card */}
            <div className="sm:col-span-5 space-y-4">
              <div className="text-left">
                <span className="text-[10px] text-red-600 font-black uppercase tracking-widest block">DISTRESS STATUS</span>
                <h2 className="text-sm font-black text-[#0E1726]">SOS Channels</h2>
              </div>

              <motion.div
                whileHover={cardHoverEffects}
                transition={hoverSpringTransition}
                className="p-5 bg-red-50/40 border border-red-200 rounded-[24px] flex flex-col justify-between min-h-[195px] text-left cursor-default shadow-sm"
              >
                <div className="space-y-2">
                  <span className="text-[10px] text-[#EF4444] font-black uppercase tracking-wider flex items-center gap-1">
                    <LifeBuoy size={14} className="animate-pulse" />
                    Need Rescue?
                  </span>
                  <p className="text-[10px] text-red-900/80 font-bold leading-relaxed">
                    Overboard distress signals send exact coordinates immediately to coast guard response channels.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(239,68,68,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onTriggerSos}
                  className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-black py-3 rounded-xl text-[10px] shadow-sm tracking-wider uppercase transition-all cursor-pointer text-center"
                >
                  Emergency SOS
                </motion.button>
              </motion.div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
