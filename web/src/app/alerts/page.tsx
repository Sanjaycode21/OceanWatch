"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Send, 
  Loader2, 
  Filter, 
  Radio, 
  ShieldAlert,
  Calendar
} from "lucide-react";
import { api } from "@/core/api";
import DashboardLayout from "@/components/DashboardLayout";
import StatusChip from "@/components/StatusChip";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  
  // Custom filter states
  const [filterRecipient, setFilterRecipient] = useState("");
  const [filterType, setFilterType] = useState("");

  // New alert form state
  const [incidentId, setIncidentId] = useState("");
  const [alertType, setAlertType] = useState("Hazard Warning");
  const [recipientType, setRecipientType] = useState("citizen");
  const [channel, setChannel] = useState("push");
  const [formError, setFormError] = useState("");

  // Query 1: Active Alert logs
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts-list", filterRecipient, filterType],
    queryFn: async () => {
      let url = "/alerts?";
      if (filterRecipient) url += `recipient_type=${filterRecipient}&`;
      if (filterType) url += `alert_type=${filterType}&`;
      const res = await api.get(url);
      return res.data;
    },
  });

  // Query 2: Active Incidents for form select dropdown
  const { data: incidents } = useQuery({
    queryKey: ["form-incidents-list"],
    queryFn: async () => {
      const res = await api.get("/incidents?limit=50");
      return res.data;
    },
  });

  // Mutation: Dispatch Manual Alert
  const sendMutation = useMutation({
    mutationFn: async (payload: { incident_id: string; alert_type: string; recipient_type: string; delivery_channel: string }) => {
      const res = await api.post("/alerts/send", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts-list"] });
      setIncidentId("");
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || "Failed to broadcast alert. Check parameters.");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId) {
      setFormError("Please select a target incident centroid.");
      return;
    }
    sendMutation.mutate({
      incident_id: incidentId,
      alert_type: alertType,
      recipient_type: recipientType,
      delivery_channel: channel
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider">ALERT COMMAND CENTER</h2>
          <p className="text-xs text-slate-500 mt-1">Broadcast localized warnings to citizen channels and dispatch emergency advisories</p>
        </div>

        {/* Dashboard Split: Send Alerts Form vs Alerts History Table */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Dispatch Form panel */}
          <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-3">
              <Send className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Send custom alert</h3>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase text-slate-500">Target Hazard Incident</label>
                <select
                  value={incidentId}
                  onChange={(e) => setIncidentId(e.target.value)}
                  className="w-full p-2.5 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                >
                  <option value="">-- SELECT CENTROID --</option>
                  {incidents?.map((inc: any) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.hazard_type} ({inc.latitude.toFixed(2)}, {inc.longitude.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase text-slate-500">Alert Title / Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full p-2.5 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                >
                  <option value="Hazard Warning">Hazard Warning</option>
                  <option value="Dispatch Alert">Dispatch Alert</option>
                  <option value="Evacuation Order">Evacuation Order</option>
                  <option value="Government Advisory">Government Advisory</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase text-slate-500">Recipient Audience</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full p-2.5 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                >
                  <option value="citizen">Citizens (Broadcast geofenced warnings)</option>
                  <option value="authority">Authorities (Coast Guard / Rescue dispatch)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase text-slate-500">Transmission Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full p-2.5 bg-[#070A10] border border-[#1F2E4D] focus:border-blue-500 rounded-sm text-xs font-mono text-slate-200"
                >
                  <option value="push">Mobile Push Notification</option>
                  <option value="sms">SMS Network Broadcast</option>
                  <option value="dashboard">Operations Console Alert</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/40 text-slate-100 rounded-sm text-xs font-bold uppercase tracking-widest font-mono cursor-pointer flex items-center justify-center gap-2"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    Broadcast warning
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Alert Logs Panel */}
          <div className="xl:col-span-2 bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2E4D] pb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Alert transmission logs</h3>
              </div>
              
              {/* Filters toolbar */}
              <div className="flex gap-2">
                <select
                  value={filterRecipient}
                  onChange={(e) => setFilterRecipient(e.target.value)}
                  className="p-1.5 bg-[#070A10] border border-[#1F2E4D] rounded-sm text-[10px] font-mono text-slate-400"
                >
                  <option value="">All Recipients</option>
                  <option value="citizen">Citizen</option>
                  <option value="authority">Authority</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-1.5 bg-[#070A10] border border-[#1F2E4D] rounded-sm text-[10px] font-mono text-slate-400"
                >
                  <option value="">All Types</option>
                  <option value="Hazard Warning">Warning</option>
                  <option value="Dispatch Alert">Dispatch</option>
                  <option value="Evacuation Order">Evacuation</option>
                  <option value="Government Advisory">Advisory</option>
                </select>
              </div>
            </div>

            {alertsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-800/40 animate-pulse rounded-sm" />
                ))}
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F2E4D] text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                      <th className="pb-3">Alert Type</th>
                      <th className="pb-3">Recipient</th>
                      <th className="pb-3">Channel</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2E4D]/40 font-mono text-xs text-slate-300">
                    {alerts.map((al: any) => (
                      <tr key={al.id} className="hover:bg-[#172237]/15">
                        <td className="py-3 font-bold text-slate-200 flex items-center gap-2">
                          <Radio className="w-3.5 h-3.5 text-blue-500" />
                          {al.alert_type}
                        </td>
                        <td className="py-3 uppercase text-[10px] text-slate-400">{al.recipient_type}</td>
                        <td className="py-3 uppercase text-[10px] text-slate-400">{al.delivery_channel}</td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 text-[9px] font-bold uppercase">
                            {al.status}
                          </span>
                        </td>
                        <td className="py-3 text-[10px] text-slate-500 uppercase flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-700" />
                          {new Date(al.sent_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 uppercase font-mono">
                No alert records generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
