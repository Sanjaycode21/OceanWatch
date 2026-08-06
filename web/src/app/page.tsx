"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Waves, 
  Compass, 
  Shield, 
  Camera, 
  Bell, 
  AlertOctagon, 
  ArrowRight,
  ShieldAlert,
  Activity,
  Layers
} from "lucide-react";

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen w-screen bg-[#071126] text-white flex flex-col justify-between overflow-x-hidden relative font-sans">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Subtle ocean grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl">
            <Waves className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 uppercase block">
              OceanWatch AI
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
              Intellectual Coastal Defense
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
            SYSTEM ONLINE
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-center items-center py-12 relative z-20">
        <div className="text-center space-y-6 max-w-3xl mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-wider"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Empowering Coastal Communities with Vision AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Safeguarding Oceans <br className="hidden sm:inline" />
            Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Real-Time Intelligence</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            OceanWatch AI bridges the gap between citizens and marine response teams, using Gemini Vision models and automated incident fusion to monitor and resolve maritime hazards.
          </motion.p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card 1: Citizen Portal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative bg-white/5 border border-white/10 hover:border-blue-500/30 p-8 rounded-[32px] flex flex-col justify-between h-[360px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 overflow-hidden"
          >
            {/* Ambient card glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-2xl text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Compass className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-400/80 tracking-widest">
                  PUBLIC PORTAL
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black text-white tracking-wide">
                  Citizen Portal
                </h3>
                <ul className="space-y-2 text-xs text-slate-400 font-semibold">
                  <li className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Report ocean hazards using AI.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>View nearby alerts.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Emergency SOS.</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link 
              href="/citizen"
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(37,99,235,0.2)] group-hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] cursor-pointer"
            >
              <span>Enter Citizen Portal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Card 2: Authority Portal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative bg-white/5 border border-white/10 hover:border-teal-500/30 p-8 rounded-[32px] flex flex-col justify-between h-[360px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 overflow-hidden"
          >
            {/* Ambient card glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-4 bg-teal-500/10 border border-teal-400/20 rounded-2xl text-teal-400 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase text-teal-400/80 tracking-widest">
                  AUTHORITY SECURE
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black text-white tracking-wide">
                  Authority Portal
                </h3>
                <ul className="space-y-2 text-xs text-slate-400 font-semibold">
                  <li className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Operations Command Center.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>GIS Dashboard.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Incident Verification.</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link 
              href="/login"
              className="mt-6 w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(13,148,136,0.15)] group-hover:shadow-[0_4px_25px_rgba(13,148,136,0.25)] cursor-pointer"
            >
              <span>Authority Login</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-20">
        <span>© {new Date().getFullYear()} OceanWatch Security & NDMC Division</span>
        <div className="flex gap-6">
          <Link href="/citizen" className="hover:text-white transition-colors">Citizen Console</Link>
          <Link href="/login" className="hover:text-white transition-colors">Command Login</Link>
        </div>
      </footer>

    </div>
  );
}
