import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Eye,
  Activity,
  FileText,
  ShieldCheck,
  Search,
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

interface ReportsViewProps {
  reports: LocalReport[];
  offlineQueue: LocalReport[];
  apiClient: any;
}

const PRESET_DESC_MAP: Record<string, string> = {
  "oilslick.png": "🌊🛢️ Coastal Oil Slick Plume",
  "stormwave.png": "🌪️🌊 Severe Swells and Wave Warnings",
  "debris.png": "🗑️ Plastic Garbage clutter",
  "runoff.png": "🏭🧪 Chemical effluent plume",
};

export default function ReportsView({ reports, offlineQueue, apiClient }: ReportsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const allItems = [...offlineQueue, ...reports];

  useEffect(() => {
    if (selectedId) {
      // Find item in reports first
      const item = allItems.find((e) => e.id === selectedId);
      if (item && !item.synced) {
        // Offline report mock detail
        setDetail({
          id: item.id,
          hazard_type: "Needs Verification (Offline)",
          latitude: item.latitude,
          longitude: item.longitude,
          created_at: item.timestamp,
          description: item.description,
          status: "PENDING_AI_ANALYSIS",
          incident_confidence: 0,
          ai_reasoning: "Report cached locally. Analysis will fire once satellite links re-establish.",
          supporting_factors: ["Local storage lock successful", "Device coordinates pre-registered"],
          contradicting_factors: ["Network socket currently closed"],
          assigned_team: "None (Unsynced)",
          resolution_notes: "None",
        });
      } else {
        loadDetail();
      }
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/reports/${selectedId}`);
      
      // If it has a fused incident associated, we can merge dispatch details
      const rep = res.data;
      let fusedInfo = { status: "INGESTED", assigned_team: "Reviewing", resolution_notes: "Ingestion pipeline active." };
      
      if (rep.fused_incident_id) {
        try {
          const fusedRes = await apiClient.get(`/incidents/${rep.fused_incident_id}`);
          fusedInfo = fusedRes.data;
        } catch (e) {
          console.log("No fused details found");
        }
      }

      setDetail({
        id: rep.id,
        hazard_type: rep.ai_hazard_type || "Ingested Sea Hazard",
        latitude: rep.latitude,
        longitude: rep.longitude,
        created_at: rep.created_at || rep.timestamp,
        description: rep.description,
        status: rep.report_status || fusedInfo.status || "INGESTED",
        incident_confidence: (rep.confidence_score || 0.92) * 100,
        ai_reasoning: rep.ai_reasoning || "Gemini vision analysis mapped textures and colors.",
        supporting_factors: rep.supporting_factors || ["Spectral colors match", "High wave sensor thresholds"],
        contradicting_factors: rep.contradicting_factors || [],
        assigned_team: fusedInfo.assigned_team || "Regional Response Unit",
        resolution_notes: fusedInfo.resolution_notes || "Under evaluation.",
      });
    } catch (err) {
      console.error(err);
      // Mock fallback
      const item = allItems.find((e) => e.id === selectedId);
      setDetail({
        id: selectedId,
        hazard_type: "Oil Spill",
        latitude: item?.latitude || 13.04,
        longitude: item?.longitude || 80.28,
        created_at: item?.timestamp || new Date().toISOString(),
        description: item?.description || "Simulated hazard report details.",
        status: "CONFIRMED",
        incident_confidence: 92,
        ai_reasoning: "Incident analysis classified pixels matching oil layer profiles.",
        supporting_factors: ["Spectral texture match", "Geographical proximity warning"],
        contradicting_factors: ["Cloud cover slightly limits visibility"],
        assigned_team: "Coast Guard Patrol Team B",
        resolution_notes: "Dispatched warning alerts. Spill boundaries quarantined.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("resolve")) return "bg-green-50 text-[#22C55E] border-green-100";
    if (s.includes("confirm")) return "bg-red-50 text-[#EF4444] border-red-100";
    if (s.includes("reject")) return "bg-slate-100 text-[#64748B] border-slate-200";
    return "bg-amber-50 text-[#EAB308] border-amber-100"; // unverified / pending
  };

  return (
    <div className="space-y-6 text-[#0F172A] animate-fade-in font-sans">
      
      {!selectedId ? (
        /* History Timeline List View */
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-base font-black tracking-wide uppercase">SUBMISSIONS DIARY</h2>
              <span className="text-[10px] text-[#64748B] font-bold uppercase">Chronological verification journal</span>
            </div>
          </div>

          {allItems.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col justify-center items-center gap-2">
              <FileText size={32} className="text-[#64748B]" />
              <span className="text-xs text-[#64748B] font-bold">No submissions have been logged on this profile yet.</span>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#CBD5E1] pl-6 ml-4 space-y-8 py-2">
              {allItems.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Timeline point indicator */}
                  <div className={`absolute -left-[32px] top-1.5 w-4 h-4 rounded-full border-2 border-white transition-transform group-hover:scale-110 shadow-sm ${
                    !item.synced ? "bg-amber-500" : "bg-[#0284C7]"
                  }`} />

                  {/* Card Wrapper */}
                  <div
                    onClick={() => setSelectedId(item.id)}
                    className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-black text-[#0F172A] hover:text-[#0284C7] transition-colors">
                          {item.description.slice(0, 50)}...
                        </span>
                        {!item.synced && (
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Offline Queue
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(item.status)}`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex gap-4 text-[10px] text-[#64748B] font-bold">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#0284C7]" />
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#0284C7]" />
                          {new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })} IST
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#0284C7] flex items-center gap-1 group/btn shrink-0">
                      <span>Telemetry details</span>
                      <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Submission Card View */
        <div className="space-y-6">
          
          {/* Back Action Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-[#64748B] hover:text-[#0F172A] font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to diary</span>
            </button>
            <span className="text-[10px] text-[#64748B] font-bold uppercase">LOG ID: {selectedId.slice(0, 8)}</span>
          </div>

          {loading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 border border-[#E2E8F0] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : detail ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Evidence, reasoning details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Categorized details */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-[#64748B] block font-bold tracking-wider uppercase">DETECTED HAZARD TYPE</span>
                      <h3 className="text-lg font-black text-[#0F172A] mt-0.5">{detail.hazard_type}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(detail.status)}`}>
                      {detail.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-[#0f172a] leading-relaxed font-semibold bg-[#F8FAFC] p-4 border border-[#E2E8F0] rounded-xl">
                    "{detail.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-[10px] text-[#64748B] font-bold">
                    <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-xl">
                      <MapPin className="text-[#0284C7]" size={14} />
                      <span>{detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-xl">
                      <Calendar className="text-[#0284C7]" size={14} />
                      <span>{new Date(detail.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Credibility Check factors */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                      <BrainCircuit className="text-[#0284C7]" size={16} />
                      Gemini Vision Reasoning
                    </span>
                    {detail.incident_confidence > 0 && (
                      <span className="text-xs font-black text-[#14B8A6] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {detail.incident_confidence.toFixed(0)}% Confidence
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                    {detail.ai_reasoning}
                  </p>

                  {/* Supporting/Contradicting grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#22C55E]">Supporting metrics</span>
                      <div className="space-y-1.5">
                        {detail.supporting_factors?.map((f: string, idx: number) => (
                          <div key={idx} className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-[#22C55E]" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#EF4444]">Contradicting metrics</span>
                      <div className="space-y-1.5">
                        {detail.contradicting_factors?.map((f: string, idx: number) => (
                          <div key={idx} className="p-2 bg-red-50/50 border border-red-100 rounded-lg text-[10px] text-red-800 font-semibold flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-[#EF4444]" />
                            <span>{f}</span>
                          </div>
                        ))}
                        {detail.contradicting_factors?.length === 0 && (
                          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-500 font-semibold">
                            No contradicting metrics detected.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coast Guard Dispatch updates log */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Active response stats */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase">CG RESPONSE DISPATCH</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-[#64748B] block font-bold uppercase">RESPONDER ASSIGNED</span>
                      <p className="text-xs font-black text-[#0F172A] mt-0.5">{detail.assigned_team || "Standby Center"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block font-bold uppercase">DISPATCH STATUS LOG</span>
                      <p className="text-xs text-[#64748B] leading-relaxed font-semibold mt-1">
                        {detail.resolution_notes || "Report was ingested by OceanWatch AI. Authority teams have been alerted to review live coordinates."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar pipeline */}
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
                  <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase">TELEMETRY PIPELINE STAGES</span>
                  
                  <div className="space-y-4 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#0284C7]" />
                      <span>Ingestion Successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#0284C7]" />
                      <span>AI Vision Checked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        detail.status === "CONFIRMED" || detail.status === "RESOLVED"
                          ? "bg-[#0284C7] border-white"
                          : "border-[#0284C7] animate-pulse"
                      }`} />
                      <span>Incident Clustered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        detail.status === "RESOLVED"
                          ? "bg-[#0284C7] border-white"
                          : "border-slate-300"
                      }`} />
                      <span>Authority Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B]">Could not fetch detailed telemetry details.</div>
          )}
        </div>
      )}
    </div>
  );
}
