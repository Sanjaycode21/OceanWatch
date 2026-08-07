import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  Waves,
  Info,
  Radio,
  Star,
  BellRing,
  Compass,
  ShieldCheck,
  Thermometer,
  Wind,
  Activity,
  Camera,
  ChevronRight,
  Droplet,
  Trash2,
  Fish,
  AlertOctagon,
  LifeBuoy,
  Cpu,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

interface AlertItem {
  id: string;
  type: "warning" | "advisory" | "alert" | "sos";
  title: string;
  desc: string;
  timestamp: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isOsint?: boolean;
  sources?: string[];
}

interface AlertsViewProps {
  onNavigateTab: (tab: "home" | "map" | "telemetry" | "report" | "alerts" | "reports" | "sos" | "profile", preset?: string) => void;
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

export default function AlertsView({ onNavigateTab }: AlertsViewProps) {
  const [alertTypeFilter, setAlertTypeFilter] = useState<"all" | "warning" | "advisory" | "alert" | "sos">("all");

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

  const alertsData: AlertItem[] = [
    {
      id: "osint1",
      type: "warning",
      title: "🚨 OSINT ALERT: CRUDE OIL SLICK DRIFTING",
      desc: "OceanWatch OSINT Correlation has clustered 18 public reports across 6 channels (X posts, local blog feeds) confirming a critical oil spill spreading near Chennai Marina Beach. Avoid water contact.",
      timestamp: "Just now",
      priority: "CRITICAL",
      isOsint: true,
      sources: ["X", "Facebook", "News", "Coast Guard", "Reddit"],
    },
    {
      id: "osint2",
      type: "advisory",
      title: "🦠 OSINT ALERT: GULF OF MANNAR ALGAL BLOOM",
      desc: "12 reports compiled across public media platforms (citizen photos, X testers, news) indicate a high-toxicity red tide bloom spreading inside the Gulf of Mannar marine zone. Swimmers and shellfishing banned.",
      timestamp: "15 mins ago",
      priority: "HIGH",
      isOsint: true,
      sources: ["Citizen", "X", "Facebook", "News", "Weather Agency"],
    },
    {
      id: "osint3",
      type: "warning",
      title: "🚨 OSINT ALERT: LAKSHADWEEP CORAL THERMAL RESISTANCE STRESS",
      desc: "Clustered public imagery and reef posts confirm elevated sea temperatures triggering local coral bleaching warnings across Kavaratti reefs. High threat to fish ecosystems.",
      timestamp: "45 mins ago",
      priority: "HIGH",
      isOsint: true,
      sources: ["X", "Citizen", "News"],
    },
    {
      id: "osint4",
      type: "alert",
      title: "🚨 OSINT ALERT: PLASTIC DEBRIS DRIFT TOWARDS SUNDARBANS",
      desc: "Aggregated citizen reports and local tourist Facebook updates highlight a large plastic clutter drift moving with tide flows towards the Sundarbans mangrove reserve.",
      timestamp: "1 hour ago",
      priority: "MEDIUM",
      isOsint: true,
      sources: ["Citizen", "Facebook", "X"],
    },
    {
      id: "a1",
      type: "warning",
      title: "HIGH WAVE SWEEPS ADVISORY",
      desc: "Large swells exceeding 4.2m detected by coastal radar nodes near Kanyakumari Coast. Fishing vessels advised to anchor immediately.",
      timestamp: "10 mins ago",
      priority: "CRITICAL",
    },
    {
      id: "a2",
      type: "advisory",
      title: "GOVERNMENT ECOLOGICAL NOTICE: CHEMICAL DISCHARGE",
      desc: "Estuary sectors closed near Ennore Port boundaries due to detected heavy chemical runoffs. Avoid water contact.",
      timestamp: "2 hours ago",
      priority: "HIGH",
    },
    {
      id: "a3",
      type: "alert",
      title: "DEBRIS DRIFT CLUSTER RECORDED",
      desc: "Large patch of plastic debris and wooden clutter floating in Mumbai Harbor coordinates. Navigation caution required.",
      timestamp: "5 hours ago",
      priority: "MEDIUM",
    },
    {
      id: "a4",
      type: "sos",
      title: "SOS BROADCAST DISPATCH: MEDICAL EVACUATION",
      desc: "Indian Coast Guard helicopter dispatched to coordinate overboard fisherman recovery near Chennai Port boundaries. Area vessels stand by.",
      timestamp: "1 day ago",
      priority: "CRITICAL",
    },
    {
      id: "a5",
      type: "advisory",
      title: "CYCLONE STORM WARNING UPDATE",
      desc: "Emergency weather systems tracking storm boundaries in the Bay of Bengal. Swell warnings remain active.",
      timestamp: "1 day ago",
      priority: "LOW",
    },
  ];

  const getPriorityStyle = (p: string) => {
    if (p === "CRITICAL") return "bg-red-50 text-[#EF4444] border-red-100";
    if (p === "HIGH") return "bg-orange-50 text-[#F59E0B] border-orange-100";
    if (p === "MEDIUM") return "bg-blue-50 text-[#0284C7] border-blue-100";
    return "bg-slate-100 text-[#64748B] border-slate-200";
  };

  const getAlertIcon = (type: string) => {
    if (type === "warning") return <AlertTriangle size={20} className="text-[#EF4444]" />;
    if (type === "advisory") return <ShieldAlert size={20} className="text-[#F59E0B]" />;
    if (type === "sos") return <Radio size={20} className="text-[#EF4444] animate-pulse" />;
    return <Waves size={20} className="text-[#0284C7]" />;
  };

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

  const filteredAlerts: AlertItem[] = alertTypeFilter === "all"
    ? alertsData
    : alertsData.filter((e) => e.type === alertTypeFilter);

  return (
    <div className="space-y-8 text-[#0F172A] animate-fade-in pb-16">
      
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



      {/* 2. Quick Report Categories Shortcuts */}
      <section className="space-y-4">
        <div className="text-left">
          <span className="text-[10px] text-[#0284C7] font-black uppercase tracking-widest block">QUICK SELECT</span>
          <h2 className="text-lg font-black text-[#0F172A]">Choose a Category to Report</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.button
              key={idx}
              whileHover={cardHoverEffects}
              whileTap={{ scale: 0.98 }}
              transition={hoverSpringTransition}
              onClick={() => {
                onNavigateTab("report", cat.preset);
              }}
              className={`p-5 bg-white border border-[#CBD5E1] rounded-[24px] text-left flex flex-col justify-between min-h-[140px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-colors cursor-pointer group ${cat.color}`}
            >
              <span className="text-3xl block filter drop-shadow-sm group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#0F172A]">{cat.label}</h4>
                <p className="text-[9px] text-[#64748B] font-semibold leading-snug">{cat.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-black tracking-wide">ACTIVE BROADCAST ADVISORIES</h2>
          <span className="text-[10px] text-[#64748B] font-bold uppercase">Official warnings & safety alerts</span>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Alerts Feed (Colspan 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button
              onClick={() => setAlertTypeFilter("all")}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                alertTypeFilter === "all"
                  ? "bg-[#0284C7] text-white border-[#0284C7]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setAlertTypeFilter("warning")}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                alertTypeFilter === "warning"
                  ? "bg-[#0284C7] text-white border-[#0284C7]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setAlertTypeFilter("advisory")}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                alertTypeFilter === "advisory"
                  ? "bg-[#0284C7] text-white border-[#0284C7]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              Govt Advisories
            </button>
            <button
              onClick={() => setAlertTypeFilter("alert")}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                alertTypeFilter === "alert"
                  ? "bg-[#0284C7] text-white border-[#0284C7]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              Ocean Alerts
            </button>
            <button
              onClick={() => setAlertTypeFilter("sos")}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                alertTypeFilter === "sos"
                  ? "bg-[#0284C7] text-white border-[#0284C7]"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              SOS Evacuations
            </button>
          </div>

          {/* Alert Feed Lists */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#64748B] bg-white border border-[#E2E8F0] rounded-2xl flex flex-col justify-center items-center gap-2">
                <BellRing size={28} className="text-[#64748B]" />
                <span>No warnings match the active category filter.</span>
              </div>
            ) : (
              filteredAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#CBD5E1] transition-all text-left"
                >
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl shrink-0 mt-0.5">
                      {getAlertIcon(alt.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black tracking-wide text-[#0F172A]">{alt.title}</h3>
                        {alt.isOsint && (
                          <span className="bg-blue-600/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider animate-pulse">
                            OSINT Fusion
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed max-w-xl font-semibold">{alt.desc}</p>
                      
                      {alt.sources && alt.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className="text-[9px] text-[#64748B] font-black uppercase tracking-wider">Clustered Channels:</span>
                          {alt.sources.map((src, sIdx) => (
                            <span key={sIdx} className="bg-slate-100 border border-[#E2E8F0] text-[#334155] text-[9px] px-2 py-0.5 rounded-lg font-black flex items-center gap-1">
                              <span>{getSourceIcon(src)}</span>
                              <span>{src}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="text-[10px] text-[#64748B] font-bold block pt-1">{alt.timestamp}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border self-start sm:self-center shrink-0 ${getPriorityStyle(alt.priority)}`}>
                    {alt.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Local Sensors & Telemetry (Colspan 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Risk Radar Widget */}
          <motion.div
            whileHover={cardHoverEffects}
            transition={hoverSpringTransition}
            className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-5 text-left relative overflow-hidden"
          >
            {/* Background scanner line overlay */}
            <div className="absolute inset-0 bg-[#E0F2FE]/10 pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#0284C7] font-black uppercase tracking-widest">LOCAL DATA SENSORS</span>
                <h3 className="text-sm font-black text-[#0F172A]">Ecosystem Risk Radar</h3>
              </div>
              <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-[8px] font-black tracking-wider uppercase">
                Chennai Node
              </span>
            </div>

            <div className="flex items-center gap-6 relative z-10 py-2">
              {/* Radar Circle */}
              <div className="relative w-24 h-24 rounded-full border-2 border-[#E2E8F0] flex items-center justify-center bg-[#F8FAFC] overflow-hidden shrink-0">
                {/* Rotating scanner sweep line */}
                <div className="absolute inset-0 border-r border-[#0284C7]/40 animate-radar-sweep origin-center" />
                <div className="absolute inset-2 border border-dashed border-[#E2E8F0] rounded-full" />
                <div className="absolute inset-6 border border-[#E2E8F0] rounded-full" />
                <Compass size={24} className="text-[#0284C7] animate-pulse" />
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
            className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-sm space-y-4 text-left"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#0284C7] font-black uppercase tracking-widest block">TELEMETRY SCANNER</span>
              <h3 className="text-sm font-black text-[#0F172A]">Ecosystem Indicators</h3>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-[#0284C7] shadow-sm">
                  <Thermometer size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Water Temp</span>
                  <span className="text-xs font-black text-[#0F172A]">28.4°C</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-[#0284C7] shadow-sm">
                  <Wind size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Wind Speed</span>
                  <span className="text-xs font-black text-[#0F172A]">12 knots</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-[#0284C7] shadow-sm">
                  <Waves size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Wave Height</span>
                  <span className="text-xs font-black text-[#0F172A]">1.4 meters</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-[#0284C7] shadow-sm">
                  <Activity size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Current Velocity</span>
                  <span className="text-xs font-black text-[#0F172A]">0.8 m/s</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
