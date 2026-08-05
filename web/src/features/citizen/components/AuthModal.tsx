import React, { useState } from "react";
import { X, ShieldAlert, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  authModeDefault?: "login" | "signup";
  apiClient: any;
}

export default function AuthModal({ isOpen, onClose, onSuccess, authModeDefault = "login", apiClient }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">(authModeDefault);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (authMode === "signup") {
        await apiClient.post("/auth/signup", {
          email,
          phone,
          password,
          full_name: fullName,
          role: "citizen",
        });
      }

      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const res = await apiClient.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("citizen_access_token", res.data.access_token);
      onSuccess(res.data.access_token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Credential check failed. Review inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-fade-in">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-xl space-y-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-[#0284C7]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="text-[#0284C7]" size={24} />
          </div>
          <h2 className="text-lg font-black text-[#0F172A] tracking-wide">
            {authMode === "login" ? "LINK CITIZEN PROFILE" : "CREATE CITIZEN ACCOUNT"}
          </h2>
          <p className="text-xs text-[#64748B] mt-1 px-4 leading-relaxed">
            Link your telemetry profile to access priority hazard reporting, active SOS distress beacons, and custom history records.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#EF4444] text-xs rounded-lg flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <>
              <div>
                <label className="text-[10px] font-bold text-[#64748B] tracking-wider block mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#64748B] tracking-wider block mb-1">PHONE NUMBER</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none transition-colors"
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-[#64748B] tracking-wider block mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none transition-colors"
              placeholder="citizen@oceanwatch.org"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748B] tracking-wider block mb-1">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] rounded-xl px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex justify-center items-center gap-2 shadow-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {authMode === "login" ? "LINK PROFILE" : "CREATE PROFILE"}
          </button>
        </form>

        {/* Footer switches */}
        <div className="flex justify-between items-center text-xs pt-4 border-t border-[#E2E8F0]">
          <button
            onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            className="text-[#0284C7] hover:underline font-semibold"
          >
            {authMode === "login" ? "Create profile account" : "Use existing session"}
          </button>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] font-medium"
          >
            Stay Guest
          </button>
        </div>
      </div>
    </div>
  );
}
