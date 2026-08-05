import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  Radio,
  MapPin,
  Phone,
  Shield,
  LifeBuoy,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface SosViewProps {
  apiClient: any;
  isOffline: boolean;
  onSuccess: () => void;
}

const EMERGENCY_TYPES = [
  { value: "Boat Capsized", label: "Boat Capsized / Vessel swamping" },
  { value: "Person Overboard", label: "Person Overboard / Drowning Swimmer" },
  { value: "Medical Emergency", label: "Medical Emergency / Trauma injury" },
  { value: "Missing Fisherman", label: "Missing Fisherman / Engine Failure" },
  { value: "Other", label: "Other critical hazard threat" },
];

export default function SosView({ apiClient, isOffline, onSuccess }: SosViewProps) {
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0].value);
  const [latitude, setLatitude] = useState(25.078);
  const [longitude, setLongitude] = useState(-80.182);
  
  // Hold progress state
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<any>(null);

  // API Call state
  const [loading, setLoading] = useState(false);
  const [sosUuid, setSosUuid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isHolding) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / 3000) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(timerRef.current);
          setIsHolding(false);
          triggerSosBroadcast();
        }
      }, 30);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding]);

  const triggerSosBroadcast = async () => {
    if (isOffline) {
      setErrorMsg("Distress SOS beacons cannot be broadcasted while simulating offline boundaries.");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");
    setSosUuid(null);
    
    try {
      const res = await apiClient.post("/sos/", {
        latitude,
        longitude,
        emergency_type: selectedType,
      });
      setSosUuid(res.data.id);
      onSuccess();
    } catch (err: any) {
      setErrorMsg("SOS broadcast failed. Make sure your citizen session is linked.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartHold = () => {
    if (loading || sosUuid) return;
    setIsHolding(true);
  };

  const handleEndHold = () => {
    setIsHolding(false);
  };

  return (
    <div className="space-y-6 text-[#0F172A] animate-fade-in font-sans">
      
      {/* Title Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-black tracking-wide text-rose-500 uppercase">EMERGENCY DISTRESS BEACON</h2>
          <span className="text-[10px] text-[#64748B] font-bold uppercase">Satellite Coast Guard dispatch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side forms and contacts */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Emergency type selector */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm space-y-3">
            <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase">EMERGENCY CLASSIFICATION</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isHolding || loading || !!sosUuid}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] rounded-xl px-3 py-2 text-xs text-[#0F172A] font-bold focus:outline-none"
            >
              {EMERGENCY_TYPES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinates simulator */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm space-y-4">
            <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase">TELEMETRY COORDINATES</span>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-xl text-xs font-semibold">
                <MapPin size={16} className="text-[#0284C7]" />
                <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLatitude(parseFloat((25.05 + Math.random() * 0.05).toFixed(4)));
                  setLongitude(parseFloat((-80.20 + Math.random() * 0.05).toFixed(4)));
                }}
                disabled={isHolding || loading || !!sosUuid}
                className="w-full bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Simulate Location Check
              </button>
            </div>
          </div>

          {/* Coast guard responder details */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm space-y-3">
            <span className="text-[10px] text-[#64748B] font-bold tracking-widest block uppercase">NEAREST RESPONDER NODE</span>
            <div className="space-y-2 text-xs font-bold text-[#0f172a]">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#0284C7]" />
                <span>Coast Guard Station Sector B</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#14B8A6]" />
                <span>+1 (800) 555-0199 (VHF Ch 16)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: SOS Emergency Hold Button */}
        <div className="md:col-span-2 bg-white border border-[#E2E8F0] p-8 rounded-2xl shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
          {sosUuid ? (
            /* Success Response State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <Radio className="text-[#EF4444]" size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-rose-500 tracking-wider">BEACON TRANSMITTING</h3>
                <p className="text-[11px] text-[#64748B] max-w-sm leading-relaxed font-semibold">
                  Distress payload broadcasted to emergency centers. Rescue squad coordinates locked on Sector B. Keep session active.
                </p>
                <span className="text-[9px] bg-red-50 text-[#EF4444] border border-red-100 px-3 py-1 rounded font-black tracking-wider block w-fit mx-auto mt-2">
                  BEACON UUID: {sosUuid.slice(0, 8)}...
                </span>
              </div>

              <button
                onClick={() => setSosUuid(null)}
                className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold py-2 px-6 rounded-xl text-xs shadow-sm transition-all"
              >
                Reset Beacon
              </button>
            </motion.div>
          ) : (
            /* Action Button trigger */
            <div className="flex flex-col items-center justify-center space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-[#EF4444] text-xs rounded-xl flex items-center gap-2">
                  <AlertOctagon size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Glowing Outer Indicator Ring */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                
                {/* SVG Progress Gauge */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#EF4444"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={528}
                    strokeDashoffset={528 - (528 * progress) / 100}
                    className="transition-all duration-75"
                  />
                </svg>

                {/* Primary Button */}
                <button
                  onMouseDown={handleStartHold}
                  onMouseUp={handleEndHold}
                  onMouseLeave={handleEndHold}
                  onTouchStart={handleStartHold}
                  onTouchEnd={handleEndHold}
                  className={`w-36 h-36 rounded-full flex flex-col justify-center items-center select-none shadow-lg transform transition-all duration-150 active:scale-95 ${
                    isHolding
                      ? "bg-rose-600 scale-[1.03] text-white"
                      : "bg-[#EF4444] text-white hover:bg-rose-500 hover:scale-[1.01]"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={36} className="animate-spin text-white" />
                  ) : (
                    <>
                      <AlertOctagon size={36} className="animate-pulse" />
                      <span className="text-sm font-black tracking-widest mt-2">HOLD SOS</span>
                      <span className="text-[8px] font-bold text-rose-200 tracking-wider mt-1">3 SECONDS</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black text-[#0F172A] tracking-wide">
                  {isHolding ? "PROCEED HOLDING..." : "PRESS AND HOLD TO ACTIVATE"}
                </span>
                <p className="text-[10px] text-[#64748B] font-semibold leading-relaxed">
                  Accidental dispatch prevention active. Beacons require continuous hold.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
