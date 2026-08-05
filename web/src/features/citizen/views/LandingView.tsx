import React from "react";
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
} from "lucide-react";
import WaveDivider from "../components/WaveDivider";
import ScrollExpand from "../components/ScrollExpand";

interface LandingViewProps {
  onEnterPortal: (defaultTab?: "home" | "report" | "history") => void;
  onLinkAccount: () => void;
  isAuthenticated: boolean;
}

export default function LandingView({ onEnterPortal, onLinkAccount, isAuthenticated }: LandingViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
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
      
      {/* Hero Header Area */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2563EB]/10 via-[#0D9488]/5 to-[#EBF2F7] pt-16 md:pt-28 pb-12 px-6">
        
        {/* Soft Wave Vector Background Illustration */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-24 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-gradient-to-tr from-[#2563EB]/10 to-[#0D9488]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-7 text-left space-y-6 md:space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#2563EB]/10 px-3.5 py-1.5 rounded-full border border-[#2563EB]/20 text-[#2563EB] font-bold text-xs tracking-wider">
              <Shield size={14} />
              <span>COASTAL DEFENSE AI PLATFORM</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-[#0E1726] leading-[1.1] tracking-tight">
              Protecting Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#0D9488]">Oceans</span> Through AI Intelligence
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base md:text-lg text-[#64748B] leading-relaxed max-w-xl font-medium">
              Submit hazard logs, monitor local advisory warnings, and collaborate with conservation teams to preserve marine life and protect coastal communities.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onEnterPortal("report")}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Report Ocean Hazard</span>
                <Camera size={16} className="transition-transform group-hover:rotate-6" />
              </button>

              <button
                onClick={() => onEnterPortal("home")}
                className="bg-[#F4F8FA] hover:bg-[#EBF2F7] border border-[#D5E2EC] text-[#0E1726] font-extrabold px-8 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Live Map</span>
                <ArrowRight size={16} className="text-[#64748B]" />
              </button>
            </motion.div>

            {/* Quick Stat Indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-6 border-t border-[#D5E2EC] max-w-lg">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#0E1726]">98.7%</span>
                <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase">AI Verification</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#0E1726]">12s</span>
                <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase">Response Dispatch</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#0E1726]">100%</span>
                <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase">Citizen-Driven</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right: Clean Ocean Gradient Visual Graphic */}
          <motion.div 
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-full max-w-[420px] aspect-[4/3] bg-gradient-to-br from-[#2563EB] to-[#0D9488] rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white border-4 border-[#F4F8FA]">
              {/* Soft overlay patterns */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#fff_0%,transparent_60%)]" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/20 rounded-full blur-2xl" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl">
                  <Activity size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-widest text-sky-100 uppercase">SAT-NODE</span>
                  <p className="text-xs font-bold">OCW-NODE-03</p>
                </div>
              </div>

              {/* simulated data card details */}
              <div className="space-y-3 relative z-10">
                <p className="text-[10px] font-extrabold tracking-widest text-[#E0F2FE]">REAL-TIME PIPELINE DIAGNOSTIC</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold border-b border-white/10 pb-1">
                    <span className="text-sky-100">Oil Plume Risk</span>
                    <span>Classified (92%)</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-b border-white/10 pb-1">
                    <span className="text-sky-100">Sea Debris</span>
                    <span>Needs Confirm</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-100">Distress Alerts</span>
                    <span className="text-rose-200 animate-pulse font-black">1 SOS Active</span>
                  </div>
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
              onClick={() => onEnterPortal("map")}
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
            <h2 className="text-3xl md:text-4xl font-black text-[#0E1726] tracking-tight">
              An End-To-End Environmental Defense Shield
            </h2>
            <p className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed">
              Leveraging advanced intelligence pipelines to verify coastal hazards and deploy emergency response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all flex flex-col justify-between items-start space-y-4 cursor-pointer"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onEnterPortal()}
                >
                  <div className={`p-3 rounded-xl border ${card.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-[#0E1726]">{card.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">{card.desc}</p>
                  </div>
                  <div className="text-xs font-bold text-[#2563EB] flex items-center gap-1 group pt-2">
                    <span>Access feature</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Landing Banner Call to Action */}
          <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0D9488] rounded-[24px] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_80%,#fff_0%,transparent_60%)] pointer-events-none" />
            <div className="space-y-3 max-w-lg text-left">
              <h3 className="text-xl md:text-2xl font-black">Ready to safeguard your coastal community?</h3>
              <p className="text-xs md:text-sm text-sky-100 leading-relaxed font-medium">
                Log in to link your telemetry device and start contributing verified report evidence to national defense centers.
              </p>
            </div>
            
            <div className="flex gap-4 shrink-0">
              {!isAuthenticated ? (
                <button
                  onClick={onLinkAccount}
                  className="bg-[#EBF2F7] hover:bg-[#D5E2EC] text-[#0E1726] font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Link Account Profile
                </button>
              ) : (
                <button
                  onClick={() => onEnterPortal("home")}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Enter Portal Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
