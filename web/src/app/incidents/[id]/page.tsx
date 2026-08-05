"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Activity, 
  ChevronLeft, 
  Loader2,
  AlertTriangle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { api } from "@/core/api";
import DashboardLayout from "@/components/DashboardLayout";
import StatusChip from "@/components/StatusChip";
import PriorityChip from "@/components/PriorityChip";

export default function IncidentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // Dispatch update forms state
  const [assignedTeam, setAssignedTeam] = useState("");
  const [notes, setNotes] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [priorityVal, setPriorityVal] = useState("");

  // Query incident detailed information
  const { data: detail, isLoading, error } = useQuery({
    queryKey: ["incident-detail", id],
    queryFn: async () => {
      const res = await api.get(`/incidents/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Populate operational form when details load
  useEffect(() => {
    if (detail) {
      setAssignedTeam(detail.assigned_team || "");
      setNotes(detail.resolution_notes || "");
      setStatusVal(detail.status || "");
      setPriorityVal(detail.priority || "");
    }
  }, [detail]);

  // Mutation: Dispatch update
  const updateMutation = useMutation({
    mutationFn: async (payload: { status: string; priority: string; assigned_team: string; resolution_notes: string }) => {
      const res = await api.patch(`/incidents/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-detail", id] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      status: statusVal,
      priority: priorityVal,
      assigned_team: assignedTeam,
      resolution_notes: notes,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono uppercase text-slate-500">Querying incident logs...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !detail) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-red-950/40 border border-red-500/30 text-red-400 font-mono text-xs rounded-sm">
          Failed to load incident detail. Incident ID may be invalid.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer mb-2">
          <ChevronLeft className="w-4 h-4" />
          BACK TO COMMAND CENTRAL
        </Link>

        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F2E4D] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-wider text-slate-100">{detail.hazard_type}</h2>
              <StatusChip status={detail.status} />
              <PriorityChip priority={detail.priority} />
            </div>
            <div className="flex flex-wrap gap-4 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                Coordinates: {detail.latitude.toFixed(4)}, {detail.longitude.toFixed(4)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                Observation: {new Date(detail.created_at).toUTCString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end bg-blue-950/20 border border-blue-900/40 p-4 rounded-sm text-right">
            <span className="text-[10px] text-slate-500 uppercase">AI confidence index</span>
            <span className="text-2xl font-bold text-blue-400">{detail.incident_confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Detailed Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Area (Reports and Evidence) */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Evidence Collection & Credibility Strategies */}
            <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-3">
                <ShieldAlert className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Credibility Analysis</h3>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Telemetry Reasoning</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">{detail.ai_reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Supporting factors */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-sm space-y-2">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block">Supporting Indicators</span>
                  <div className="space-y-1">
                    {detail.supporting_factors?.map((f: string, i: number) => (
                      <div key={i} className="text-emerald-400 text-[10px]">{f}</div>
                    ))}
                    {(!detail.supporting_factors || detail.supporting_factors.length === 0) && (
                      <div className="text-slate-600">No supporting factors listed.</div>
                    )}
                  </div>
                </div>

                {/* Contradicting factors */}
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-sm space-y-2">
                  <span className="text-[10px] uppercase text-red-400 font-bold block">Contradicting Indicators</span>
                  <div className="space-y-1">
                    {detail.contradicting_factors?.map((f: string, i: number) => (
                      <div key={i} className="text-red-400 text-[10px]">{f}</div>
                    ))}
                    {(!detail.contradicting_factors || detail.contradicting_factors.length === 0) && (
                      <div className="text-slate-600">No contradicting factors listed.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Reports lists */}
            <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Linked Citizen Reports ({detail.reports?.length})</h3>
              </div>

              <div className="space-y-4">
                {detail.reports?.map((rep: any) => (
                  <div key={rep.id} className="p-4 bg-[#070A10] border border-[#1F2E4D]/40 rounded-sm space-y-3">
                    <div className="flex justify-between text-slate-500 text-[10px] uppercase border-b border-[#1F2E4D]/30 pb-2">
                      <span>Report #{rep.id.substring(0, 8)}</span>
                      <span>{new Date(rep.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">"{rep.description || 'No description provided.'}"</p>
                    
                    {rep.image_url && (
                      <div>
                        <span className="text-[9px] uppercase text-slate-500 block mb-1">Attached Media</span>
                        <img 
                          src={`http://localhost:8000${rep.image_url}`} 
                          alt="Report photo" 
                          className="max-w-md w-full h-48 object-cover border border-[#1F2E4D]/60 rounded-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Operations dispatcher Panel */}
          <div className="space-y-6">
            <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Dispatcher Command Panel</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="text-[9px] uppercase text-slate-500">Incident Severity</label>
                  <select
                    value={priorityVal}
                    onChange={(e) => setPriorityVal(e.target.value)}
                    className="w-full p-2 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-slate-500">Assigned Team</label>
                  <input
                    type="text"
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                    placeholder="e.g. Navy Salvage Team B"
                    className="w-full p-2 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase text-slate-500">Resolution log</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write updates, logs, or notes..."
                    className="w-full p-2 h-24 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 text-slate-100 rounded-sm text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-all"
                >
                  {updateMutation.isPending ? "Syncing..." : "Sync Dispatch Logs"}
                </button>
              </form>
            </div>

            {/* Incident timeline display */}
            <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Incident Timeline</h3>
              </div>

              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F2E4D]">
                <div className="relative pl-6 space-y-1">
                  <div className="absolute left-0 top-1 w-4.5 h-4.5 rounded-full border-2 border-blue-500 bg-[#0E1422] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">Step 1: AI Triangulation</span>
                  <p className="text-[11px] text-slate-300">Incident Centroid generated based on citizen telemetry overlaps.</p>
                </div>

                {detail.assigned_team && (
                  <div className="relative pl-6 space-y-1">
                    <div className="absolute left-0 top-1 w-4.5 h-4.5 rounded-full border-2 border-amber-500 bg-[#0E1422] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">Step 2: Operational Dispatch</span>
                    <p className="text-[11px] text-slate-300">Operational team assigned: {detail.assigned_team}.</p>
                  </div>
                )}

                {detail.status === "resolved" && (
                  <div className="relative pl-6 space-y-1">
                    <div className="absolute left-0 top-1 w-4.5 h-4.5 rounded-full border-2 border-emerald-500 bg-[#0E1422] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">Step 3: Incident Resolved</span>
                    <p className="text-[11px] text-slate-300">Incident closed. Notes: {detail.resolution_notes || "None."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
