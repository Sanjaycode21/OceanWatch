import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, Waves, Info, Radio, Star, BellRing } from "lucide-react";

interface AlertItem {
  id: string;
  type: "warning" | "advisory" | "alert" | "sos";
  title: string;
  desc: string;
  timestamp: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export default function AlertsView() {
  const [alertTypeFilter, setAlertTypeFilter] = useState<"all" | "warning" | "advisory" | "alert" | "sos">("all");

  const alertsData: AlertItem[] = [
    {
      id: "a1",
      type: "warning",
      title: "HIGH WAVE SWEEPS ADVISORY",
      desc: "Large swells exceeding 4.2m detected by coastal radar nodes in Sector B. Fishing vessels advised to anchor immediately.",
      timestamp: "10 mins ago",
      priority: "CRITICAL",
    },
    {
      id: "a2",
      type: "advisory",
      title: "GOVERNMENT ECOLOGICAL NOTICE: CHEMICAL DISCHARGE",
      desc: "Estuary sectors closed near Ennore port boundaries due to detected heavy runoffs. Avoid water contact.",
      timestamp: "2 hours ago",
      priority: "HIGH",
    },
    {
      id: "a3",
      type: "alert",
      title: "DEBRIS DRIFT CLUSTER RECORDED",
      desc: "Large patch of plastic debris and wooden clutter floating in Sector C coordinates. Navigation caution required.",
      timestamp: "5 hours ago",
      priority: "MEDIUM",
    },
    {
      id: "a4",
      type: "sos",
      title: "SOS BROADCAST DISPATCH: MEDICAL EVACUATION",
      desc: "Rescue squad dispatched to coordinate overboard swimmer recovery near Sector A. Area vessels stand by.",
      timestamp: "1 day ago",
      priority: "CRITICAL",
    },
    {
      id: "a5",
      type: "advisory",
      title: "TORNADO SURGE STORM UPDATE",
      desc: "Emergency weather systems tracking storm boundaries. Swell warnings remain active.",
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

  const filteredAlerts = alertTypeFilter === "all"
    ? alertsData
    : alertsData.filter((e) => e.type === alertTypeFilter);

  return (
    <div className="space-y-6 text-[#0F172A] animate-fade-in">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-black tracking-wide">ACTIVE BROADCAST ADVISORIES</h2>
          <span className="text-[10px] text-[#64748B] font-bold uppercase">Official warnings & safety alerts</span>
        </div>
      </div>

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
              className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#CBD5E1] transition-all"
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl shrink-0 mt-0.5">
                  {getAlertIcon(alt.type)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-wide text-[#0F172A]">{alt.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed max-w-xl font-semibold">{alt.desc}</p>
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
  );
}
