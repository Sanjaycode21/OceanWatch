"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Radio } from "lucide-react";
import { api } from "@/core/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/authority-login");
      }
    };
    fetchMe();
  }, [router]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/authority-login");
    }
  };

  return (
    <header className="h-16 bg-[#F4F8FA] border-b border-[#D5E2EC] flex items-center justify-between px-8 shrink-0">
      {/* System Link status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#22C55E]">
            Radar Link Active
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[#64748B] text-xs font-semibold">
          <span>LATENCY: 12ms</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>SYS HEALTH: 100%</span>
        </div>
      </div>

      {/* Operator Profile and Logout Actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EBF2F7] border border-[#D5E2EC] rounded-xl font-bold">
            <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-xs text-[#0E1726]">
              {user.email} ({user.role.toUpperCase()})
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-1.5 border border-red-200 hover:bg-red-50 text-[#EF4444] rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>
    </header>
  );
}
