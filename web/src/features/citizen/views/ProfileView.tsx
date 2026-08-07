import React, { useState } from "react";
import {
  User,
  Shield,
  Star,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface ProfileViewProps {
  userName: string;
  userEmail: string;
  userPhone: string;
  verifiedCount?: number;
  rejectedCount?: number;
  pendingCount?: number;
  onLogout: () => void;
}

export default function ProfileView({
  userName,
  userEmail,
  userPhone,
  verifiedCount = 12,
  rejectedCount = 1,
  pendingCount = 2,
  onLogout,
}: ProfileViewProps) {
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);

  const trustScore = 89;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-slate-950/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] mb-6">
        <div>
          <h2 className="text-base font-black tracking-wide uppercase text-white">CITIZEN PROFILE DETAILS</h2>
          <span className="text-[10px] text-sky-200 font-extrabold uppercase tracking-wider block mt-0.5">Reputation & telemetry metadata</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar, Name, Email, Trust Score */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-[24px] shadow-sm flex flex-col items-center text-center space-y-4">
            
            {/* Avatar */}
            <div className="w-20 h-20 bg-[#2563EB]/10 border-2 border-[#D5E2EC] rounded-full flex items-center justify-center relative overflow-hidden shadow-inner">
              <User size={36} className="text-[#2563EB]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight text-[#0E1726]">{userName || "Citizen Sentinel"}</h3>
              <p className="text-[10px] text-[#64748B] font-bold tracking-wide uppercase">{userEmail || "citizen@oceanwatch.org"}</p>
            </div>

            {/* Trust rating gauge */}
            <div className="w-full pt-4 border-t border-[#D5E2EC] space-y-2">
              <span className="text-[9px] text-[#64748B] font-black uppercase tracking-wider block">CITIZEN TRUST INDEX</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-black text-[#2563EB]">{trustScore}</span>
                <span className="text-xs text-[#64748B] font-bold">/ 100</span>
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-[#FF7A59] text-[#FF7A59]" />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[#EF4444] font-black py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>TERMINATE LINK SESSION</span>
          </button>
        </div>

        {/* Right Side: Stats & Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Submissions Stats Grid */}
          <div className="space-y-3">
            <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase font-black">SUBMISSION METRICS</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-5 rounded-[24px] shadow-sm text-center space-y-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#22C55E]">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">VERIFIED LOGS</span>
                  <span className="text-xl font-black text-[#0E1726]">{verifiedCount}</span>
                </div>
              </div>

              <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-5 rounded-[24px] shadow-sm text-center space-y-2">
                <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-[#EAB308]">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">PENDING CHECKS</span>
                  <span className="text-xl font-black text-[#0E1726]">{pendingCount}</span>
                </div>
              </div>

              <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-5 rounded-[24px] shadow-sm text-center space-y-2">
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
                  <XCircle size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase">REJECTED PLOTS</span>
                  <span className="text-xl font-black text-[#0E1726]">{rejectedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Config options */}
          <div className="bg-[#F4F8FA] border border-[#D5E2EC] p-6 rounded-[24px] shadow-sm space-y-4">
            <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase font-black">SETTINGS & SECURITY</span>
            
            <div className="divide-y divide-[#D5E2EC]">
              <button
                onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                className="w-full py-4 text-left flex justify-between items-center text-xs font-bold text-[#0E1726] hover:bg-[#EBF2F7]/50 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-[#2563EB]" />
                  <span>Telemetry Privacy Policy</span>
                </div>
                <ChevronRight size={16} className="text-[#64748B]" />
              </button>

              {showPrivacySettings && (
                <div className="p-4 bg-[#EBF2F7] text-[10px] text-[#64748B] leading-relaxed rounded-xl mb-4 space-y-2">
                  <p>• Telemetry logs transmit coordinates only to rescue dispatch hubs.</p>
                  <p>• Presets and comments do not log persistent user IP records.</p>
                  <p>• Dispatches expire from active memory vaults after 30 days.</p>
                </div>
              )}

              <button
                onClick={() => setShowHelpSupport(!showHelpSupport)}
                className="w-full py-4 text-left flex justify-between items-center text-xs font-bold text-[#0E1726] hover:bg-[#EBF2F7]/50 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-[#0D9488]" />
                  <span>Help & Support Center</span>
                </div>
                <ChevronRight size={16} className="text-[#64748B]" />
              </button>

              {showHelpSupport && (
                <div className="p-4 bg-[#EBF2F7] text-[10px] text-[#64748B] leading-relaxed rounded-xl mt-2 space-y-2">
                  <p><strong>Ingest checks taking long?</strong></p>
                  <span className="block">Satellite checks verify coordinate bounds against surrounding radar maps. This usually resolves in 10-15 seconds.</span>
                  <p className="pt-2"><strong>Offline queue retransmission details?</strong></p>
                  <span className="block">Once your browser recovers cellular signal, toggle the Offline Switch back to Online on the Home screen to sync.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
