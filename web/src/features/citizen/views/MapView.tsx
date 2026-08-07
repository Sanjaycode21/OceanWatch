import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Filter, AlertTriangle } from "lucide-react";

const CitizenMapInner = dynamic(
  () => import("../components/CitizenMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] bg-slate-100 border border-[#E2E8F0] rounded-2xl flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-[#0284C7]" size={32} />
        <span className="text-xs text-[#64748B] font-bold">Locking satellite radar telemetry...</span>
      </div>
    ),
  }
);

interface MapViewProps {
  apiClient: any;
}

export default function MapView({ apiClient }: MapViewProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedFilter, incidents]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/map/incidents");
      // Result is in GeoJSON format
      setIncidents(res.data.features || []);
    } catch (err) {
      console.error("Failed to load map incidents", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (selectedFilter === "all") {
      setFilteredIncidents(incidents);
      return;
    }

    const filtered = incidents.filter((feature: any) => {
      const color = feature.properties.marker_color;
      if (selectedFilter === "confirmed") return color === "red";
      if (selectedFilter === "probable") return color === "orange";
      if (selectedFilter === "needs_verification") return color === "yellow";
      if (selectedFilter === "resolved") return color === "green";
      return true;
    });
    setFilteredIncidents(filtered);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Map Control Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div>
          <h2 className="text-base font-black tracking-wide text-white">HAZARD RADAR SURVEY MAP</h2>
          <span className="text-[10px] text-slate-300 font-bold uppercase">Real-time ocean status monitoring</span>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              selectedFilter === "all"
                ? "bg-[#0284C7] text-white border-[#0284C7]"
                : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setSelectedFilter("confirmed")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === "confirmed"
                ? "bg-[#EF4444] text-white border-[#EF4444]"
                : "bg-white border-[#E2E8F0] text-[#EF4444] hover:bg-red-50"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] border border-white" />
            Confirmed
          </button>
          <button
            onClick={() => setSelectedFilter("probable")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === "probable"
                ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                : "bg-white border-[#E2E8F0] text-[#F59E0B] hover:bg-amber-50"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] border border-white" />
            Probable
          </button>
          <button
            onClick={() => setSelectedFilter("needs_verification")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === "needs_verification"
                ? "bg-[#EAB308] text-white border-[#EAB308]"
                : "bg-white border-[#E2E8F0] text-[#EAB308] hover:bg-yellow-50"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] border border-white" />
            Needs Verification
          </button>
          <button
            onClick={() => setSelectedFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              selectedFilter === "resolved"
                ? "bg-[#22C55E] text-white border-[#22C55E]"
                : "bg-white border-[#E2E8F0] text-[#22C55E] hover:bg-emerald-50"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] border border-white" />
            Resolved
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      {loading ? (
        <div className="w-full h-[650px] bg-slate-100 border border-[#E2E8F0] rounded-2xl flex flex-col justify-center items-center gap-3">
          <Loader2 className="animate-spin text-[#0284C7]" size={32} />
          <span className="text-xs text-[#64748B] font-bold">Locking satellite radar telemetry...</span>
        </div>
      ) : (
        <CitizenMapInner incidents={filteredIncidents} apiClient={apiClient} />
      )}
    </div>
  );
}
