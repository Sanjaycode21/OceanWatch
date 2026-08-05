"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  Loader2, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  FileText 
} from "lucide-react";
import { api } from "@/core/api";
import DashboardLayout from "@/components/DashboardLayout";

export default function TrustPage() {
  // Query: Citizen User Trust rankings list
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users-trust"],
    queryFn: async () => {
      const res = await api.get("/auth/users/trust");
      return res.data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider">CITIZEN REPUTATION REGISTRY</h2>
          <p className="text-xs text-slate-500 mt-1">Algorithmic trust ratings, verification metrics, and validation histories of reporting agents</p>
        </div>

        {/* main table section */}
        <div className="bg-[#0E1422] border border-[#1F2E4D] p-6 rounded-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#1F2E4D] pb-4">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">User Trust Ratings</h3>
          </div>

          {isLoading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs font-mono uppercase text-slate-500">Querying trust databases...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-400">
              Failed to load citizen registry.
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F2E4D] text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <th className="pb-3">Reporting User (Email)</th>
                    <th className="pb-3 text-center">Trust Index</th>
                    <th className="pb-3 text-center">Verified Reports</th>
                    <th className="pb-3 text-center">Rejected Reports</th>
                    <th className="pb-3 text-center">Accuracy Rate</th>
                    <th className="pb-3 text-right">Total Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2E4D]/40 text-slate-300">
                  {users.map((u: any) => {
                    // Highlight colors based on trust ratings
                    let trustColor = "text-emerald-400";
                    if (u.trust_score < 40.0) trustColor = "text-red-400";
                    else if (u.trust_score < 70.0) trustColor = "text-yellow-400";

                    return (
                      <tr key={u.email} className="hover:bg-[#172237]/15">
                        <td className="py-4 font-bold text-slate-200 flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          {u.email}
                        </td>
                        <td className={`py-4 text-center font-bold ${trustColor}`}>
                          {u.trust_score.toFixed(1)}%
                        </td>
                        <td className="py-4 text-center text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {u.verified_reports}
                          </span>
                        </td>
                        <td className="py-4 text-center text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            {u.rejected_reports}
                          </span>
                        </td>
                        <td className="py-4 text-center text-slate-300 font-bold">
                          {u.accuracy_rate.toFixed(1)}%
                        </td>
                        <td className="py-4 text-right text-slate-400 flex items-center justify-end gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-700" />
                          {u.total_reports}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 uppercase font-mono">
              No citizen agents registered in the database.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
