"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  AlertOctagon,
  Shield,
  Layers,
  Map,
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  Droplet,
  Search,
  Radio,
  Clock,
  Sparkles,
} from "lucide-react";
import WaveDivider from "../components/WaveDivider";
import ScrollExpand from "../components/ScrollExpand";

interface LandingViewProps {
  onEnterPortal: (defaultTab?: "home" | "report" | "history") => void;
  onLinkAccount: () => void;
  isAuthenticated: boolean;
}

export default function LandingView({ onEnterPortal, onLinkAccount, isAuthenticated }: LandingViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentCoords, setCurrentCoords] = useState("13.082, 80.270");

  // Simulated live sensor data updates
  const [radarPing, setRadarPing] = useState(false);
  const [waterTemp, setWaterTemp] = useState(26.4);
  const [swellHeight, setSwellHeight] = useState(1.8);

  useEffect(() => {
    const interval = setInterval(() => {
      // Toggle radar ping highlight
      setRadarPing(prev => !prev);
      
      // Slightly fluctuate sensor values to simulate live feeds
      setWaterTemp(prev => parseFloat((prev + (Math.random() * 0.2 - 0.1)).toFixed(1)));
      setSwellHeight(prev => parseFloat((prev + (Math.random() * 0.1 - 0.05)).toFixed(2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearchStatus("Querying telemetry nodes...");
    setTimeout(() => {
      if (searchQuery.toLowerCase().includes("mari") || searchQuery.toLowerCase().includes("beach")) {
        setSearchStatus("Marina Beach Sector: Active (Moderate Swell, 2 alerts Confirmed)");
      } else {
        setSearchStatus(`Sector "${searchQuery}": Linked. Standby verification active.`);
      }
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const featureCards = [
    {
      title: "AI Hazard Detection",
      desc: "Instant image analysis with Gemini Vision categorizing spills, plumes, and debris.",
      icon: Compass,
      color: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20",
    },
    {
      title: "Real-Time Alerts",
      desc: "Get SMS updates and live local marine advisories direct from emergency authorities.",
      icon: Activity,
      color: "bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20",
    },
    {
      title: "Ocean Intelligence",
      desc: "Sophisticated data clustering merges multiple citizen inputs into unique incident reports.",
      icon: Droplet,
      color: "bg-[#FF7A59]/10 text-[#FF7A59] border-[#FF7A59]/20",
    },
    {
      title: "SOS Emergency",
      desc: "One-tap distress signal coordinates dispatch to rescue squads and Coast Guard units.",
      icon: AlertOctagon,
      color: "bg-red-50 text-red-600 border-red-100",
    },
    {
      title: "Interactive Mapping",
      desc: "Explore resolved and confirmed coastal hazards near you on our real-time Leaflet map.",
      icon: Map,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Citizen Ingestion",
      desc: "Offline-first logging stores reports locally and syncs them once cellular range returns.",
      icon: Camera,
      color: "bg-[#0E1726]/5 text-[#0E1726] border-[#0E1726]/10",
    },
  ];

  return (
    <div className="flex-1 bg-[#EBF2F7] flex flex-col min-h-screen">
      
      {/* Scoped CSS styling for flowing ocean waves */}
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
      `}</style>

      {/* Hero Header Area with spacious layout, grid meshes, and flowing waves */}
      <section 
        className="relative overflow-hidden pt-20 md:pt-32 pb-32 md:pb-44 px-6 border-b border-[#D5E2EC] min-h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(235, 242, 247, 0.82), rgba(244, 248, 250, 0.82)), url('/ocean_hero_bg.png')" }}
      >
        
        {/* Stripe-style Grid overlay mesh (Linear style) */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#d5e2ec_1px,transparent_1px),linear-gradient(to_bottom,#d5e2ec_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-24 translate-x-24 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-gradient-to-tr from-[#2563EB]/10 to-[#0D9488]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic flowing ocean waves svg overlay */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-10 h-28 md:h-36">
          <svg className="w-full h-full min-h-[80px] max-h-[140px] block" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="ocean-wave-path" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
            </defs>
            <g>
              {/* Layer 1: Deep blue translucent base wave */}
              <use href="#ocean-wave-path" x="48" y="0" fill="rgba(37,99,235,0.05)" className="animate-wave-layer-1" />
              {/* Layer 2: Coastal teal swell wave */}
              <use href="#ocean-wave-path" x="48" y="3" fill="rgba(13,148,136,0.07)" className="animate-wave-layer-2" />
              {/* Layer 3: Accent tide wave */}
              <use href="#ocean-wave-path" x="48" y="5" fill="rgba(37,99,235,0.03)" className="animate-wave-layer-3" />
              {/* Layer 4: Light blending surface wave */}
              <use href="#ocean-wave-path" x="48" y="7" fill="rgba(244,248,250,0.95)" className="animate-wave-layer-4" />
            </g>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
          
          {/* Hero Left Content: Title, Query Tool, and Action Buttons */}
          <motion.div 
            className="lg:col-span-7 text-left space-y-6 md:space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Blinking Live telemetry Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white border border-[#D5E2EC] px-4 py-1.5 rounded-full text-[#2563EB] font-black text-[10px] tracking-wider uppercase shadow-sm">
              <Radio size={12} className="text-[#2563EB] animate-pulse" />
              <span>COASTAL INTEL AGENT FEED ACTIVE</span>
            </motion.div>

            {/* Heavy high-impact title */}
            <motion.h1 variants={itemVariants} className="text-4xl md:text-[54px] font-black text-[#0E1726] leading-[1.1] tracking-tight">
              An End-To-End <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0D9488] to-[#2563EB] bg-[size:200%] animate-gradient">Environmental Defense Shield</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-sm md:text-base text-[#64748B] leading-relaxed max-w-xl font-semibold">
              Leveraging advanced intelligence pipelines to verify coastal hazards, group telemetry inputs, and coordinate emergency dispatches in real-time.
            </motion.p>

            {/* Interactive Telemetry Checker Widget (Linear / Stripe style search) */}
            <motion.form 
              variants={itemVariants} 
              onSubmit={handleSearchSubmit}
              className="bg-white border border-[#D5E2EC] p-2.5 rounded-[20px] shadow-sm max-w-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter beach or coastal coordinates (e.g. Marina Beach)"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-xs font-semibold focus:outline-none placeholder-[#64748B] text-[#0E1726]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#0E1726] hover:bg-[#1A2536] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                Query Sector
              </button>
            </motion.form>

            {searchStatus && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#EBF2F7] border border-[#D5E2EC] text-[10px] text-[#2563EB] font-black rounded-xl max-w-xl text-left uppercase tracking-wide"
              >
                🛰️ STATUS: {searchStatus}
              </motion.div>
            )}

            {/* Call to Actions Grid: Prominent Upload Photo CTA */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onEnterPortal("report")}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-8 py-4 rounded-2xl text-xs tracking-widest uppercase transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(37,99,235,0.15)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Camera size={14} className="transition-transform group-hover:scale-105" />
                <span>Upload Photo Log</span>
              </button>

              <button
                onClick={() => onEnterPortal("home")}
                className="bg-white hover:bg-slate-50 border border-[#D5E2EC] text-[#0E1726] font-extrabold px-8 py-4 rounded-2xl text-xs tracking-widest uppercase transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Live Map</span>
                <ArrowRight size={14} className="text-[#64748B]" />
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Right Content: High-fidelity active circular Radar Sweep scanner over a satellite reef image */}
          <motion.div 
            className="lg:col-span-5 flex justify-center w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full max-w-[360px] aspect-[1/1] bg-[#0E1726] border border-[#1E293B] rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white select-none">
              
              {/* Grid overlay mask */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />
              
              {/* Radar scanner top metadata */}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-200">LIVE FEED</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black tracking-widest text-[#E0F2FE] uppercase block">RADAR SECTOR</span>
                  <p className="text-[10px] font-black text-slate-300 uppercase">OCW-SCAN-25.08</p>
                </div>
              </div>

              {/* Circular SVG Radar Sweeper over Satellite ocean image */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-4 shrink-0 bg-[#0B1220] rounded-full border border-[#1E293B] shadow-inner overflow-hidden">
                {/* Satellite ocean reef image background mapping */}
                <img
                  src="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2000&auto=format&fit=crop"
                  alt="Satellite radar reef grid"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-overlay"
                />

                {/* SVG radar grids */}
                <svg className="absolute w-full h-full p-2 z-10">
                  <circle cx="88" cy="88" r="76" stroke="#0D9488" strokeWidth="1" fill="none" strokeDasharray="4" className="opacity-40" />
                  <circle cx="88" cy="88" r="54" stroke="#0D9488" strokeWidth="1" fill="none" className="opacity-30" />
                  <circle cx="88" cy="88" r="30" stroke="#0D9488" strokeWidth="1" fill="none" className="opacity-30" />
                  <line x1="12" y1="88" x2="164" y2="88" stroke="#0D9488" strokeWidth="1" className="opacity-20" />
                  <line x1="88" y1="12" x2="88" y2="164" stroke="#0D9488" strokeWidth="1" className="opacity-20" />
                </svg>

                {/* Sweeping pointer arm (rotates) */}
                <div className="absolute inset-0 p-2 animate-spin duration-[6s] linear infinite z-10">
                  <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent to-[#0D9488] origin-right absolute right-[50%] top-[50%] -translate-y-[50%] shadow-[0_0_8px_#0d9488]" />
                </div>

                {/* Blinking simulated hazard points */}
                <div className="absolute top-[35%] left-[25%] flex items-center justify-center z-10">
                  <span className="absolute w-3.5 h-3.5 rounded-full bg-[#EF4444] animate-ping opacity-75" />
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                </div>

                <div className="absolute bottom-[25%] right-[30%] flex items-center justify-center z-10">
                  <span className="absolute w-3.5 h-3.5 rounded-full bg-[#FF7A59] animate-ping opacity-75" />
                  <span className="w-2 h-2 rounded-full bg-[#FF7A59]" />
                </div>

                <div className="absolute top-[45%] right-[20%] flex items-center justify-center z-10">
                  <span className="absolute w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                </div>

                <span className="text-[8px] font-black uppercase text-[#0D9488] tracking-widest relative z-25 bg-slate-900/80 px-2 py-0.5 rounded border border-[#0D9488]/30">
                  SCANNING
                </span>
              </div>

              {/* simulated data card details ticking */}
              <div className="space-y-2 relative z-10 pt-3 border-t border-white/10 text-left">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                  <span>GPS CENTROID</span>
                  <span className="text-white">{currentCoords}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                  <span>SWELL LEVEL</span>
                  <span className="text-white">{swellHeight}m (Moderate)</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                  <span>WATER TEMP</span>
                  <span className="text-[#0D9488]">{waterTemp}°C</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Wave transition spacer */}
      <WaveDivider fill="#EBF2F7" />

      {/* Scroll Expand Feature showcase */}
      <section className="relative w-full h-[600px] overflow-hidden bg-[#EBF2F7]">
        <ScrollExpand
          src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2026&auto=format&fit=crop"
          alt="Live satellite radar grid tracking waves"
          title="CLUSTERING LIVE HAZARD INPUTS"
          scrollHint="SCROLL TO EXPAND RADAR VIEW"
          useWindowScroll={true}
          startWidth={45}
          startHeight={65}
          startRadius={32}
          mediaZoom={1.4}
          scrollDistance={1.0}
          holdDistance={0.25}
        >
          <div className="max-w-xl mx-auto text-white space-y-4 px-6 relative z-20">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider">Unified GIS Orchester</h2>
            <p className="text-xs md:text-sm text-sky-100 font-semibold leading-relaxed">
              OceanWatch AI fuses individual citizen uploads in real-time, grouping coordinates within 800 meters into single, high-fidelity hazard centroids verified by Gemini Vision.
            </p>
            <button
              onClick={() => onEnterPortal("map" as any)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Access GIS Radar Map</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </ScrollExpand>
      </section>

      {/* Another Wave Divider blending into the card section */}
      <WaveDivider fill="#F4F8FA" />

      {/* Feature Grid Sections */}
      <section className="bg-[#F4F8FA] py-16 md:py-24 px-6 relative z-10 flex-1">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-[#0E1726] tracking-tight">
              A Resilient Intelligence Network
            </h2>
            <p className="text-xs md:text-sm text-[#64748B] font-bold uppercase leading-relaxed max-w-lg mx-auto">
              OceanWatch AI coordinates incident logging, Gemini vision checks, and dispatch links across coastal sector networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-[#D5E2EC] p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all space-y-4 text-left group"
                >
                  <div className={`p-3 rounded-xl inline-block border ${feat.color}`}>
                    <Icon size={20} className="group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-[#0E1726]">{feat.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-semibold">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
