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

// Leaflet tile layer center and themes
const DEFAULT_CENTER: [number, number] = [12.5, 78.5]; // Centered on Southern/Coastal India
const DEFAULT_ZOOM = 5;

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
        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${activeColor}; border: 1.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(0,0,0,0.2);"></div>
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

const MOCK_MAP_DATA = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [80.2830, 13.0500] // Chennai
      },
      properties: {
        id: "osint-2041",
        marker_color: "red"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [79.2000, 9.2673] // Gulf of Mannar
      },
      properties: {
        id: "osint-1089",
        marker_color: "orange"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [72.6333, 10.5667] // Lakshadweep Reefs
      },
      properties: {
        id: "osint-3054",
        marker_color: "orange"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [92.7265, 11.6234] // Andaman Sea
      },
      properties: {
        id: "osint-4023",
        marker_color: "orange"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [72.8300, 18.9300] // Mumbai Coast
      },
      properties: {
        id: "osint-1120",
        marker_color: "yellow"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [89.1833, 21.9497] // Sundarbans
      },
      properties: {
        id: "osint-3095",
        marker_color: "yellow"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [80.3247, 13.2161] // Ennore Port Chennai
      },
      properties: {
        id: "osint-5012",
        marker_color: "red"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [93.8800, 6.0800] // Indira Point Swell
      },
      properties: {
        id: "osint-6024",
        marker_color: "red"
      }
    }
  ]
};

const MOCK_INCIDENT_DETAILS: Record<string, any> = {
  "osint-2041": {
    id: "osint-2041",
    hazard_type: "Oil Spill",
    latitude: 13.0500,
    longitude: 80.2830,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "confirmed",
    incident_confidence: 96.0,
    priority: "CRITICAL",
    supporting_reports: 18,
    assigned_team: "Coast Guard Chennai Team",
    resolution_notes: "Containment barriers deployed. Continuous satellite telemetry monitoring active."
  },
  "osint-1089": {
    id: "osint-1089",
    hazard_type: "Algal Bloom",
    latitude: 9.2673,
    longitude: 79.2000,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "confirmed",
    incident_confidence: 94.0,
    priority: "HIGH",
    supporting_reports: 12,
    assigned_team: "Gulf of Mannar Protection Div",
    resolution_notes: "Warning signs posted at public beaches. Oxygenation aerators configured."
  },
  "osint-3054": {
    id: "osint-3054",
    hazard_type: "Coral Bleaching",
    latitude: 10.5667,
    longitude: 72.6333,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "confirmed",
    incident_confidence: 91.0,
    priority: "HIGH",
    supporting_reports: 9,
    assigned_team: "Lakshadweep Reef Sentinel",
    resolution_notes: "Temperature monitoring sensors online. Public diving advisories active."
  },
  "osint-4023": {
    id: "osint-4023",
    hazard_type: "Illegal Fishing",
    latitude: 11.6234,
    longitude: 92.7265,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "confirmed",
    incident_confidence: 89.0,
    priority: "HIGH",
    supporting_reports: 15,
    assigned_team: "Station Port Blair Command",
    resolution_notes: "Trawler intercepted inside sanctuary boundaries. Processing documentation under state law."
  },
  "osint-1120": {
    id: "osint-1120",
    hazard_type: "Plastic Debris Drift",
    latitude: 18.9300,
    longitude: 72.8300,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: "probable",
    incident_confidence: 85.0,
    priority: "MEDIUM",
    supporting_reports: 6,
    assigned_team: "Mumbai Coastal Cleanup Crew",
    resolution_notes: "Vessels dispatched to deploy trash nets and intercept debris drifting south."
  },
  "osint-3095": {
    id: "osint-3095",
    hazard_type: "Mammal Stranding",
    latitude: 21.9497,
    longitude: 89.1833,
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    status: "confirmed",
    incident_confidence: 90.0,
    priority: "HIGH",
    supporting_reports: 8,
    assigned_team: "Sundarbans Life Rescue Group",
    resolution_notes: "Volunteers wet-shrouding mammals at the sandbar. Veterinarians evaluating health states."
  },
  "osint-5012": {
    id: "osint-5012",
    hazard_type: "Chemical Leak",
    latitude: 13.2161,
    longitude: 80.3247,
    created_at: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    status: "confirmed",
    incident_confidence: 93.0,
    priority: "CRITICAL",
    supporting_reports: 14,
    assigned_team: "Chennai Pollution Control Board",
    resolution_notes: "Industrial runoff pipe capped. Localized water sample tests showing declining toxin levels."
  },
  "osint-6024": {
    id: "osint-6024",
    hazard_type: "Tsunami/Swell Surge",
    latitude: 6.0800,
    longitude: 93.8800,
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    status: "confirmed",
    incident_confidence: 95.0,
    priority: "CRITICAL",
    supporting_reports: 22,
    assigned_team: "INCOIS Tsunami Warning Command",
    resolution_notes: "Deep sea buoy alerts verify swells exceeding 5 meters. Emergency coastal sirens tested."
  }
};

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
      try {
        const res = await api.get("/map/incidents");
        return res.data && res.data.features && res.data.features.length > 0 ? res.data : MOCK_MAP_DATA;
      } catch (err) {
        console.warn("Using mock map data:", err);
        return MOCK_MAP_DATA;
      }
    },
    refetchInterval: 10000,
  });

  // Query 2: Detailed view on selection
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["incident-detail", selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      try {
        const res = await api.get(`/incidents/${selectedId}`);
        return res.data || MOCK_INCIDENT_DETAILS[selectedId] || null;
      } catch (err) {
        console.warn("Using mock incident details for:", selectedId, err);
        return MOCK_INCIDENT_DETAILS[selectedId] || null;
      }
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
      // Simulate updates locally for mock items
      if (selectedId?.startsWith("osint-")) {
        return { id: selectedId, ...payload };
      }
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
    <div className="relative w-full h-[calc(100vh-8rem)] bg-[#F4F8FA] border border-[#D5E2EC] rounded-2xl overflow-hidden flex">
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
            className="w-96 bg-white border-l border-[#D5E2EC] h-full flex flex-col justify-between relative z-20 shadow-[0_0_50px_rgba(0,0,0,0.15)] text-[#0E1726]"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#D5E2EC] flex items-center justify-between bg-[#F4F8FA]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#0E1726]">
                  Incident details
                </span>
              </div>
              <button 
                onClick={() => setSelectedId(null)}
                className="p-1 hover:bg-[#EBF2F7] rounded-md text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details contents */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono text-xs text-left">
              {detailLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : detail ? (
                <>
                  {/* Category, coordinates */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#0E1726]">{detail.hazard_type}</span>
                      <StatusChip status={detail.status} />
                    </div>
                    <div className="flex justify-between text-[#64748B] text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(detail.created_at).toISOString().substring(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* AI Credibility indicators */}
                  <div className="p-4 bg-[#F4F8FA] border border-[#D5E2EC] rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#D5E2EC] pb-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">AI credibility check</span>
                      <span className="font-bold text-blue-600">{detail.incident_confidence.toFixed(1)}%</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] uppercase text-[#64748B] block font-bold">AI Reasoning</span>
                      <p className="text-[11px] text-[#475569] leading-relaxed">{detail.ai_reasoning || "Cross-correlated social media and official alerts triangulate coordinates with high fidelity."}</p>
                    </div>

                    {detail.supporting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-[#64748B] block font-bold">Supporting factors</span>
                        {detail.supporting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-emerald-600 text-[10px] font-bold">✓ {f}</div>
                        ))}
                      </div>
                    )}

                    {detail.contradicting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-[#64748B] block font-bold">Contradicting factors</span>
                        {detail.contradicting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-red-500 text-[10px] font-bold">✗ {f}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Citizen Reports list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Linked Reports ({detail.supporting_reports || 0})</span>
                    <div className="space-y-2">
                      {detail.reports?.map((r: any) => (
                        <div key={r.id} className="p-3 bg-[#F4F8FA] border border-[#D5E2EC] rounded-xl space-y-2">
                          <p className="text-[#475569] text-[11px] italic">"{r.description || 'No description provided'}"</p>
                          {r.image_url && (
                            <img 
                              src={`http://localhost:8000${r.image_url}`} 
                              alt="media" 
                              className="w-full h-24 object-cover border border-[#D5E2EC] rounded-md"
                            />
                          )}
                        </div>
                      ))}
                      {(!detail.reports || detail.reports.length === 0) && (
                        <div className="p-3 bg-[#F4F8FA] border border-[#D5E2EC] rounded-xl text-slate-500 italic text-center">
                          Fused from OSINT intelligence clusters (X, news logs, Reddit threads).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operations dispatch controller form */}
                  <form onSubmit={handleUpdate} className="space-y-4 border-t border-[#D5E2EC] pt-4">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Dispatch Actions</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-[#64748B] font-bold">Operation Status</label>
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#D5E2EC] focus:border-blue-500 rounded-xl text-xs font-mono text-[#0E1726] outline-none cursor-pointer"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="probable">Probable</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-[#64748B] font-bold">Assigned Team</label>
                      <input
                        type="text"
                        value={assignedTeam}
                        onChange={(e) => setAssignedTeam(e.target.value)}
                        placeholder="e.g. Coast Guard Team A"
                        className="w-full p-2.5 bg-white border border-[#D5E2EC] focus:border-blue-500 rounded-xl text-xs font-mono text-[#0E1726] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase text-[#64748B] font-bold">Resolution log</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write updates, logs, or notes..."
                        className="w-full p-2 h-16 bg-white border border-[#D5E2EC] focus:border-blue-500 rounded-xl text-xs font-mono text-[#0E1726] outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors"
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
