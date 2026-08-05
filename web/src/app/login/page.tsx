"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, Mail, Loader2 } from "lucide-react";
import axios from "axios";
import Balatro from "@/features/citizen/components/Balatro";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    try {
      // API expects form URL-encoded body for oauth login
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token, refresh_token } = res.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      router.push("/");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || "Authorization failed. Please check credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EBF2F7] flex items-center justify-center p-6 relative overflow-hidden text-[#0E1726]">
      {/* Background Mission Ocean Wave Shader */}
      <Balatro
        color1="#2563EB"
        color2="#0D9488"
        color3="#EBF2F7"
        spinSpeed={1.8}
        pixelFilter={1200}
        contrast={2.8}
        isRotate={true}
        mouseInteraction={true}
      />
      {/* Mission Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d5e2ec_1px,transparent_1px),linear-gradient(to_bottom,#d5e2ec_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

      <div className="w-full max-w-md bg-[#F4F8FA]/90 backdrop-blur-md border border-[#D5E2EC] p-8 shadow-2xl relative z-10 rounded-2xl space-y-6">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center gap-3">
          <img src="/logo.jpg" alt="OceanWatch Logo" className="w-16 h-16 rounded-full object-cover border-2 border-[#D5E2EC] shadow-md" />
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-[#0F172A]">
              SECURE AUTHORIZATION
            </h1>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-1">
              OceanWatch Command Center
            </p>
          </div>
        </div>

        {/* Action Error Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#EF4444] rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Dispatcher Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@oceanwatch.gov"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none rounded-xl text-xs font-bold text-[#0F172A] placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Secret Passkey
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] focus:outline-none rounded-xl text-xs font-bold text-[#0F172A] placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-blue-900/40 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting Secure Channel...
              </>
            ) : (
              "ESTABLISH LINK"
            )}
          </button>
        </form>

        <div className="text-center text-[9px] text-[#64748B] font-bold uppercase tracking-wider">
          NOTICE: AUTHORIZED GOVERNMENT USE ONLY
        </div>
      </div>
    </main>
  );
}
