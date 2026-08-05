"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

// Dynamically import map client wrapper with SSR disabled to prevent Leaflet window reference errors.
const CommandMap = dynamic(() => import("@/features/map/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-8rem)] bg-[#0E1422] border border-[#1F2E4D] rounded-sm flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-xs font-mono uppercase text-slate-500">
        Bootstrapping GIS Radar Link...
      </span>
    </div>
  ),
});

export default function MapPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider font-mono">
            LIVE GIS OCEAN RADAR
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time geospatial hazard triangulation grid
          </p>
        </div>
        <CommandMap />
      </div>
    </DashboardLayout>
  );
}
