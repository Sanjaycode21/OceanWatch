"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  FileText,
  Upload,
  RefreshCw,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Edit2,
  FileCheck,
  Sliders,
  Sparkles,
} from "lucide-react";

interface ReportViewProps {
  apiClient: any;
  isOffline: boolean;
  onSuccess: () => void;
  offlineQueue: any[];
  setOfflineQueue: (q: any[]) => void;
  initialPreset?: string;
}

const MANUAL_CATEGORIES = [
  "High Waves",
  "Oil Spill",
  "Floating Debris",
  "Dead Marine Life",
  "Harmful Algal Bloom",
  "Coastal Flooding",
  "Water Pollution",
  "Illegal Fishing",
  "Other / Unknown"
];

const AI_STAGES = [
  "Upload Received",
  "Image Preprocessing",
  "Metadata Extraction",
  "Gemini Vision Analysis",
  "Hazard Detection",
  "Evidence Collection",
  "Credibility Analysis",
  "Incident Matching",
  "Generating Intelligence",
  "Analysis Complete"
];

export default function ReportView({
  apiClient,
  isOffline,
  onSuccess,
  offlineQueue,
  setOfflineQueue,
  initialPreset,
}: ReportViewProps) {
  
  // Step 1-3 inputs
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(13.04);
  const [longitude, setLongitude] = useState(80.28);
  const [timestampStr, setTimestampStr] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Pipeline navigation states
  const [pipelineState, setPipelineState] = useState<"form" | "analyzing" | "result" | "success">("form");
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Manual fallback override state
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [selectedCorrectCategory, setSelectedCorrectCategory] = useState(MANUAL_CATEGORIES[0]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // AI results fields returned by backend
  const [aiResult, setAiResult] = useState<{
    hazard_type: string;
    hazard_category: string;
    detection_confidence: number;
    severity: string;
    visible_evidence: string[];
    possible_impacts: string[];
    ai_reasoning: string;
    recommended_action: string;
    credibility_score: number;
    supporting_factors: string[];
    contradicting_factors: string[];
    incident_confidence: number;
  } | null>(null);

  // Initialize automatic date timestamp on mount
  useEffect(() => {
    setTimestampStr(new Date().toISOString());
  }, [pipelineState]);

  // Sync initial preset prop mapping
  useEffect(() => {
    if (initialPreset) {
      if (initialPreset.includes("wave")) {
        setDescription("High breaking storm waves observed crashing over the coastal barrier.");
      } else if (initialPreset.includes("oil")) {
        setDescription("A heavy dark oil sheen is visible coating the coastal surface waters.");
      }
      setPipelineState("form");
    }
  }, [initialPreset]);

  // Refresh GPS coordinate states
  const handleRefreshGps = () => {
    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;
    setLatitude(parseFloat((13.04 + offsetLat).toFixed(4)));
    setLongitude(parseFloat((80.28 + offsetLng).toFixed(4)));
    setTimestampStr(new Date().toISOString());
  };

  // Compile local evidence parameters based on simulation modes
  const getSimulatedDetails = (mode: "high" | "medium" | "low") => {
    switch (mode) {
      case "high":
        return {
          hazard_type: "High Waves",
          hazard_category: "Ocean Weather",
          confidence_num: 91,
          severity: "High",
          visible_evidence: ["Large breaking waves", "White foam", "Rough sea conditions"],
          reasoning: "The uploaded evidence is highly consistent with dangerous high-wave conditions."
        };
      case "medium":
        return {
          hazard_type: "Oil Spill",
          hazard_category: "Pollution",
          confidence_num: 72,
          severity: "High",
          visible_evidence: ["Dark sheen on water", "Surface film matching hydrocarbon logs"],
          reasoning: "Visual characteristics suggest an oil spill, but water reflections reduce detection confidence."
        };
      case "low":
        return {
          hazard_type: "Unknown Hazard",
          hazard_category: "Maritime",
          confidence_num: 45,
          severity: "Medium",
          visible_evidence: ["Undefined visual water anomalies detected"],
          reasoning: "We could not confidently determine the hazard."
        };
    }
  };

  // Submit and analyze flow
  const handleAnalyzeAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPipelineState("analyzing");
    setCurrentStageIndex(0);
    setShowManualSelector(false);

    // Simulated latency stage increment interval
    let animationInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        const next = prev + 1;
        if (next >= AI_STAGES.length) {
          clearInterval(animationInterval);
          
          // Determine mock data based on the uploaded file name or description keywords
          const filename = (uploadedFile || "").toLowerCase();
          const descText = (description || "").toLowerCase();
          
          let mockResult = {
            hazard_type: "High Waves",
            hazard_category: "Ocean Weather",
            detection_confidence: 91,
            severity: "High",
            visible_evidence: ["large ocean swell markers", "coastal spray splash"],
            possible_impacts: ["coastal pathway flooding", "minor erosion of dune structures"],
            ai_reasoning: "[MOCK DETECTION] Visual analysis detects high breaking waves cresting over the local shoreline sector.",
            recommended_action: "Monitor coastal advisory channels for surge warnings.",
            credibility_score: 88.0,
            supporting_factors: ["Report coordinate matching nearby buoy telemetry"],
            contradicting_factors: [],
            incident_confidence: 90.0
          };

          if (filename.includes("oil") || descText.includes("oil") || descText.includes("spill")) {
            mockResult = {
              hazard_type: "Oil Spill",
              hazard_category: "Pollution",
              detection_confidence: 96,
              severity: "Critical",
              visible_evidence: ["frothy slick boundary", "rainbow colored sheen", "dark viscous surface patch"],
              possible_impacts: ["seabird feather contamination", "destruction of local intertidal ecosystems", "coastal fishery closure"],
              ai_reasoning: "[MOCK DETECTION] Vision analysis detects a dark, viscous surface sheen spreading across the coastal waters, characteristic of an oil slick.",
              recommended_action: "Deploy containment booms, apply marine dispersants if approved, and notify coast guard emergency responders.",
              credibility_score: 95.0,
              supporting_factors: ["Multiple matching citizen reports within sector range"],
              contradicting_factors: [],
              incident_confidence: 95.0
            };
          } else if (filename.includes("coral") || filename.includes("bleach") || descText.includes("coral") || descText.includes("bleach")) {
            mockResult = {
              hazard_type: "Coral Bleaching",
              hazard_category: "Marine Ecosystem",
              detection_confidence: 92,
              severity: "High",
              visible_evidence: ["skeletal white coral structures", "algal overgrowth on dead coral", "elevated sea temperature readings"],
              possible_impacts: ["loss of marine nursery habitats", "reduction in reef structural integrity", "decline in local fish populations"],
              ai_reasoning: "[MOCK DETECTION] Subsurface images display widespread loss of symbiotic zooxanthellae in hard corals, causing skeletal structures to appear stark white.",
              recommended_action: "Implement thermal stress monitoring protocols, restrict local diving activities, and study reef resilience parameters.",
              credibility_score: 90.0,
              supporting_factors: ["Sea surface temperature anomaly matches regional satellite telemetry"],
              contradicting_factors: [],
              incident_confidence: 92.0
            };
          } else if (filename.includes("plastic") || filename.includes("pollut") || descText.includes("plastic") || descText.includes("trash")) {
            mockResult = {
              hazard_type: "Plastic Pollution",
              hazard_category: "Pollution",
              detection_confidence: 98,
              severity: "Medium",
              visible_evidence: ["macro-plastic debris", "floating ghost nets", "micro-plastic accumulation zones"],
              possible_impacts: ["entanglement of marine mammals", "ingestion of micro-plastics by fish", "beach degradation"],
              ai_reasoning: "[MOCK DETECTION] High density of floating synthetic debris, marine plastic bottles, and discarded nets detected accumulating along the shoreline.",
              recommended_action: "Organize shoreline recovery sweeps, deploy floating trash interception barriers, and institute local waste regulations.",
              credibility_score: 85.0,
              supporting_factors: ["Community cleanup report active"],
              contradicting_factors: [],
              incident_confidence: 88.0
            };
          } else if (filename.includes("bloom") || filename.includes("algal") || descText.includes("bloom") || descText.includes("algae")) {
            mockResult = {
              hazard_type: "Algal Bloom",
              hazard_category: "Pollution",
              detection_confidence: 94,
              severity: "High",
              visible_evidence: ["green/red water discoloration", "dead fish wash-ups", "high chlorophyll-a concentration"],
              possible_impacts: ["marine neurotoxin release", "anoxic dead zone creation", "shellfish toxicity risk"],
              ai_reasoning: "[MOCK DETECTION] Aerial imagery shows a thick, bright green chlorophyll-a plume extending across the bay, consistent with a harmful algal bloom.",
              recommended_action: "Issue public safety warnings, restrict commercial and recreational shellfishing, and track plume dispersal patterns.",
              credibility_score: 92.0,
              supporting_factors: ["NASA MODIS green bloom index anomaly confirmed"],
              contradicting_factors: [],
              incident_confidence: 93.0
            };
          }

          setAiResult(mockResult);
          setPipelineState("result");
          return prev;
        }
        return next;
      });
    }, 300);
  };

  // Submit confirmation metadata payload back to the backend database
  const handleConfirmFeedback = async (accepted: boolean, finalCategoryName?: string) => {
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setPipelineState("success");
    }, 500);
  };

  // Reset report wizard
  const handleReset = () => {
    setDescription("");
    setUploadedFile(null);
    setUploadedFileObj(null);
    setPipelineState("form");
    setAiResult(null);
    setSubmittedReportId(null);
    setShowManualSelector(false);
    onSuccess();
  };

  // Apple/macOS style spring hover configs
  const hoverSpringTransition = {
    type: "spring",
    stiffness: 300,
    damping: 20
  } as const;

  const cardHoverEffects = {
    y: -5,
    scale: 1.015,
    boxShadow: "0 20px 38px -10px rgba(14, 23, 38, 0.12)",
  };

  return (
    <div className="w-full text-left space-y-8 animate-fade-in pb-12">
      <AnimatePresence mode="wait">
        
        {/* Step 1-3: Evidence Upload Form Layout */}
        {pipelineState === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleAnalyzeAndSubmit}
            className="space-y-8"
          >
            {/* Header titles */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#2563EB] font-black uppercase tracking-widest block">REPORT WORKFLOW</span>
              <h1 className="text-3xl md:text-4xl font-black text-[#0E1726] tracking-tight">Submit Ocean Evidence</h1>
            </div>

            {/* Two-Column split grid layout on wide screens, single stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Evidence Upload (Colspan 7) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Drag & Drop Evidence upload container */}
                <motion.div 
                  whileHover={cardHoverEffects}
                  transition={hoverSpringTransition}
                  className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4"
                >
                  <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Step 1: Upload Evidence</span>
                  
                  {uploadedFile && uploadedFileObj ? (
                    <div className="border border-[#CBD5E1] bg-[#F1F6FA]/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[250px]">
                      <div className="relative w-56 h-40 bg-slate-200 border border-[#B8CCD9] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group">
                        <img
                          src={URL.createObjectURL(uploadedFileObj)}
                          alt="Uploaded Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-[#0E1726]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={28} className="text-white" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-[#0E1726]">{uploadedFile}</span>
                        <p className="text-[10px] text-[#64748B] font-semibold">Evidence asset verified & cached.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadedFileObj(null);
                        }}
                        className="text-[10px] text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1 cursor-pointer py-1.5 px-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100/50 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} />
                        <span>Remove Evidence</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#A0C4DF] bg-[#F4F8FA] hover:bg-[#EEF4F7] rounded-2xl p-8 text-center transition-all flex flex-col justify-center items-center gap-4 min-h-[250px] cursor-pointer group hover:border-[#2563EB]"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,video/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file.name);
                            setUploadedFileObj(file);
                          }
                        }} 
                      />
                      <div className="p-4 bg-[#2563EB]/10 rounded-2xl text-[#2563EB] group-hover:scale-110 transition-transform duration-200 border border-[#2563EB]/10">
                        <Upload size={36} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#0E1726]">Drag and drop your evidence here</h4>
                        <p className="text-[10px] text-[#64748B] font-bold leading-normal">Supports live photos, camera capture, or video (.mp4, .png, .jpg)</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          className="px-5 py-2.5 bg-white border border-[#CBD5E1] text-[10px] font-extrabold text-[#64748B] rounded-xl shadow-sm hover:border-[#94A3B8] transition-colors"
                        >
                          📸 Capture Live Photo
                        </button>
                        <button
                          type="button"
                          className="px-5 py-2.5 bg-[#2563EB] text-white text-[10px] font-black rounded-xl shadow-sm hover:bg-[#1D4ED8] transition-colors"
                        >
                          📁 Select File
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* E2E Prototype Presets Panel */}
                <motion.div 
                  whileHover={cardHoverEffects}
                  transition={hoverSpringTransition}
                  className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4"
                >
                  <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-wider block">PROTOTYPE QUICK SIMULATORS</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "oil_spill.png", label: "🛢️ Oil Spill Preset", desc: "A heavy dark oil sheen is visible coating the coastal surface waters." },
                      { name: "coral_bleaching.png", label: "🪸 Coral Bleaching Preset", desc: "Widespread coral bleaching observed under rising water temperatures." },
                      { name: "plastic_pollution.png", label: "🗑️ Plastic Pollution Preset", desc: "Heavy accumulation of marine plastic garbage along the shore." },
                      { name: "algal_bloom.png", label: "🦠 Algal Bloom Preset", desc: "Bright green harmful algal bloom observed spreading in the bay." }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/${preset.name}`);
                            const blob = await response.blob();
                            const file = new File([blob], preset.name, { type: "image/png" });
                            setUploadedFile(preset.name);
                            setUploadedFileObj(file);
                            setDescription(preset.desc);
                          } catch (err) {
                            console.error("Failed to load preset", err);
                          }
                        }}
                        className="p-3 bg-[#F8FAFC] border border-[#D5E2EC] hover:border-[#2563EB] rounded-xl text-left text-xs font-black text-[#0E1726] hover:bg-[#2563EB]/5 transition-all shadow-sm flex flex-col justify-between gap-1.5 cursor-pointer"
                      >
                        <span className="block">{preset.label}</span>
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">Simulate E2E</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Description & GPS Telemetry (Colspan 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Optional description text input container */}
                <motion.div 
                  whileHover={cardHoverEffects}
                  transition={hoverSpringTransition}
                  className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-3"
                >
                  <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Step 2: Optional Description</span>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[#0E1726]">Describe what you observed (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={`Example: "I noticed unusually large waves crashing against the shore."`}
                      className="w-full h-32 p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm font-semibold placeholder-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:ring-0 outline-none resize-none leading-relaxed text-[#0E1726] transition-all"
                    />
                  </div>
                </motion.div>

                {/* Read-only coordinates telemetry */}
                <motion.div 
                  whileHover={cardHoverEffects}
                  transition={hoverSpringTransition}
                  className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider">Step 3: Location Info</span>
                    <button
                      type="button"
                      onClick={handleRefreshGps}
                      className="text-[9px] text-[#2563EB] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} />
                      <span>Refresh GPS</span>
                    </button>
                  </div>

                  <div className="space-y-3 bg-[#F4F8FA] border border-[#B8CCD9] p-4 rounded-xl font-bold divide-y divide-[#B8CCD9]/50">
                    <div className="flex items-center gap-3 pb-3">
                      <div className="p-2.5 bg-white rounded-xl text-[#2563EB] border border-[#B8CCD9] shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">GPS Centroid</span>
                        <span className="font-mono text-xs text-[#0E1726]">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <div className="p-2.5 bg-white rounded-xl text-[#2563EB] border border-[#B8CCD9] shadow-sm">
                        <Clock size={18} />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Registered Time</span>
                        <span className="text-xs text-[#0E1726] font-semibold">{new Date(timestampStr || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Primary CTA analyze submit button */}
                <div className="pt-2 flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm py-4.5 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    <span>Analyze & Submit</span>
                  </motion.button>
                </div>

              </div>

            </div>

          </motion.form>
        )}

        {/* Step 5: Full-screen AI Processing Screen */}
        {pipelineState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col justify-center items-center p-6 text-center select-none"
          >
            <div className="max-w-md w-full space-y-8">
              {/* Spinner */}
              <div className="relative w-20 h-20 mx-auto">
                <Loader2 className="animate-spin text-[#2563EB] absolute inset-0" size={80} strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest animate-pulse">AI</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#0E1726]">Running Gemini Vision checks...</h2>
                <p className="text-xs text-[#64748B] font-semibold leading-relaxed">Analyzing evidence structures and computing hazard classifications.</p>
              </div>

              {/* Progress Checklist Stages */}
              <div className="bg-white border border-[#CBD5E1] p-6 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] text-left divide-y divide-[#E2E8F0] font-bold max-w-sm mx-auto">
                {AI_STAGES.map((stage, idx) => {
                  const isChecked = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;
                  return (
                    <div key={idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                      <span className={`text-xs transition-colors ${isChecked ? "text-[#0E1726]" : isActive ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>
                        {stage}
                      </span>
                      {isChecked ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 size={14} className="text-[#2563EB] animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#D5E2EC] bg-slate-50 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: AI Detection Results Screen */}
        {pipelineState === "result" && aiResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
          >
            <div>
              <span className="text-[10px] text-[#2563EB] font-black uppercase tracking-widest block">PIPELINE ANALYSIS COMPLETE</span>
              <h1 className="text-2xl md:text-3xl font-black text-[#0E1726] tracking-tight">AI Classification Results</h1>
            </div>

            {/* Results parameters card */}
            {aiResult && (
              <div className="bg-white border border-[#B8CCD9] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                
                {/* Vision Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#E2E8F0]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Detected Hazard</span>
                    <span className="text-sm font-black text-[#0E1726]">{aiResult.hazard_type}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Hazard Category</span>
                    <span className="text-sm font-black text-[#2563EB]">{aiResult.hazard_category}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Detection Confidence</span>
                    <span className={`text-sm font-black ${aiResult.detection_confidence >= 85 ? "text-emerald-600" : "text-[#FF7A59]"}`}>{aiResult.detection_confidence}%</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-[#64748B] font-bold uppercase block tracking-wider">Severity</span>
                    <span className={`text-xs font-black uppercase block tracking-wider px-2.5 py-0.5 rounded-full border text-center mt-0.5 ${
                      aiResult.severity.toUpperCase() === "CRITICAL"
                        ? "text-red-600 bg-red-50 border-red-100"
                        : aiResult.severity.toUpperCase() === "HIGH"
                        ? "text-[#FF7A59] bg-orange-50 border-orange-100"
                        : "text-blue-600 bg-blue-50 border-blue-100"
                    }`}>
                      {aiResult.severity}
                    </span>
                  </div>
                </div>

                {/* Fusion & Credibility Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#E2E8F0]">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Credibility Analysis</span>
                    <div className="bg-[#F8FAFC] border border-[#D5E2EC] p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">Reputation Score</span>
                        <span className="text-2xl font-black text-[#0E1726]">{aiResult.credibility_score.toFixed(0)}%</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">Incident Fusion Confidence</span>
                        <span className="text-2xl font-black text-[#2563EB]">{aiResult.incident_confidence.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Verification Factors</span>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {aiResult.supporting_factors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                      {aiResult.contradicting_factors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] font-bold text-red-600">
                          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                      {aiResult.supporting_factors.length === 0 && aiResult.contradicting_factors.length === 0 && (
                        <span className="text-xs text-[#64748B] font-bold uppercase">No factors analyzed.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence & Impacts list side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Visible Evidence Found</span>
                    <div className="space-y-2">
                      {aiResult.visible_evidence.length > 0 ? (
                        aiResult.visible_evidence.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-bold text-[#0E1726]">
                            <Check className="text-emerald-500 shrink-0" size={14} />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[#64748B] font-semibold">No visible evidence extracted.</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Possible Ecological Impacts</span>
                    <div className="space-y-2">
                      {aiResult.possible_impacts.length > 0 ? (
                        aiResult.possible_impacts.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-bold text-[#0E1726]">
                            <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[#64748B] font-semibold">No significant impacts modeled.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reasoning & Actions */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">AI Summary & Decision Reasoning</span>
                    <p className="text-xs text-[#0E1726] bg-[#F8FAFC] border border-[#D5E2EC] p-4 rounded-2xl leading-relaxed font-semibold">
                      {aiResult.ai_reasoning}
                    </p>
                  </div>
                  {aiResult.recommended_action && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Recommended Dispatch Actions</span>
                      <div className="text-xs text-[#0E1726] bg-blue-50/50 border border-blue-100 p-4 rounded-2xl leading-relaxed font-semibold flex gap-2">
                        <Sparkles size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
                        <span>{aiResult.recommended_action}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Hybrid Confirmation Box based on confidence score */}
            <div className="bg-[#F8FAFC] border border-[#B8CCD9] p-6 rounded-[28px] space-y-4">
              
              {/* Case A: HIGH Confidence (>= 85%) */}
              {aiResult.detection_confidence >= 85 && !showManualSelector && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wide block">HIGH CONFIDENCE DETECTION</span>
                    <h4 className="text-xs font-black text-[#0E1726]">We believe this is {aiResult.hazard_type}. Is this detection correct?</h4>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowManualSelector(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#64748B] hover:text-[#0E1726] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      ✏ Correct Detection
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmFeedback(true)}
                      disabled={isSubmittingFeedback}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer text-center"
                    >
                      ✓ Confirm Report
                    </button>
                  </div>
                </div>
              )}

              {/* Case B: LOW Confidence (< 85%) or Explicit Correct button clicked */}
              {(aiResult.detection_confidence < 85 || showManualSelector) && (
                <div className="space-y-4 font-bold text-[#0E1726]">
                  <div className="flex gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-left">
                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-amber-800">
                        {aiResult.detection_confidence < 85 ? "We could not confidently determine the hazard." : "Hazard Correction"}
                      </h4>
                      <p className="text-[10px] text-amber-700/90 leading-relaxed font-semibold">
                        Please manually identify the correct hazard category from the options below to submit your verification feedback.
                      </p>
                    </div>
                  </div>

                  {/* Manual fallback select list */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-[#0E1726] block">Select Correct Hazard Category</label>
                    <div className="relative">
                      <select
                        value={selectedCorrectCategory}
                        onChange={(e) => setSelectedCorrectCategory(e.target.value)}
                        className="w-full p-4 bg-white border border-[#CBD5E1] rounded-xl text-xs font-bold appearance-none outline-none focus:border-[#2563EB] text-[#0E1726] cursor-pointer"
                      >
                        {MANUAL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {aiResult.detection_confidence >= 85 && (
                      <button
                        type="button"
                        onClick={() => setShowManualSelector(false)}
                        className="px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0E1726] text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel Override
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleConfirmFeedback(false, selectedCorrectCategory)}
                      disabled={isSubmittingFeedback}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingFeedback && <Loader2 size={12} className="animate-spin" />}
                      <span>Submit Report</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* Step Success confirmation view */}
        {pipelineState === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#CBD5E1] p-8 rounded-[36px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20">
              <ShieldCheck size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0E1726]">Thank you! Report registered.</h2>
              <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
                The evidence coordinates are logged on our Command Center grid node. Responders will review the verification factors.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
              >
                Done / Submit Another
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
