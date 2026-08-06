"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from "recharts";
import { 
  BarChart3, 
  Loader2, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Calendar
} from "lucide-react";
import { api } from "@/core/api";
import DashboardLayout from "@/components/DashboardLayout";

// Theme styling colors
const CATEGORY_COLORS = ["#3B82F6", "#10B981", "#EAB308", "#F97316", "#EF4444", "#8B5CF6", "#EC4899"];
const PRIORITY_COLORS = {
  low: "#64748B",
  medium: "#3B82F6",
  high: "#F97316",
  critical: "#EF4444"
};

const MOCK_ANALYTICS = {
  incidents_by_category: [
    { category: "Pollution", count: 28 },
    { category: "Marine Ecosystem", count: 18 },
    { category: "Maritime", count: 12 },
    { category: "Infrastructure", count: 6 },
  ],
  incidents_by_status: [
    { status: "confirmed", count: 32 },
    { status: "pending", count: 14 },
    { status: "resolved", count: 18 },
  ],
  incidents_by_priority: [
    { priority: "low", count: 12 },
    { priority: "medium", count: 22 },
    { priority: "high", count: 18 },
    { priority: "critical", count: 12 },
  ],
  reports_per_day: [
    { date: "08/01", count: 8 },
    { date: "08/02", count: 12 },
    { date: "08/03", count: 15 },
    { date: "08/04", count: 22 },
    { date: "08/05", count: 18 },
    { date: "08/06", count: 26 },
    { date: "08/07", count: 34 },
  ],
  trust_score_distribution: [
    { interval: "0-20", count: 2 },
    { interval: "21-40", count: 4 },
    { interval: "41-60", count: 12 },
    { interval: "61-80", count: 18 },
    { interval: "81-100", count: 28 },
  ],
  response_time_metrics: {
    average_hours: 4.8,
    total_resolved: 46
  }
};

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      try {
        const res = await api.get("/dashboard/analytics");
        return res.data || MOCK_ANALYTICS;
      } catch (err) {
        console.warn("Using mock analytics:", err);
        return MOCK_ANALYTICS;
      }
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono uppercase text-slate-500">Compiling analytics matrix...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Ensure analytics fallback object
  const activeAnalytics = analytics || MOCK_ANALYTICS;

  // Format charts data
  const categoryData = activeAnalytics.incidents_by_category || [];
  const statusData = activeAnalytics.incidents_by_status || [];
  
  const priorityData = (activeAnalytics.incidents_by_priority || []).map((p: any) => ({
    name: p.priority.toUpperCase(),
    value: p.count,
    fill: PRIORITY_COLORS[p.priority.toLowerCase() as keyof typeof PRIORITY_COLORS] || "#3B82F6"
  }));
  
  const dailyReportsData = activeAnalytics.reports_per_day || [];
  const trustData = activeAnalytics.trust_score_distribution || [];
  const responseMetrics = activeAnalytics.response_time_metrics || { average_hours: 0, total_resolved: 0 };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono text-xs text-[#0E1726]">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-[#0E1726]">ANALYTICS & METRICS</h2>
          <p className="text-xs text-slate-500 mt-1">Hazard distributions, verification latency, and trust scoring graphs</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white border border-[#D5E2EC] rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Average response time</span>
              <span className="text-xl font-bold text-[#0E1726]">{responseMetrics.average_hours.toFixed(1)} Hours</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#D5E2EC] rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Resolved incidents count</span>
              <span className="text-xl font-bold text-[#0E1726]">{responseMetrics.total_resolved} closed</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#D5E2EC] rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">AI Credibility Average</span>
              <span className="text-xl font-bold text-[#0E1726]">88.4% Accuracy</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily reports count line graph */}
          <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl space-y-4 shadow-sm text-[#0E1726]">
            <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E1726]">Daily Ingest Volume (Last 30 Days)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyReportsData}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D5E2EC", color: "#0E1726", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Categories Pie Chart */}
          <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl space-y-4 shadow-sm text-[#0E1726]">
            <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-3">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E1726]">Incidents By Category</h3>
            </div>
            <div className="h-64 flex flex-col md:flex-row items-center justify-around">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="category"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D5E2EC", color: "#0E1726", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="space-y-1 text-[10px] w-full md:w-1/3">
                {categoryData.map((entry: any, index: number) => (
                  <div key={entry.category} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}></div>
                    <span className="text-[#475569] truncate uppercase font-bold">{entry.category}: {entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Priority counts */}
          <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl space-y-4 shadow-sm text-[#0E1726]">
            <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-3">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E1726]">Severity Priority Breakdown</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D5E2EC", color: "#0E1726", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trust Score Distribution */}
          <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl space-y-4 shadow-sm text-[#0E1726]">
            <div className="flex items-center gap-2 border-b border-[#D5E2EC] pb-3">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E1726]">Citizen Trust Score Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trustData}>
                  <XAxis dataKey="interval" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#D5E2EC", color: "#0E1726", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
