import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Shield,
  Calendar,
  AlertTriangle,
  BrainCircuit,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import axios from "axios";

// Default Indian Ocean (Chennai coast) center coordinates
const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707];
const DEFAULT_ZOOM = 11;

interface MapInnerProps {
  incidents: any[];
  apiClient: any;
}

// Custom Leaflet DivIcon factory matching light theme glows
const getGisIcon = (color: string) => {
  const hexColors: Record<string, string> = {
    red: "#EF4444",       // Confirmed
    orange: "#F59E0B",    // Probable
    yellow: "#EAB308",    // Needs Verification
    green: "#22C55E"      // Resolved
  };
  const activeColor = hexColors[color] || "#EAB308";
  
  return L.divIcon({
    className: "citizen-gis-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">
        <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background-color: ${activeColor}; opacity: 0.3; animation: ping 2s infinite;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${activeColor}; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function CitizenMapInner({ incidents, apiClient }: MapInnerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (selectedId) {
      loadIncidentDetail();
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  const loadIncidentDetail = async () => {
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/incidents/${selectedId}`);
      setDetail(res.data);
    } catch (err) {
      console.error("Failed to load map incident details", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "resolved") return "bg-green-50 text-[#22C55E] border-green-100";
    if (s === "confirmed") return "bg-red-50 text-[#EF4444] border-red-100";
    if (s === "probable") return "bg-orange-50 text-[#F59E0B] border-orange-100";
    return "bg-amber-50 text-[#EAB308] border-amber-100"; // needs_verification / unverified
  };

  return (
    <div className="relative w-full h-[650px] bg-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden flex text-[#0F172A]">
      {/* map canvas */}
      <div className="flex-1 h-full relative z-10">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

      {/* side slide-in evidence drawer */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="w-80 sm:w-96 bg-white border-l border-[#E2E8F0] h-full flex flex-col justify-between relative z-20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  AI INCIDENT TELEMETRY
                </span>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 hover:bg-[#E2E8F0] rounded-lg text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs">
              {detailLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : detail ? (
                <>
                  {/* Category and status */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-[#0F172A]">{detail.hazard_type}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(detail.status)}`}>
                        {detail.status || "UNVERIFIED"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-[#64748B] font-semibold text-[10px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                        {detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                        {new Date(detail.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })} IST
                      </span>
                    </div>
                  </div>

                  {/* AI Credibility section */}
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">AI CONFIDENCE LEVEL</span>
                      <span className="font-black text-[#14B8A6]">{detail.incident_confidence.toFixed(0)}%</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                        <BrainCircuit size={12} className="text-[#0284C7]" />
                        Gemini Reasoning Summary
                      </span>
                      <p className="text-[11px] text-[#0F172A] leading-relaxed font-medium bg-white p-2.5 border border-[#E2E8F0] rounded-lg">
                        {detail.ai_reasoning || "Diagnostic details processed by visual check."}
                      </p>
                    </div>

                    {detail.supporting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-[#22C55E]">Supporting Evidence</span>
                        {detail.supporting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-[#22C55E] text-[10px] font-medium flex items-center gap-1">
                            <CheckCircle2 size={10} /> {f}
                          </div>
                        ))}
                      </div>
                    )}

                    {detail.contradicting_factors?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-[#EF4444]">Contradicting Factors</span>
                        {detail.contradicting_factors.map((f: string, i: number) => (
                          <div key={i} className="text-[#EF4444] text-[10px] font-medium flex items-center gap-1">
                            <AlertTriangle size={10} /> {f}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Citizen Reports list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">INGESTED EVIDENCE ({detail.reports?.length || 0})</span>
                    <div className="space-y-3">
                      {detail.reports?.map((r: any) => (
                        <div key={r.id} className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
                          <p className="text-[#64748B] text-[11px] font-medium leading-relaxed italic">"{r.description || 'No description provided'}"</p>
                          {r.image_url && (
                            <img
                              src={`http://localhost:8000${r.image_url}`}
                              alt="hazard capture"
                              className="w-full h-32 object-cover border border-[#E2E8F0] rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[#64748B] text-center py-12">Failed to load detailed report.</div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedId(null)}
                className="w-full bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] py-2 rounded-xl text-xs font-bold text-[#0F172A]"
              >
                Close Drawer View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
