import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  AlertOctagon,
  MapPin,
  Waves,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Compass,
  Search,
  Bell,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  FileText,
  LifeBuoy,
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

interface HomeViewProps {
  userName: string;
  reports: LocalReport[];
  offlineQueueLength: number;
  onNavigateTab: (tab: "home" | "report" | "history") => void;
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
  
  const trustScore = 89;

  // Simulated list of nearby alerts
  const nearbyAlerts = [
    {
      id: "a1",
      hazard: "High Waves Swell",
      location: "Sector B Marina Beach",
      distance: "2.4 km away",
      confidence: "94% Confirmed",
      severity: "CRITICAL",
      color: "text-[#EF4444] bg-red-50 border-red-100",
    },
    {
      id: "a2",
      hazard: "Chemical Oil Slick Plume",
      location: "Sector C Ennore Coast",
      distance: "8.7 km away",
      confidence: "89% Probable",
      severity: "HIGH",
      color: "text-[#FF7A59] bg-orange-50 border-orange-100",
    },
    {
      id: "a3",
      hazard: "Debris Floating Clutter",
      location: "Harbor Breakwaters",
      distance: "4.1 km away",
      confidence: "92% Verified",
      severity: "MEDIUM",
      color: "text-[#2563EB] bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="space-y-8 text-[#0E1726] animate-fade-in font-sans">
      
      {/* Top Welcome Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D5E2EC]">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#0E1726]">
            Sentinel Portal Dashboard
          </h2>
          <p className="text-xs text-[#64748B] font-bold uppercase mt-1">
            Coastal Safety & Telemetry Feed
          </p>
        </div>

        {/* Search bar & profile shortcuts */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search coordinates..."
              className="w-full pl-9 pr-4 py-2 bg-[#F4F8FA] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl text-xs font-semibold focus:outline-none placeholder-[#64748B]"
            />
          </div>
          <div className="p-2 bg-[#F4F8FA] border border-[#D5E2EC] rounded-xl text-[#64748B] cursor-pointer hover:bg-[#EBF2F7] transition-all">
            <Bell size={16} />
          </div>
        </div>
      </div>

      {/* Row 1: Dashboard Ring Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sentinel Trust Index Card */}
        <div className="p-6 bg-gradient-to-br from-[#0E1726] via-[#1A2536] to-[#0A111F] border border-[#1E293B] rounded-[24px] shadow-lg flex flex-col justify-between h-36 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_20%,#fff_0%,transparent_60%)]" />
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Sentinel Trust Index</span>
            <h3 className="text-2xl font-black text-white">{trustScore}%</h3>
          </div>
          <div className="flex justify-between items-center relative z-10 pt-4 border-t border-white/10">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} />
              +2.4% this month
            </span>
            <span className="text-[9px] bg-white/15 text-white border border-white/10 px-2 py-0.5 rounded-full uppercase font-black">
              High
            </span>
          </div>
        </div>

        {/* Localized Risk Level circular Dial Card */}
        <div className="p-5 bg-[#F4F8FA] border border-[#D5E2EC] rounded-[24px] shadow-sm flex items-center justify-between h-36">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">LOCAL RISK LEVEL</span>
            <h3 className="text-2xl font-black text-[#FF7A59]">MODERATE</h3>
            <span className="text-[10px] font-semibold text-[#FF7A59] block pt-1">Active Swells warning</span>
          </div>
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#D5E2EC" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="#FF7A59" strokeWidth="4" fill="transparent" strokeDasharray="163" strokeDashoffset="65" />
            </svg>
            <span className="text-[10px] font-black text-[#FF7A59]">60%</span>
          </div>
        </div>

        {/* Ingested Reports circular Dial Card */}
        <div className="p-5 bg-[#F4F8FA] border border-[#D5E2EC] rounded-[24px] shadow-sm flex items-center justify-between h-36">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">LOGGED TELEMETRY</span>
            <h3 className="text-2xl font-black text-[#2563EB]">{reports.length} Reports</h3>
            <span className="text-[10px] font-semibold text-[#64748B] block pt-1">All check stages active</span>
          </div>
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#D5E2EC" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="#2563EB" strokeWidth="4" fill="transparent" strokeDasharray="163" strokeDashoffset={163 - (163 * Math.min(reports.length, 10)) / 10} />
            </svg>
            <span className="text-[10px] font-black text-[#2563EB]">{reports.length}/10</span>
          </div>
        </div>

        {/* Cache sync circle card */}
        <div className="p-5 bg-[#F4F8FA] border border-[#D5E2EC] rounded-[24px] shadow-sm flex items-center justify-between h-36">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B]">OFFLINE CACHE</span>
            <h3 className="text-2xl font-black text-[#0D9488]">{offlineQueueLength} Queued</h3>
            <span className="text-[10px] font-semibold text-[#64748B] block pt-1">Stores local reports</span>
          </div>
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#D5E2EC" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="26" stroke="#0D9488" strokeWidth="4" fill="transparent" strokeDasharray="163" strokeDashoffset={offlineQueueLength > 0 ? "80" : "163"} />
            </svg>
            <span className="text-[10px] font-black text-[#0D9488]">{offlineQueueLength > 0 ? "Sync" : "100%"}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Grid Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Nearby Active Incident Warnings (TeamHub Documents style) */}
          <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-[24px] shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D5E2EC]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-[#FF7A59]" size={18} />
                <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider">Nearby active hazard centroids</span>
              </div>
              <button onClick={() => onNavigateTab("history")} className="text-[10px] text-[#2563EB] hover:underline font-extrabold flex items-center gap-1">
                <span>View Full Warning Feed</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3.5">
              {nearbyAlerts.map((alt) => (
                <div key={alt.id} className="p-4 bg-[#EBF2F7]/50 border border-[#D5E2EC] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#CBD5E1] transition-all">
                  <div className="flex gap-3.5 items-center">
                    <div className="p-2.5 bg-[#FF7A59]/10 rounded-xl text-[#FF7A59] border border-[#FF7A59]/20 shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xs font-bold text-[#0E1726]">{alt.hazard}</h4>
                      <p className="text-[10px] text-[#64748B] font-semibold">{alt.location} • {alt.distance}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[#64748B] font-bold">{alt.confidence}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider border ${alt.color}`}>
                      {alt.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ingested Hazards Table */}
          <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-[24px] shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#D5E2EC]">
              <div className="flex items-center gap-2">
                <FileText className="text-[#2563EB]" size={18} />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Recent Ingested Hazards</span>
              </div>
              <button
                onClick={() => onNavigateTab("history")}
                className="text-[10px] text-[#2563EB] hover:underline font-extrabold flex items-center gap-1"
              >
                <span>View Full Diary</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B] bg-[#EBF2F7] border border-dashed border-[#D5E2EC] rounded-xl font-bold uppercase">
                No telemetry logs recorded. Sector clear.
              </div>
            ) : (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D5E2EC] text-[9px] uppercase font-bold tracking-wider text-[#64748B]">
                      <th className="pb-3 px-2">Hazard Data</th>
                      <th className="pb-3 px-2">Verification Status</th>
                      <th className="pb-3 px-2">GPS Centroid</th>
                      <th className="pb-3 px-2 text-right">Registered Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5E2EC]/50 text-xs font-semibold text-[#0E1726]">
                    {reports.slice(0, 3).map((item) => (
                      <tr key={item.id} className="hover:bg-[#EBF2F7]/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-[#0E1726]">
                          {item.description.slice(0, 42)}...
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            item.status.includes("RESOLVE") || item.status.includes("CONFIRM")
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-[#FF7A59] border-amber-100"
                          }`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-2 font-mono text-[10px] text-[#64748B]">
                          <div className="flex items-center gap-1 font-bold">
                            <MapPin size={12} className="text-[#2563EB]" />
                            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right text-[#64748B]">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column (1/3 width) */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Active Swim Recommendation Advice Box (Sandy/Ice blue styling) */}
          <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[24px] shadow-sm space-y-3 text-left">
            <span className="text-[10px] text-[#FF7A59] font-black uppercase tracking-wider flex items-center gap-1">
              <LifeBuoy size={14} />
              COASTAL BUFFER ADVISORY
            </span>
            <p className="text-xs text-[#0E1726] font-semibold leading-relaxed">
              Active swells indicate high wave crests swamping marina boundaries today. 
            </p>
            <div className="p-3 bg-[#F4F8FA] border border-[#D5E2EC] rounded-xl text-[10px] text-[#64748B] font-bold">
              ⚠️ Swim recommendation: Avoid coastal diving or deep offshore boating.
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="space-y-3">
            <span className="text-[9px] text-[#64748B] font-black uppercase tracking-wider block">System Channels</span>
            
            <div className="grid grid-cols-2 gap-4">
              
              <button
                onClick={() => onNavigateTab("report")}
                className="p-4 bg-[#F4F8FA] border border-[#D5E2EC] hover:border-[#2563EB]/40 rounded-2xl text-left flex flex-col justify-between h-28 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2 bg-[#2563EB]/10 rounded-xl text-[#2563EB] border border-[#2563EB]/20 shrink-0 self-start">
                  <Camera size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-wide text-[#0E1726]">LOG HAZARD</h4>
                  <span className="text-[8px] text-[#64748B] font-bold">Transmit checks</span>
                </div>
              </button>

              <button
                onClick={onTriggerSos}
                className="p-4 bg-red-50/50 border border-red-200 hover:border-red-400 rounded-2xl text-left flex flex-col justify-between h-28 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2 bg-red-100 rounded-xl text-[#EF4444] border border-red-200 shrink-0 self-start">
                  <AlertOctagon size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-wide text-[#EF4444]">SOS DISTRESS</h4>
                  <span className="text-[8px] text-red-700/80 font-bold">Launch beacon</span>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab("home")}
                className="p-4 bg-[#F4F8FA] border border-[#D5E2EC] hover:border-[#2563EB]/40 rounded-2xl text-left flex flex-col justify-between h-28 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2 bg-[#0D9488]/10 rounded-xl text-[#0D9488] border border-[#0D9488]/20 shrink-0 self-start">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-wide text-[#0E1726]">GIS MAP</h4>
                  <span className="text-[8px] text-[#64748B] font-bold">Inspect centroids</span>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab("history")}
                className="p-4 bg-[#F4F8FA] border border-[#D5E2EC] hover:border-[#2563EB]/40 rounded-2xl text-left flex flex-col justify-between h-28 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="p-2 bg-slate-100 rounded-xl text-[#0E1726] border border-slate-200 shrink-0 self-start">
                  <Activity size={18} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-wide text-[#0E1726]">LOG HISTORY</h4>
                  <span className="text-[8px] text-[#64748B] font-bold">Retransmissions</span>
                </div>
              </button>

            </div>
          </div>

          {/* Premium "Upgrade hardware links" Card */}
          <div className="p-6 bg-gradient-to-br from-[#2563EB] to-[#0D9488] border border-blue-500/10 rounded-[28px] text-white flex flex-col justify-between h-48 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_90%,#fff_0%,transparent_60%)] pointer-events-none" />
            <div className="space-y-1.5 relative z-10 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-100">Upgrade Hardware Node</h4>
              <p className="text-[10px] text-sky-100 leading-relaxed font-semibold">
                Gain real-time access to high-frequency marine radar telemetry variables and unlock multi-satellite checks.
              </p>
            </div>
            <button
              onClick={() => window.open("https://oceanwatch.org", "_blank")}
              className="w-full bg-[#F4F8FA] hover:bg-[#EBF2F7] text-[#0E1726] font-black py-2.5 rounded-xl text-[10px] shadow-sm tracking-wider uppercase relative z-10 transition-colors cursor-pointer text-center"
            >
              Initialize Sync Link
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
