"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Calendar, 
  AlertTriangle,
  FileText,
  Activity,
  UserCheck
} from "lucide-react";
import { api } from "@/core/api";
import StatusChip from "@/components/StatusChip";
import PriorityChip from "@/components/PriorityChip";

// Leaflet tile layer center and dark themes
const DEFAULT_CENTER: [number, number] = [25.0, -80.0]; // Default Florida/Caribbean ocean view
const DEFAULT_ZOOM = 7;

// Formulate dynamic div markers with glowing pulses
const getGisIcon = (color: string) => {
  const hexColors: Record<string, string> = {
    red: "#EF4444",
    orange: "#F97316",
    yellow: "#EAB308",
    green: "#10B981"
  };
  const activeColor = hexColors[color] || "#EAB308";
  
  return L.divIcon({
    className: "custom-radar-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
        <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background-color: ${activeColor}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${activeColor}; border: 1.5px solid #070A10; box-shadow: 0 0 8px rgba(0,0,0,0.6);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map synchronizer controller
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function CommandMap() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  
  // Operational edit forms
  const [assignedTeam, setAssignedTeam] = useState("");
  const [notes, setNotes] = useState("");
  const [statusVal, setStatusVal] = useState("");

  // Query 1: Map markers (GeoJSON)
  const { data: mapData } = useQuery({
    queryKey: ["map-incidents"],
    queryFn: async () => {
      const res = await api.get("/map/incidents");
      return res.data;
    },
    refetchInterval: 10000,
  });

  // Query 2: Detailed view on selection
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["incident-detail", selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const res = await api.get(`/incidents/${selectedId}`);
      return res.data;
    },
    enabled: !!selectedId,
  });

  // Prefill dispatch forms when detail loads
  useEffect(() => {
    if (detail) {
      setAssignedTeam(detail.assigned_team || "");
      setNotes(detail.resolution_notes || "");
      setStatusVal(detail.status || "");
    }
  }, [detail]);

  // Mutation: Dispatch Resolution update
  const updateMutation = useMutation({
    mutationFn: async (payload: { status: string; assigned_team: string; resolution_notes: string }) => {
      const res = await api.patch(`/incidents/${selectedId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-detail", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["map-incidents"] });
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    updateMutation.mutate({
      status: statusVal,
      assigned_team: assignedTeam,
      resolution_notes: notes
    });
  };

  const incidents = mapData?.features || [];

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] bg-[#070A10] border border-[#1F2E4D] rounded-sm overflow-hidden flex">
      {/* Interactive Map */}
      <div className="flex-1 h-full relative z-10">
        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={DEFAULT_ZOOM} 
          zoomControl={false}
          className="w-full h-full"
        >
          {/* Standard open source map tiles styled dark */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController center={mapCenter} />

          {incidents.map((feature: any) => {
            const [lon, lat] = feature.geometry.coordinates;
            const props = feature.properties;
            return (
              <Marker
                key={props.id}
                position={[lat, lon]}
                icon={getGisIcon(props.marker_color)}
                eventHandlers={{
                  click: () => {
                    setSelectedId(props.id);
                    setMapCenter([lat, lon]);
                  }
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Slide-out Drawer Panel */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="w-96 bg-[#0E1422] border-l border-[#1F2E4D] h-full flex flex-col justify-between relative z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1F2E4D] flex items-center justify-between bg-[#172237]/30">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
                  Incident details
                </span>
              </div>
              <button 
                onClick={() => setSelectedId(null)}
                className="p-1 hover:bg-[#1F2E4D] rounded-sm text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details contents */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono text-xs">
              {detailLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-800 animate-pulse rounded-sm" />
                  ))}
                </div>
              ) : detail ? (
                <>
                  {/* Category, coordinates */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-100">{detail.hazard_type}</span>
                      <StatusChip status={detail.status} />
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(detail.created_at).toISOString().substring(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* AI Credibility indicators */}
                  <div className="p-4 bg-[#070A10] border border-[#1F2E4D]/60 rounded-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">AI credibility check</span>
                      <span className="font-bold text-blue-400">{detail.incident_confidence.toFixed(1)}%</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] uppercase text-slate-500 block">AI Reasoning</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{detail.ai_reasoning}</p>
                    </div>

                    {detail.supporting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-slate-500 block">Supporting factors</span>
                        {detail.supporting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-emerald-400 text-[10px]">{f}</div>
                        ))}
                      </div>
                    )}

                    {detail.contradicting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-slate-500 block">Contradicting factors</span>
                        {detail.contradicting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-red-400 text-[10px]">{f}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Citizen Reports list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Reports ({detail.reports?.length})</span>
                    <div className="space-y-2">
                      {detail.reports?.map((r: any) => (
                        <div key={r.id} className="p-3 bg-[#172237]/20 border border-[#1F2E4D]/40 rounded-sm space-y-2">
                          <p className="text-slate-300 text-[11px] italic">"{r.description || 'No description provided'}"</p>
                          {r.image_url && (
                            <img 
                              src={`http://localhost:8000${r.image_url}`} 
                              alt="media" 
                              className="w-full h-24 object-cover border border-[#1F2E4D]/60 rounded-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operations dispatch controller form */}
                  <form onSubmit={handleUpdate} className="space-y-4 border-t border-[#1F2E4D] pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Actions</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-slate-500">Operation Status</label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="w-full p-2 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="probable">Probable</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-slate-500">Assigned Team</label>
                      <input
                        type="text"
                        value={assignedTeam}
                        onChange={(e) => setAssignedTeam(e.target.value)}
                        placeholder="e.g. Coast Guard Team A"
                        className="w-full p-2 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-slate-500">Resolution log</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write updates, logs, or notes..."
                        className="w-full p-2 h-16 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 text-slate-100 rounded-sm text-xs font-bold uppercase tracking-wider font-mono cursor-pointer"
                    >
                      {updateMutation.isPending ? "Syncing..." : "Update Dispatch Logs"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-slate-500 text-center py-12">Failed to load details.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
