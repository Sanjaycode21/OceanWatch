"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Map,
  Camera,
  AlertTriangle,
  FileText,
  AlertOctagon,
  User,
  Compass,
  Bell,
  ChevronDown,
  Waves,
  Shield,
  Activity,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Clock,
} from "lucide-react";

// Import custom views and components
import LandingView from "@/features/citizen/views/LandingView";
import HomeView from "@/features/citizen/views/HomeView";
import ReportView from "@/features/citizen/views/ReportView";
import AlertsView from "@/features/citizen/views/AlertsView";
import ReportsView from "@/features/citizen/views/ReportsView";
import SosView from "@/features/citizen/views/SosView";
import ProfileView from "@/features/citizen/views/ProfileView";
import MapView from "@/features/citizen/views/MapView";
import AuthModal from "@/features/citizen/components/AuthModal";
import Dock from "@/features/citizen/components/Dock";
import ElasticMesh from "@/features/citizen/components/ElasticMesh";

// Configure isolated citizen API client
const citizenApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

citizenApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("citizen_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

type TabType = "landing" | "home" | "map" | "report" | "alerts" | "reports" | "sos" | "profile";

export default function CitizenDashboardPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("landing");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [selectedReportPreset, setSelectedReportPreset] = useState<string | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("citizen_access_token");
      setToken(stored);

      const savedQueue = localStorage.getItem("oceanwatch_offline_queue");
      if (savedQueue) {
        setOfflineQueue(JSON.parse(savedQueue));
      }

      const savedTab = localStorage.getItem("oceanwatch_citizen_tab") as TabType | null;
      if (savedTab) {
        const requiresAuth = ["report", "reports", "sos", "profile"].includes(savedTab);
        if (requiresAuth && !stored) {
          setActiveTab("landing");
        } else {
          setActiveTab(savedTab);
        }
      } else if (stored) {
        setActiveTab("home");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProfileDetails();
      fetchReportsList();
    }
  }, [token]);

  const loadProfileDetails = async () => {
    try {
      const res = await citizenApi.get("/auth/me");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load citizen profile info", err);
      // Fallback local profile details for offline/mock sessions
      const storedToken = localStorage.getItem("citizen_access_token");
      if (storedToken && storedToken.includes("deepan")) {
        setProfile({
          full_name: "Deepan",
          email: "deepan@oceanwatch.in",
          phone: "+91 98765 43210",
          role: "citizen"
        });
      }
    }
  };

  const fetchReportsList = async () => {
    try {
      const res = await citizenApi.get("/reports/me");
      const mapped = res.data.map((r: any) => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        description: r.description || "Coastal hazard report",
        timestamp: r.timestamp || r.created_at,
        imagePreset: "uploaded_photo.png",
        synced: true,
        status: r.report_status || "INGESTED",
      }));
      setReports(mapped);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
    loadProfileDetails();
    fetchReportsList();
    setActiveTab("home");
    if (typeof window !== "undefined") {
      localStorage.setItem("oceanwatch_citizen_tab", "home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("citizen_access_token");
    setToken(null);
    setProfile(null);
    setReports([]);
    setActiveTab("landing");
    if (typeof window !== "undefined") {
      localStorage.setItem("oceanwatch_citizen_tab", "landing");
    }
  };

  const handleNavigateTab = (tab: any, preset?: string) => {
    setMobileMenuOpen(false);
    
    // Auth gates
    if (tab === "report" || tab === "reports" || tab === "sos" || tab === "profile") {
      if (!token) {
        setShowAuthModal(true);
        return;
      }
    }

    if (tab === "report") {
      setSelectedReportPreset(preset);
    } else {
      setSelectedReportPreset(undefined);
    }

    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("oceanwatch_citizen_tab", tab);
    }
  };

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "map", label: "Map", icon: Map },
    { id: "report", label: "Report", icon: Camera },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "sos", label: "SOS", icon: AlertOctagon },
    { id: "reports", label: "History", icon: Clock },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="h-screen w-screen overflow-y-auto flex flex-col bg-[#0A192F] text-[#0F172A] [--background:#F8FAFC] [--foreground:#0F172A] [--card:#FFFFFF] [--border:#E2E8F0] [--primary:#0284C7] [--primary-glow:rgba(2,132,199,0.15)] relative">
      
      {/* Global Interactive WebGL ElasticMesh Ocean Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ElasticMesh 
          image="/vibrant_ocean_bg.png" 
          interaction="hover" 
          tilt={0} 
          shading={0.65} 
          stiffness={0.035} 
          damping={0.16} 
          grabRadius={0.4} 
          pull={0.45} 
          wobble={6} 
          borderRadius={0}
          showGrid={true}
          gridDensity={32}
          gridOpacity={0.25}
          gridColor="#ffffff"
          resolution={32}
          globalTracking={true}
        />
      </div>

      {/* Dynamic shifting background grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Dynamic View rendering */}
      {activeTab === "landing" ? (
        <div className="flex flex-col min-h-screen">
          
          {/* Landing Header */}
          <header className="bg-white/70 backdrop-blur-md border-b border-[#E2E8F0] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="OceanWatch Logo" className="w-8 h-8 rounded-full object-cover border border-[#D5E2EC]" />
              <span className="text-xs font-black tracking-widest text-[#0E1726]">OCEANWATCH</span>
            </div>
            <div className="flex items-center gap-4">
              {token ? (
                <button
                  onClick={() => handleNavigateTab("home")}
                  className="text-xs bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  ENTER PORTAL
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  LOGIN
                </button>
              )}
            </div>
          </header>

          <LandingView
            onEnterPortal={(tab) => handleNavigateTab(tab || "home")}
            onLinkAccount={() => setShowAuthModal(true)}
            isAuthenticated={!!token}
          />
        </div>
      ) : (
        /* Authenticated/Guest Workspace layout */
        <div className="flex flex-col md:flex-row flex-1 min-h-screen relative">
          
          {/* Mobile Nav Header */}
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center z-30 sticky top-0">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="OceanWatch Logo" className="w-7 h-7 rounded-full object-cover border border-[#D5E2EC]" />
              <span className="text-xs font-black tracking-widest text-[#0E1726]">OCEANWATCH</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-[#64748B] hover:text-[#0F172A]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Sidebar overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E2E8F0] z-40 p-5 flex flex-col justify-between md:hidden"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <img src="/logo.jpg" alt="OceanWatch Logo" className="w-7 h-7 rounded-full object-cover border border-[#D5E2EC]" />
                      <span className="text-xs font-black tracking-widest text-[#0E1726]">OCEANWATCH</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)}>
                      <X size={18} className="text-[#64748B]" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigateTab(item.id as TabType)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                            activeTab === item.id
                              ? "bg-[#0284C7]/10 text-[#0284C7]"
                              : "text-[#64748B] hover:text-[#0F172A]"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                  <span className="text-[9px] text-[#64748B] font-bold block uppercase tracking-wider text-center">
                    {token ? "Node Session Authenticated" : "Guest Mode Preview"}
                  </span>
                  {token && (
                    <button
                      onClick={handleLogout}
                      className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-[#EF4444] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>Terminate Link</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Left Sidebar navigation removed for full bleed. Dock floats fixed. */}

          {/* Right Hand Content panel */}
          <div className="flex-1 flex flex-col h-screen overflow-y-auto">
            
            {/* Top Workspace Header bar */}
            <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 hidden md:flex justify-between items-center shrink-0 z-30 sticky top-0">

              <div className="flex items-center gap-4 text-xs font-bold text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Compass size={14} className="text-[#0284C7]" />
                  Sector: Coastal Buffers
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-[#14B8A6]" />
                  Telemetry: Active Link
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all cursor-pointer shadow-sm">
                  <Bell size={22} />
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white animate-pulse" />
                </div>

                <div
                  onClick={() => handleNavigateTab("profile")}
                  className="flex items-center gap-3 border border-[#E2E8F0] px-4 py-2.5 rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer bg-white shadow-sm"
                >
                  <div className="w-8 h-8 bg-[#0284C7]/10 rounded-full flex items-center justify-center text-[#0284C7] shrink-0">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-extrabold text-[#0f172a]">{profile?.full_name?.split(" ")[0] || "Guest"}</span>
                  <ChevronDown size={18} className="text-[#64748B]" />
                </div>
              </div>
            </header>

            {/* Dynamic View container */}
            <div className="flex-1 p-6 max-w-5xl w-full mx-auto pb-36">
              
              {activeTab === "home" && (
                <HomeView
                  userName={profile?.full_name || "Guest"}
                  reports={reports}
                  offlineQueueLength={offlineQueue.length}
                  onNavigateTab={handleNavigateTab}
                  onTriggerSos={() => handleNavigateTab("sos")}
                  locationName={profile ? "Key Largo sector" : undefined}
                />
              )}

              {activeTab === "map" && (
                <MapView apiClient={citizenApi} />
              )}

              {activeTab === "report" && (
                <ReportView
                  apiClient={citizenApi}
                  isOffline={isOffline}
                  onSuccess={fetchReportsList}
                  offlineQueue={offlineQueue}
                  setOfflineQueue={setOfflineQueue}
                  initialPreset={selectedReportPreset}
                />
              )}

              {activeTab === "alerts" && (
                <AlertsView onNavigateTab={handleNavigateTab} />
              )}

              {activeTab === "reports" && (
                <ReportsView
                  reports={reports}
                  offlineQueue={offlineQueue}
                  apiClient={citizenApi}
                />
              )}

              {activeTab === "sos" && (
                <SosView
                  apiClient={citizenApi}
                  isOffline={isOffline}
                  onSuccess={fetchReportsList}
                />
              )}

              {activeTab === "profile" && (
                <ProfileView
                  userName={profile?.full_name || "Guest"}
                  userEmail={profile?.email || "guest@oceanwatch.org"}
                  userPhone={profile?.phone || "None linked"}
                  verifiedCount={profile ? (reports.filter((e) => e.status === "RESOLVED" || e.status === "CONFIRMED").length || 12) : 0}
                  pendingCount={profile ? (reports.filter((e) => e.status === "INGESTED" || e.status === "PENDING_AI_ANALYSIS").length || 2) : 0}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>

          {/* Floating Dock Navigation */}
          <Dock
            items={menuItems.map((item) => ({
              icon: <item.icon size={23} />,
              label: item.label,
              onClick: () => handleNavigateTab(item.id as TabType),
              className: `${activeTab === item.id ? "active" : ""} ${
                item.id === "report" ? "cta-report" : item.id === "alerts" ? "cta-alerts" : item.id === "sos" ? "cta-sos" : ""
              }`
            }))}
            panelHeight={76}
            baseItemSize={58}
            magnification={78}
          />
        </div>
      )}

      {/* Global Auth Modal overlay */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        apiClient={citizenApi}
      />
    </div>
  );
}
