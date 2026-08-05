"use client";

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

export default function DashboardPage() {
  // Query 1: Dashboard Summary Widgets
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get("/dashboard/summary");
      return res.data;
    },
    refetchInterval: 10000, // Poll values every 10s for active command logs
  });

  // Query 2: Recent Incidents table list
  const { data: incidents, isLoading: incLoading } = useQuery({
    queryKey: ["recent-incidents"],
    queryFn: async () => {
      const res = await api.get("/incidents?limit=5");
      return res.data;
    },
  });

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
            SYS TIME: {new Date().toISOString().substring(11, 19)} UTC
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
            ) : incidents && incidents.length > 0 ? (
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
                    {incidents.map((inc: any) => (
                      <tr key={inc.id} className="hover:bg-[#EBF2F7]/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-[#0E1726]">
                          <Link href={`/incidents/${inc.id}`} className="hover:text-[#2563EB]">
                            {inc.hazard_type}
                          </Link>
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
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#D5E2EC]">
                <Activity className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Command log Feed
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { desc: "Geofenced citizen warning sent for Pollution event in Sector B", time: "2 min ago", icon: Radio, textClass: "text-[#0E1726]" },
                  { desc: "Incident Centroid updated by AI Orchester Credibility engine", time: "15 min ago", icon: ShieldAlert, textClass: "text-[#0E1726]" },
                  { desc: "Rescue team Team Alpha assigned to SOS emergency", time: "34 min ago", icon: AlertTriangle, textClass: "text-[#EF4444]" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#EBF2F7] border border-[#D5E2EC] rounded-xl flex gap-3 text-xs font-semibold">
                    <item.icon className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className={item.textClass}>{item.desc}</p>
                      <span className="text-[9px] text-[#64748B] font-bold uppercase">{item.time}</span>
                    </div>
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
