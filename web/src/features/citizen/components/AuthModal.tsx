import React, { useState } from "react";
import { X, ShieldAlert, Loader2, Key, Mail, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  authModeDefault?: "login" | "signup";
  apiClient: any;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  authModeDefault = "login",
  apiClient,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">(authModeDefault);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpSentCode, setOtpSentCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  if (!isOpen) return null;

  // Simulate OTP transmission
  const handleSendOtp = () => {
    if (!email) {
      setErrorMsg("Please enter a valid email address first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      const generatedCode = "749204"; // Static code for testing/demo
      setOtpSentCode(generatedCode);
      setInfoMsg(`OTP code transmitted to ${email}! Enter "${generatedCode}" to link.`);
    }, 1200);
  };

  // Google OAuth flow simulation
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setErrorMsg("");
    setInfoMsg("Connecting with Google Accounts...");

    setTimeout(() => {
      setGoogleLoading(false);
      setInfoMsg("");
      const mockToken = "google-mock-access-token-930218";
      localStorage.setItem("citizen_access_token", mockToken);
      onSuccess(mockToken);
      onClose();
    }, 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      if (authMode === "login" && loginMethod === "otp") {
        // OTP verification step
        if (otpCode !== otpSentCode) {
          throw new Error("Invalid OTP code. Please enter the generated code: " + otpSentCode);
        }
        
        // Success OTP Login simulation
        const mockToken = "otp-mock-access-token-483921";
        localStorage.setItem("citizen_access_token", mockToken);
        onSuccess(mockToken);
        onClose();
        return;
      }

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

      let token = "";
      try {
        const res = await apiClient.post("/auth/login", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        token = res.data.access_token;
      } catch (apiErr) {
        console.warn("Backend auth failed, checking citizen demo bypass...", apiErr);
        if (email.toLowerCase() === "deepan@oceanwatch.in" && password === "Citizen123!") {
          token = "mock-citizen-token-jwt-deepan";
        } else {
          throw apiErr;
        }
      }

      localStorage.setItem("citizen_access_token", token);
      onSuccess(token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || err.response?.data?.detail || "Credential check failed. Review inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E1726]/40 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-fade-in font-sans">
      <div className="bg-[#F4F8FA] border border-[#D5E2EC] rounded-[24px] p-6 md:p-8 max-w-md w-full relative shadow-xl space-y-5 animate-scale-up text-[#0E1726]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748B] hover:text-[#0E1726] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Branding Logo */}
        <div className="text-center">
          <div className="w-14 h-14 bg-white border border-[#D5E2EC] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm overflow-hidden">
            <img src="/logo.jpg" alt="OceanWatch Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-base font-black text-[#0E1726] tracking-wide">
            {authMode === "login" ? "LINK CITIZEN PROFILE" : "CREATE CITIZEN ACCOUNT"}
          </h2>
          <p className="text-[10px] text-[#64748B] font-bold mt-1 px-4 leading-relaxed uppercase">
            {authMode === "login" ? "Verify session credentials to activate link" : "Fill details to link new sentinel code"}
          </p>
        </div>

        {/* Notifications and Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-[#EF4444] text-[11px] font-semibold rounded-xl flex items-start gap-2">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 bg-blue-50 border border-blue-100 text-[#2563EB] text-[11px] font-semibold rounded-xl flex items-start gap-2">
            <Loader2 size={14} className="shrink-0 mt-0.5 animate-spin" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Main Authentication Flow Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === "login" && (
            /* Toggle between Password and OTP Login modes */
            <div className="flex bg-[#EBF2F7] p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => { setLoginMethod("password"); setErrorMsg(""); setInfoMsg(""); }}
                className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "password" ? "bg-white text-[#2563EB] shadow-sm" : "text-[#64748B]"
                }`}
              >
                Password Link
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod("otp"); setErrorMsg(""); setInfoMsg(""); }}
                className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  loginMethod === "otp" ? "bg-white text-[#2563EB] shadow-sm" : "text-[#64748B]"
                }`}
              >
                OTP Verification
              </button>
            </div>
          )}

          {authMode === "signup" && (
            <>
              <div>
                <label className="text-[9px] font-black text-[#64748B] tracking-wider block mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#EBF2F7] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#0E1726] font-bold focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-[#64748B] tracking-wider block mb-1">PHONE NUMBER</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#EBF2F7] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#0E1726] font-bold focus:outline-none transition-colors"
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[9px] font-black text-[#64748B] tracking-wider block mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#EBF2F7] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#0E1726] font-bold focus:outline-none transition-colors"
              placeholder="citizen@oceanwatch.org"
            />
          </div>

          {authMode === "login" && loginMethod === "otp" ? (
            /* OTP Verification fields block */
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-black text-[#64748B] tracking-wider block">ENTER OTP CODE</label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[9px] text-[#2563EB] hover:underline font-extrabold uppercase cursor-pointer"
                  >
                    {otpSent ? "Resend OTP" : "Send OTP Link"}
                  </button>
                </div>
                <input
                  type="text"
                  required={otpSent}
                  disabled={!otpSent}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-[#EBF2F7] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#0E1726] font-mono font-bold focus:outline-none transition-colors disabled:opacity-50"
                  placeholder={otpSent ? "Enter 6-digit code" : "Click Send OTP first"}
                  maxLength={6}
                />
              </div>
            </div>
          ) : (
            /* Password authentication block */
            <div>
              <label className="text-[9px] font-black text-[#64748B] tracking-wider block mb-1">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#EBF2F7] border border-[#D5E2EC] focus:border-[#2563EB] rounded-xl px-3.5 py-2 text-xs text-[#0E1726] font-bold focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold py-2.5 rounded-xl text-[10px] tracking-widest uppercase transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {authMode === "login"
              ? loginMethod === "otp"
                ? "Verify & Sign In"
                : "LINK PROFILE"
              : "CREATE PROFILE"}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#D5E2EC]"></div>
          <span className="flex-shrink mx-4 text-[8px] font-black uppercase text-[#64748B]">Or access via</span>
          <div className="flex-grow border-t border-[#D5E2EC]"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full bg-white hover:bg-slate-50 border border-[#D5E2EC] text-[#0E1726] font-extrabold py-2.5 rounded-xl text-[10px] tracking-wider uppercase flex justify-center items-center gap-2.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 size={14} className="animate-spin text-[#2563EB]" />
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Sign In with Gmail / Google</span>
        </button>

        {/* Footer switches */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#D5E2EC]">
          <div className="flex justify-between items-center text-[10px]">
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className="text-[#2563EB] hover:underline font-extrabold uppercase cursor-pointer"
            >
              {authMode === "login" ? "Create profile account" : "Use existing session"}
            </button>
            <button
              onClick={onClose}
              className="text-[#64748B] hover:text-[#0E1726] font-bold uppercase cursor-pointer"
            >
              Stay Guest
            </button>
          </div>
          {authMode === "login" && (
            <div className="text-[9px] text-[#2563EB] font-bold text-center">
              DEMO CITIZEN: <span className="underline">deepan@oceanwatch.in</span> | PASSWORD: <span className="underline font-sans font-bold">Citizen123!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
