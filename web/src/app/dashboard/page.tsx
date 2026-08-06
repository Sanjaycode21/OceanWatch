"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  MapPin, 
  ChevronRight, 
  TrendingUp, 
  Radio
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusChip from "@/components/StatusChip";
import PriorityChip from "@/components/PriorityChip";
import { api } from "@/core/api";

const MOCK_SUMMARY = {
  total_incidents: 8,
  confirmed_hazards: 7,
  sos_requests: 3,
  pending_verification: 1,
  todays_alerts: 22,
};

export default function DashboardPage() {
  const [sysTime, setSysTime] = React.useState("");

  React.useEffect(() => {
    setSysTime(new Date().toISOString().substring(11, 19));
    const interval = setInterval(() => {
      setSysTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Query 1: Dashboard Summary Widgets
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/summary");
        return res.data || MOCK_SUMMARY;
      } catch (err) {
        console.warn("Using mock summary:", err);
        return MOCK_SUMMARY;
      }
    },
    refetchInterval: 10000, // Poll values every 10s for active command logs
  });

  // Query 2: Recent Incidents table list
  const { data: incidents, isLoading: incLoading } = useQuery({
    queryKey: ["recent-incidents"],
    queryFn: async () => {
      try {
        const res = await api.get("/incidents?limit=5");
        return res.data || [];
      } catch (err) {
        console.warn("Using empty incidents fallback:", err);
        return [];
      }
    },
  });

  // Merge database incidents with OSINT-clustered incidents
  const mergedIncidents = React.useMemo(() => {
    const list = incidents ? [...incidents] : [];
    
    // Add the primary OSINT-clustered incidents as simulated fused reports!
    const osintIncidents = [
      {
        id: "osint-2041",
        hazard_type: "Oil Spill",
        latitude: 13.0500,
        longitude: 80.2830,
        incident_confidence: 96.0,
        priority: "CRITICAL",
        status: "CONFIRMED",
        supporting_reports: 18,
        isOsint: true,
      },
      {
        id: "osint-1089",
        hazard_type: "Algal Bloom",
        latitude: 9.2673,
        longitude: 79.2000,
        incident_confidence: 94.0,
        priority: "HIGH",
        status: "CONFIRMED",
        supporting_reports: 12,
        isOsint: true,
      },
      {
        id: "osint-3054",
        hazard_type: "Coral Bleaching",
        latitude: 10.5667,
        longitude: 72.6333,
        incident_confidence: 91.0,
        priority: "HIGH",
        status: "CONFIRMED",
        supporting_reports: 9,
        isOsint: true,
      },
      {
        id: "osint-4023",
        hazard_type: "Illegal Fishing",
        latitude: 11.6234,
        longitude: 92.7265,
        incident_confidence: 89.0,
        priority: "HIGH",
        status: "CONFIRMED",
        supporting_reports: 15,
        isOsint: true,
      },
      {
        id: "osint-1120",
        hazard_type: "Plastic Debris Drift",
        latitude: 18.9300,
        longitude: 72.8300,
        incident_confidence: 85.0,
        priority: "MEDIUM",
        status: "PROBABLE",
        supporting_reports: 6,
        isOsint: true,
      },
      {
        id: "osint-3095",
        hazard_type: "Mammal Stranding",
        latitude: 21.9497,
        longitude: 89.1833,
        incident_confidence: 90.0,
        priority: "HIGH",
        status: "CONFIRMED",
        supporting_reports: 8,
        isOsint: true,
      },
      {
        id: "osint-5012",
        hazard_type: "Chemical Leak",
        latitude: 13.2161,
        longitude: 80.3247,
        incident_confidence: 93.0,
        priority: "CRITICAL",
        status: "CONFIRMED",
        supporting_reports: 14,
        isOsint: true,
      },
      {
        id: "osint-6024",
        hazard_type: "Tsunami/Swell Surge",
        latitude: 6.0800,
        longitude: 93.8800,
        incident_confidence: 95.0,
        priority: "CRITICAL",
        status: "CONFIRMED",
        supporting_reports: 22,
        isOsint: true,
      }
    ];

    return [...osintIncidents, ...list];
  }, [incidents]);

  return (
    <DashboardLayout>
      <div className="space-y-8 text-[#0E1726] animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#D5E2EC]">
          <div>
            <h2 className="text-base font-black tracking-widest text-[#0E1726]">
              OPERATIONS CENTER OVERVIEW
            </h2>
            <p className="text-xs text-[#64748B] font-bold uppercase mt-1">
              Active Monitoring Operations Console
            </p>
          </div>
          <div className="text-right text-xs text-[#64748B] font-bold uppercase">
            SYS TIME: {sysTime || "--:--:--"} UTC
          </div>
        </div>

        {/* Telemetry Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: "Active Incidents", val: summary?.total_incidents, color: "text-[#2563EB]", bgClass: "bg-[#2563EB]/5 border-[#2563EB]/20" },
            { label: "Confirmed Hazards", val: summary?.confirmed_hazards, color: "text-[#EF4444]", bgClass: "bg-red-50/50 border-red-100" },
            { label: "SOS Requests Active", val: summary?.sos_requests, color: "text-[#FF7A59]", bgClass: "bg-amber-50/50 border-amber-100" },
            { label: "Under verification", val: summary?.pending_verification, color: "text-[#EAB308]", bgClass: "bg-yellow-50/50 border-yellow-100" },
            { label: "Today's Alerts sent", val: summary?.todays_alerts, color: "text-[#22C55E]", bgClass: "bg-emerald-50/50 border-emerald-100" }
          ].map((card, idx) => (
            <div key={idx} className={`p-6 border rounded-2xl bg-[#F4F8FA] flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md ${card.bgClass}`}>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                {card.label}
              </div>
              {sumLoading ? (
                <div className="h-8 w-16 bg-[#EBF2F7] animate-pulse rounded-xl" />
              ) : (
                <div className={`text-3xl font-black tracking-tight ${card.color}`}>
                  {card.val ?? 0}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dashboard Grid Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active Centroids Table */}
          <div className="xl:col-span-2 bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D5E2EC]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Active Hazard Centroids
                </h3>
              </div>
              <Link href="/map" className="text-xs text-[#2563EB] hover:underline font-bold flex items-center gap-1">
                <span>GIS Radar console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {incLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-50 border border-[#D5E2EC] animate-pulse rounded-xl" />
                ))}
              </div>
            ) : mergedIncidents && mergedIncidents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D5E2EC] text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                      <th className="pb-3 px-2">Hazard Type</th>
                      <th className="pb-3 px-2">Proximity Coordinates</th>
                      <th className="pb-3 px-2 text-center">Confidence</th>
                      <th className="pb-3 px-2">Severity</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-center">Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5E2EC] text-xs font-semibold text-[#0E1726]">
                    {mergedIncidents.map((inc: any) => (
                      <tr key={inc.id} className="hover:bg-[#EBF2F7]/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-[#0E1726]">
                          {inc.isOsint ? (
                            <Link href="/intelligence" className="hover:text-[#2563EB] flex items-center gap-1.5">
                              <span>{inc.hazard_type}</span>
                              <span className="bg-blue-600/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                                OSINT
                              </span>
                            </Link>
                          ) : (
                            <Link href={`/incidents/${inc.id}`} className="hover:text-[#2563EB]">
                              {inc.hazard_type}
                            </Link>
                          )}
                        </td>
                        <td className="py-4 px-2 text-[#64748B] text-[11px] font-bold">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                            {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center text-[#64748B] font-bold">
                          {inc.incident_confidence.toFixed(0)}%
                        </td>
                        <td className="py-4 px-2">
                          <PriorityChip priority={inc.priority} />
                        </td>
                        <td className="py-4 px-2">
                          <StatusChip status={inc.status} />
                        </td>
                        <td className="py-4 px-2 text-center text-[#64748B]">
                          {inc.supporting_reports}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#64748B] bg-[#EBF2F7] border border-dashed border-[#D5E2EC] rounded-xl font-bold uppercase">
                No active hazard incidents. Sector secure.
              </div>
            )}
          </div>

          {/* Command feed */}
          <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D5E2EC]">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    OSINT Social Intelligence Stream
                  </h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {[
                  { label: "🕏 X", desc: "@CoastalWatch: 'Massive petroleum smell near Marina Beach entrance...'", time: "Just now", badgeColor: "bg-slate-200 text-slate-800 border-slate-300" },
                  { label: "📰 News", desc: "Chennai Times: 'Indian Coast Guard investigating potential oil spill...'", time: "12 min ago", badgeColor: "bg-blue-100 text-blue-800 border-blue-200" },
                  { label: "🏛️ Govt", desc: "INCOIS: Gulf of Mannar shows +2.3C temperature anomaly", time: "25 min ago", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                  { label: "🍊 Reddit", desc: "r/chennai: 'Anyone know why water near Marina Beach looks rainbow?'", time: "45 min ago", badgeColor: "bg-orange-100 text-orange-800 border-orange-200" },
                  { label: "📱 Citizen", desc: "Report #0412: 'Thick brown residue coating dock structures'", time: "1 hour ago", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-[#D5E2EC] rounded-xl flex flex-col gap-1.5 text-xs font-semibold shadow-sm text-left">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.label}
                      </span>
                      <span className="text-[#64748B]">{item.time}</span>
                    </div>
                    <p className="text-[#0E1726] font-bold">"{item.desc}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#2563EB]/5 border border-[#2563EB]/15 rounded-xl text-xs font-semibold text-[#64748B] flex gap-2.5 items-center">
              <TrendingUp className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>Normal operational capacity. Radar logs functional.</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
