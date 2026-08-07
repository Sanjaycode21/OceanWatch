"use client";

import React from "react";
import { motion } from "framer-motion";
import ElasticMesh from "../components/ElasticMesh";
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

const CitizenIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0284C7] shrink-0 inline-block">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
  </svg>
);

const XIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="text-[#0F172A] shrink-0 inline-block">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="text-[#1877F2] shrink-0 inline-block">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const InstagramIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C] shrink-0 inline-block">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const RedditIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="text-[#FF4500] shrink-0 inline-block">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.68-6.24-1.78l1.32-4.14 4.26 1c.04.94.8 1.7 1.76 1.7 1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8c-.88 0-1.62.63-1.77 1.46l-4.75-1.12c-.22-.05-.44.09-.5.31l-1.57 4.92c-2.48.06-4.77.74-6.44 1.78-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.12.62 2.1 1.54 2.6-.04.2-.06.4-.06.6 0 3.7 4.6 6.7 10.3 6.7s10.3-3 10.3-6.7c0-.2-.02-.4-.06-.6.92-.5 1.54-1.48 1.54-2.6zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm11.5 5.5c-1.84 1.84-5.36 1.84-7.2 0-.2-.2-.2-.5 0-.7.2-.2.5-.2.7 0 1.48 1.48 4.36 1.48 5.8 0 .2-.2.5-.2.7 0 .2.2.2.5 0 .7zm-.75-4c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"/>
  </svg>
);

const NewsIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#475569] shrink-0 inline-block">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="M16 8h2" />
    <path d="M16 12h2" />
    <path d="M16 16h2" />
    <path d="M6 8h6v8H6z" />
  </svg>
);

const GovernmentIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#059669] shrink-0 inline-block">
    <path d="M22 22H2M6 22V4c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v18M10 8h4M10 12h4M10 16h4" />
  </svg>
);

const CoastGuardIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6] shrink-0 inline-block">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const WeatherAgencyIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#EA580C] shrink-0 inline-block">
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
    <polyline points="13 11 9 17 12 17 11 23 15 17 12 17 13 11" />
  </svg>
);

const DefaultGlobeIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] shrink-0 inline-block">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const getSourceIcon = (source: string) => {
  const size = 13;
  switch (source.toLowerCase()) {
    case "citizen": 
      return <CitizenIcon size={size} />;
    case "x": 
    case "twitter":
      return <XIcon size={size} />;
    case "facebook": 
      return <FacebookIcon size={size} />;
    case "instagram": 
      return <InstagramIcon size={size} />;
    case "reddit": 
      return <RedditIcon size={size} />;
    case "news": 
      return <NewsIcon size={size} />;
    case "government": 
      return <GovernmentIcon size={size} />;
    case "coast guard": 
      return <CoastGuardIcon size={size} />;
    case "weather agency": 
      return <WeatherAgencyIcon size={size} />;
    default: 
      return <DefaultGlobeIcon size={size} />;
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
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-slow {
          animation: subtle-float 6s ease-in-out infinite;
        }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.98; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.002); }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Redesigned Hero Section with floating stats */}
      <section className="relative overflow-hidden pt-14 pb-16 px-6 border border-[#B8CCD9] rounded-[36px] flex flex-col justify-center items-center text-center shadow-[0_10px_35px_rgba(37,99,235,0.04)] bg-gradient-to-br from-[#E0F2FE]/45 via-[#F0FDFA]/45 to-[#EFF6FF]/45">
        
        {/* ElasticMesh interactive background */}
        <div className="absolute inset-0 z-0 opacity-75 pointer-events-none md:pointer-events-auto">
          <ElasticMesh 
            image="/ocean_hero_bg.png" 
            interaction="hover" 
            tilt={0} 
            shading={0.65} 
            stiffness={0.035} 
            damping={0.16} 
            grabRadius={0.45} 
            pull={0.5} 
            wobble={6} 
            borderRadius={36}
            showGrid={false}
          />
        </div>
        
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

      {/* Grid of Interactive Notification Widgets */}
      <div className="space-y-6">
        
        {/* Government Advisories Card - Highlighted and Bigger */}
        <motion.div
          whileHover={{ y: -4, scale: 1.005, boxShadow: "0 15px 30px rgba(245,158,11,0.08)" }}
          transition={hoverSpringTransition}
          className="bg-[#FFFDF0] border-2 border-[#EBE2A5] p-8 rounded-[32px] text-left flex gap-5 shadow-[0_15px_30px_rgba(245,158,11,0.05)] w-full relative overflow-hidden animate-subtle-pulse"
        >
          {/* Highlight indicator border-glow */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-amber-400" />
          
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 shrink-0 border border-amber-500/20 flex items-center justify-center h-14 w-14">
            <BellRing size={26} className="animate-bounce" />
          </div>
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-widest block">GOVERNMENT ADVISORY</span>
            <h4 className="text-sm md:text-base font-black text-[#0E1726]">High Swell Warning: Chennai Sector</h4>
            <p className="text-xs text-amber-900/90 leading-relaxed font-bold">
              Fishermen are advised not to venture into deep sea quadrants near Chennai due to southwesterly currents and waves reaching heights up to 2.8m.
            </p>
          </div>
        </motion.div>

        {/* Active Hazards List Widget - highlighted and full width */}
        <div className="space-y-4 pt-2">
          <div className="text-left flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h2 className="text-base md:text-lg font-black text-white tracking-tight">Active Hazards Near You</h2>
            </div>
            <button
              onClick={() => onNavigateTab("alerts")}
              className="text-[10px] text-sky-300 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Feed</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-white border-2 border-[#CBD5E1]/70 p-8 rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.04)] space-y-5">
            {nearbyAlerts.map((alt) => {
              const isCritical = alt.severity === "CRITICAL";
              const isHigh = alt.severity === "HIGH";
              
              const cardBg = isCritical 
                ? "bg-rose-50/50 hover:bg-rose-50/90 border-[#FCA5A5]/60 border-l-rose-500 shadow-[0_4px_20px_rgba(239,68,68,0.03)]" 
                : isHigh 
                ? "bg-orange-50/40 hover:bg-orange-50/80 border-[#FED7AA]/60 border-l-orange-500 shadow-[0_4px_20px_rgba(249,115,22,0.02)]"
                : "bg-blue-50/40 hover:bg-blue-50/80 border-[#BFDBFE]/60 border-l-blue-500";
              
              const distanceText = isCritical 
                ? "text-rose-700/90" 
                : isHigh 
                ? "text-[#C2410C]/90" 
                : "text-blue-700/90";

              return (
                <motion.div
                  key={alt.id}
                  whileHover={{ x: 6, scale: 1.004 }}
                  transition={{ duration: 0.15 }}
                  className={`p-5 border-l-4 border bg-white rounded-2xl flex justify-between items-center transition-all cursor-default text-left ${cardBg}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-black text-[#0E1726]">{alt.hazard}</h4>
                      {alt.sources && (
                        <span className="bg-blue-600/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                          OSINT
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold ${distanceText}`}>{alt.distance}</p>
                    {alt.sources && (
                      <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-[#64748B]">
                        <span className="uppercase tracking-wider mr-1 text-[8px]">Sources:</span>
                        <div className="flex items-center gap-1.5">
                          {alt.sources.map((src, sIdx) => (
                            <span key={sIdx} title={src} className="opacity-90">
                              {getSourceIcon(src)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider border uppercase ${alt.color}`}>
                    {alt.severity}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
