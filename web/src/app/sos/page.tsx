"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AlertOctagon, 
  Loader2, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { api } from "@/core/api";
import DashboardLayout from "@/components/DashboardLayout";
import StatusChip from "@/components/StatusChip";

export default function SosPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignedTeam, setAssignedTeam] = useState("");
  const [statusVal, setStatusVal] = useState("accepted");

  // Query: Active SOS requests
  const { data: sosRequests, isLoading, error } = useQuery({
    queryKey: ["sos-list"],
    queryFn: async () => {
      const res = await api.get("/sos");
      return res.data;
    },
    refetchInterval: 5000, // Poll every 5s for emergency dispatches
  });

  // Mutation: Patch SOS dispatch
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { status: string; assigned_team: string } }) => {
      const res = await api.patch(`/sos/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sos-list"] });
      setEditingId(null);
      setAssignedTeam("");
    }
  });

  const handleUpdateSubmit = (id: string) => {
    updateMutation.mutate({
      id,
      payload: {
        status: statusVal,
        assigned_team: assignedTeam
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-red-500 animate-pulse flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-500" />
            SOS EMERGENCY COMMAND
          </h2>
          <p className="text-xs text-slate-500 mt-1">Live distress signals, coordinate triangulation, and rescue team assignments</p>
        </div>

        {/* main SOS dispatch area */}
        <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-4">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Live distress cues</h3>
          </div>

          {isLoading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs font-mono uppercase text-slate-500">Querying Emergency channels...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-400">
              Failed to load SOS requests.
            </div>
          ) : sosRequests && sosRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F2E4D] text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <th className="pb-3">Distress Type</th>
                    <th className="pb-3">Coordinates</th>
                    <th className="pb-3">Signal Age</th>
                    <th className="pb-3">Rescue Team</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2E4D]/40 text-slate-300">
                  {sosRequests.map((sos: any) => {
                    const isEditing = editingId === sos.id;
                    return (
                      <tr key={sos.id} className="hover:bg-[#172237]/15">
                        <td className="py-4 font-bold text-red-400 animate-pulse">{sos.emergency_type}</td>
                        <td className="py-4 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-700" />
                            {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 text-[10px] uppercase">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-700" />
                            {new Date(sos.created_at).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-4 font-bold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={assignedTeam}
                              onChange={(e) => setAssignedTeam(e.target.value)}
                              placeholder="e.g. Rescue Team Alpha"
                              className="p-1.5 bg-[#070A10] border border-[#1F2E4D] rounded-sm text-xs font-mono text-slate-200"
                            />
                          ) : (
                            sos.assigned_team || "UNASSIGNED"
                          )}
                        </td>
                        <td className="py-4">
                          {isEditing ? (
                            <select
                              value={statusVal}
                              onChange={(e) => setStatusVal(e.target.value)}
                              className="p-1.5 bg-[#070A10] border border-[#1F2E4D] rounded-sm text-xs font-mono text-slate-200"
                            >
                              <option value="accepted">Accepted</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="resolved">Resolved</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <StatusChip status={sos.status} />
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateSubmit(sos.id)}
                                className="px-2 py-1 bg-emerald-600 text-slate-100 hover:bg-emerald-500 rounded-sm text-[10px] uppercase font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-sm text-[10px] uppercase font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(sos.id);
                                setAssignedTeam(sos.assigned_team || "");
                                setStatusVal(sos.status);
                              }}
                              className="px-3 py-1 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 rounded-sm text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Dispatch Team
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 uppercase font-mono">
              No open SOS signals detected. Sector safe.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
