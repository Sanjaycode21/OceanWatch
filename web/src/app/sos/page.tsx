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

const MOCK_SOS_REQUESTS = [
  {
    id: "sos-1",
    distress_type: "Medical Overboard Rescue",
    latitude: 25.7742,
    longitude: -80.1850,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    status: "accepted",
    assigned_team: "Team Alpha Dispatcher",
  },
  {
    id: "sos-2",
    distress_type: "Vessel Power Failure",
    latitude: 25.0865,
    longitude: -80.4473,
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(), // 22 min ago
    status: "pending",
    assigned_team: "Coast Guard Sentinel",
  },
  {
    id: "sos-3",
    distress_type: "Swimmer Sweep Swell",
    latitude: 25.5684,
    longitude: -80.0984,
    created_at: new Date(Date.now() - 1000 * 60 * 94).toISOString(), // 1.5 hours ago
    status: "resolved",
    assigned_team: "Miami Marine Squad",
  }
];

export default function SosPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignedTeam, setAssignedTeam] = useState("");
  const [statusVal, setStatusVal] = useState("accepted");

  // Query: Active SOS requests
  const { data: sosRequests, isLoading } = useQuery({
    queryKey: ["sos-list"],
    queryFn: async () => {
      try {
        const res = await api.get("/sos");
        return res.data && res.data.length > 0 ? res.data : MOCK_SOS_REQUESTS;
      } catch (err) {
        console.warn("Using mock SOS requests:", err);
        return MOCK_SOS_REQUESTS;
      }
    },
    refetchInterval: 5000, // Poll every 5s for emergency dispatches
  });

  // Mutation: Patch SOS dispatch
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { status: string; assigned_team: string } }) => {
      // Simulate local update for mock dispatches
      if (id.startsWith("sos-")) {
        return { id, ...payload };
      }
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
      <div className="space-y-8 font-mono text-xs text-[#0E1726]">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-red-500 animate-pulse flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-500" />
            SOS EMERGENCY COMMAND
          </h2>
          <p className="text-xs text-slate-500 mt-1">Live distress signals, coordinate triangulation, and rescue team assignments</p>
        </div>

        {/* main SOS dispatch area */}
        <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-4">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0E1726]">Live distress cues</h3>
          </div>

          {isLoading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs font-mono uppercase text-slate-500">Querying Emergency channels...</span>
            </div>
          ) : sosRequests && sosRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D5E2EC] text-[10px] uppercase font-bold tracking-wider text-[#64748B] font-mono">
                    <th className="pb-3">Distress Type</th>
                    <th className="pb-3">Coordinates</th>
                    <th className="pb-3">Signal Age</th>
                    <th className="pb-3">Rescue Team</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E2EC]/50 font-mono text-xs text-[#0E1726]">
                  {sosRequests.map((sos: any) => {
                    const signalAge = Math.max(1, Math.round((Date.now() - new Date(sos.created_at).getTime()) / (1000 * 60)));
                    
                    return (
                      <tr key={sos.id} className="hover:bg-[#EBF2F7]/50 transition-colors">
                        <td className="py-4 font-bold text-red-500 flex items-center gap-2">
                          <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                          {sos.distress_type}
                        </td>
                        <td className="py-4 text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-4 text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {signalAge} mins ago
                          </span>
                        </td>
                        <td className="py-4 font-bold text-[#0E1726]">
                          {editingId === sos.id ? (
                            <input
                              type="text"
                              value={assignedTeam}
                              onChange={(e) => setAssignedTeam(e.target.value)}
                              placeholder="Type Team..."
                              className="px-2 py-1 bg-white border border-[#D5E2EC] text-[#0E1726] rounded-md text-xs outline-none"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {sos.assigned_team || "UNASSIGNED"}
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          {editingId === sos.id ? (
                            <select
                              value={statusVal}
                              onChange={(e) => setStatusVal(e.target.value)}
                              className="px-2 py-1 bg-white border border-[#D5E2EC] text-[#0E1726] rounded-md text-xs outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          ) : (
                            <StatusChip status={sos.status} />
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {editingId === sos.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateSubmit(sos.id)}
                                className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
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
                              className="px-3 py-1.5 bg-[#EBF2F7] hover:bg-[#D5E2EC] text-[#2563EB] font-bold rounded-lg border border-[#D5E2EC] transition-all cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <span>Respond</span>
                              <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="text-center py-12 text-[#64748B] uppercase font-mono">
              Operational quiet. No active SOS signals detected.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
