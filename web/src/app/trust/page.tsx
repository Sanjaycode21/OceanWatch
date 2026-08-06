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

const MOCK_TRUST_USERS = [
  {
    email: "aravind.swamy@oceanwatch.in",
    trust_score: 95.8,
    verified_reports: 24,
    rejected_reports: 1,
    accuracy_rate: 96.0,
    total_reports: 25
  },
  {
    email: "priya.sharma@coastalnet.in",
    trust_score: 88.2,
    verified_reports: 15,
    rejected_reports: 2,
    accuracy_rate: 88.2,
    total_reports: 17
  },
  {
    email: "sanjay.kumar@diverindia.org",
    trust_score: 72.4,
    verified_reports: 8,
    rejected_reports: 3,
    accuracy_rate: 72.7,
    total_reports: 11
  },
  {
    email: "deepak.raj@coastalwarn.gov.in",
    trust_score: 52.0,
    verified_reports: 4,
    rejected_reports: 4,
    accuracy_rate: 50.0,
    total_reports: 8
  }
];

export default function TrustPage() {
  // Query: Citizen User Trust rankings list
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-trust"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/users/trust");
        return res.data && res.data.length > 0 ? res.data : MOCK_TRUST_USERS;
      } catch (err) {
        console.warn("Using mock users trust rankings:", err);
        return MOCK_TRUST_USERS;
      }
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs text-[#0E1726]">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-[#0E1726]">
            CITIZEN REPUTATION REGISTRY
          </h2>
          <p className="text-xs text-slate-500 mt-1">Algorithmic trust ratings, verification metrics, and validation histories of reporting agents</p>
        </div>

        {/* main table section */}
        <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-4">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0E1726]">User Trust Ratings</h3>
          </div>

          {isLoading ? (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs font-mono uppercase text-slate-500">Querying trust databases...</span>
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D5E2EC] text-[10px] uppercase font-bold tracking-wider text-[#64748B] font-mono">
                    <th className="pb-3">Reporting User (Email)</th>
                    <th className="pb-3 text-center">Trust Index</th>
                    <th className="pb-3 text-center">Verified Reports</th>
                    <th className="pb-3 text-center">Rejected Reports</th>
                    <th className="pb-3 text-center">Accuracy Rate</th>
                    <th className="pb-3 text-right">Total Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E2EC]/50 font-mono text-xs text-[#0E1726]">
                  {users.map((u: any) => {
                    // Highlight colors based on trust ratings
                    let trustColor = "text-emerald-600";
                    if (u.trust_score < 40.0) trustColor = "text-red-500";
                    else if (u.trust_score < 70.0) trustColor = "text-yellow-600";

                    return (
                      <tr key={u.email} className="hover:bg-[#EBF2F7]/50 transition-colors">
                        <td className="py-4 font-bold text-[#0E1726] flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          {u.email}
                        </td>
                        <td className={`py-4 text-center font-bold ${trustColor}`}>
                          {u.trust_score.toFixed(1)}%
                        </td>
                        <td className="py-4 text-center text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650 text-emerald-600" />
                            {u.verified_reports}
                          </span>
                        </td>
                        <td className="py-4 text-center text-[#64748B]">
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-650 text-red-600" />
                            {u.rejected_reports}
                          </span>
                        </td>
                        <td className="py-4 text-center text-[#0E1726] font-bold">
                          {u.accuracy_rate.toFixed(1)}%
                        </td>
                        <td className="py-4 text-right text-[#64748B] flex items-center justify-end gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {u.total_reports}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-[#64748B] uppercase font-mono">
              No registered user trust records available.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
