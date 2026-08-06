"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Cpu, 
  Database, 
  Activity, 
  MapPin, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle,
  Radio,
  FileText,
  AlertCircle,
  BarChart,
  Search,
  Maximize2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

// Source Icon helper
const getSourceIcon = (source: string) => {
  switch (source.toLowerCase()) {
    case "citizen": return "📱";
    case "x": return "🕏";
    case "facebook": return "📘";
    case "reddit": return "🍊";
    case "news": return "📰";
    case "government": return "🏛️";
    case "coast guard": return "⚓";
    case "weather agency": return "🌀";
    default: return "🌐";
  }
};

// Types
interface OSINTReport {
  id: string;
  source: string;
  author: string;
  timestamp: string;
  location: string;
  distance: string;
  match_confidence: number;
  credibility_score: number;
  text: string;
  link: string;
}

interface IncidentCluster {
  id: string;
  hazard_type: string;
  hazard_category: string;
  location_name: string;
  status: string;
  confidence: number;
  reports_count: number;
  platforms_count: number;
  severity: "critical" | "high" | "medium";
  coordinates: { x: number; y: number; lat: number; lng: number };
  ai_summary: string;
  source_breakdown: {
    citizen: number;
    x: number;
    facebook: number;
    reddit: number;
    news: number;
    government: number;
  };
  timeline: { time: string; event: string; type: string }[];
  sources: OSINTReport[];
}

// Source Credibility Config
const CREDIBILITY_CONFIG = [
  { source: "Government Bulletins", score: 100, color: "bg-emerald-500" },
  { source: "Coast Guard Advisories", score: 98, color: "bg-teal-500" },
  { source: "Weather/Ocean Agencies", score: 95, color: "bg-cyan-500" },
  { source: "Verified News", score: 90, color: "bg-blue-500" },
  { source: "Verified Citizen Reports", score: 88, color: "bg-indigo-500" },
  { source: "Citizen Reports", score: 80, color: "bg-violet-500" },
  { source: "X (Twitter)", score: 72, color: "bg-slate-400" },
  { source: "Facebook", score: 68, color: "bg-blue-600" },
  { source: "Reddit", score: 65, color: "bg-orange-500" },
];

// Mock Incident Clusters Dataset
const MOCK_INCIDENTS: IncidentCluster[] = [
  {
    id: "2041",
    hazard_type: "Oil Spill",
    hazard_category: "Pollution",
    location_name: "Marina Beach Sector B",
    status: "Confirmed Hazard",
    confidence: 96,
    reports_count: 18,
    platforms_count: 6,
    severity: "critical",
    coordinates: { x: 280, y: 120, lat: 13.0500, lng: 80.2830 },
    ai_summary: "Multi-platform correlation confirms a heavy crude oil slick spreading 1.2 nautical miles northeast of the Marina Harbor entry channel. Synthetic aperture radar (SAR) signature matches citizen imagery.",
    source_breakdown: { citizen: 4, x: 5, facebook: 3, reddit: 2, news: 3, government: 1 },
    timeline: [
      { time: "07:18 PM", event: "Initial Citizen upload: Dark slick reported at Chennai Pier 4", type: "citizen" },
      { time: "07:22 PM", event: "🕏 @CoastalWatch Tweet: 'Massive petroleum smell near Marina Beach entrance'", type: "x" },
      { time: "07:35 PM", event: "FB Post by Chennai Marina Association confirming floating residue", type: "facebook" },
      { time: "07:55 PM", event: "Reddit r/chennai: 'Anyone know why water near Marina Beach looks rainbow?'", type: "reddit" },
      { time: "08:15 PM", event: "Chennai Times: Coast Guard investigating potential spill near port", type: "news" },
      { time: "08:30 PM", event: "INCOIS team dispatches active drift telemetry warning", type: "government" }
    ],
    sources: [
      { id: "s1", source: "Coast Guard", author: "Eastern Command Chennai", timestamp: "08:45 PM", location: "Marina Sector", distance: "0.2 km", match_confidence: 99, credibility_score: 98, text: "Official pollution warning issued. Containment assets deploying immediately to contain 1,500 gallon slick.", link: "https://indiancoastguard.gov.in/warnings/2041" },
      { id: "s2", source: "News", author: "Chennai Times", timestamp: "08:15 PM", location: "Chennai Harbor", distance: "0.4 km", match_confidence: 94, credibility_score: 90, text: "Reports of fuel oil spill emerging from container vessel berthing channel.", link: "https://chennaitimes.com/news/local/spill-harbor" },
      { id: "s3", source: "X", author: "@CoastalWatch", timestamp: "07:22 PM", location: "Harbor Entrance", distance: "0.7 km", match_confidence: 96, credibility_score: 72, text: "Massive petroleum sheen spreading rapidly. Smell is unbearable at the shoreline.", link: "https://x.com/coastalwatch/status/173" },
      { id: "s4", source: "Citizen", author: "Verified Report #0412", timestamp: "07:18 PM", location: "Pier 4 Jetty", distance: "0.1 km", match_confidence: 98, credibility_score: 88, text: "Thick brown residue coating dock structures. Took multiple photo scans.", link: "http://localhost:3000/citizen/reports" },
      { id: "s5", source: "Facebook", author: "Marina Boat Rental", timestamp: "07:35 PM", location: "Harbor Slips", distance: "0.8 km", match_confidence: 91, credibility_score: 68, text: "Warning all rental clients: water is contaminated. Slick drifting towards central beach.", link: "https://facebook.com/harbormarina/posts" },
      { id: "s6", source: "Reddit", author: "u/BeachComber7", timestamp: "07:55 PM", location: "Marina Beach Outer", distance: "1.5 km", match_confidence: 85, credibility_score: 65, text: "Floating rainbow oil patches observed near the State Park barrier.", link: "https://reddit.com/r/chennai/comments/spill" }
    ]
  },
  {
    id: "1089",
    hazard_type: "Algal Bloom",
    hazard_category: "Pollification",
    location_name: "Gulf of Mannar",
    status: "Confirmed Hazard",
    confidence: 94,
    reports_count: 12,
    platforms_count: 5,
    severity: "high",
    coordinates: { x: 150, y: 180, lat: 9.2673, lng: 79.2000 },
    ai_summary: "Widespread red tide / Karenia brevis harmful algal bloom (HAB) verified. Spectral analysis from Sentinel-2 satellite imagery matches citizen discolorations reports.",
    source_breakdown: { citizen: 3, x: 3, facebook: 2, reddit: 1, news: 2, government: 1 },
    timeline: [
      { time: "09:05 AM", event: "Citizen upload: Green discoloration in shallow bay", type: "citizen" },
      { time: "10:12 AM", event: "🕏 @OceanLogger: 'Water test values show high micro-algae density'", type: "x" },
      { time: "11:00 AM", event: "Chennai Times: ICG monitoring HAB plume near Gulf of Mannar", type: "news" },
      { time: "12:15 PM", event: "CMRC bulletins warning swimmers of high toxic counts", type: "government" }
    ],
    sources: [
      { id: "s7", source: "Weather Agency", author: "CMRC Oceanography Div", timestamp: "12:15 PM", location: "Mannar Shore", distance: "0.1 km", match_confidence: 99, credibility_score: 95, text: "Microcystin toxin counts exceed safe recreational thresholds. Water warning active.", link: "https://cmrc.gov.in/algae/1089" },
      { id: "s8", source: "News", author: "Chennai Times", timestamp: "11:00 AM", location: "Gulf of Mannar", distance: "0.5 km", match_confidence: 92, credibility_score: 90, text: "Swimmers report respiratory irritation. Red tide plume visible from aerial surveys.", link: "https://chennaitimes.com/news/red-tide" },
      { id: "s9", source: "X", author: "@OceanLogger", timestamp: "10:12 AM", location: "Tuticorin Coast", distance: "1.2 km", match_confidence: 89, credibility_score: 72, text: "High chlorophyll-a counts measured at my local testing station. Plume moving south.", link: "https://x.com/oceanlogger/status/441" },
      { id: "s10", source: "Citizen", author: "Guest Sentinel", timestamp: "09:05 AM", location: "Mandapam Coast", distance: "0.3 km", match_confidence: 95, credibility_score: 80, text: "Sea water looks extremely green and smells like decaying weeds.", link: "http://localhost:3000/citizen/reports" }
    ]
  },
  {
    id: "3054",
    hazard_type: "Coral Bleaching",
    hazard_category: "Marine Ecosystem",
    location_name: "Lakshadweep Reefs",
    status: "Confirmed Hazard",
    confidence: 91,
    reports_count: 9,
    platforms_count: 4,
    severity: "high",
    coordinates: { x: 340, y: 80, lat: 10.5667, lng: 72.6333 },
    ai_summary: "Thermal stress thermal scan confirms widespread bleaching on shallow reef patches. SST records indicate +2.3C anomaly matching citizen diver photo telemetry.",
    source_breakdown: { citizen: 2, x: 2, facebook: 2, reddit: 1, news: 1, government: 1 },
    timeline: [
      { time: "02:15 PM", event: "Citizen Diver: Bleaching observed at Kavaratti Reef", type: "citizen" },
      { time: "03:40 PM", event: "FB Group 'Divers of India': Stark white coral patches", type: "facebook" },
      { time: "05:10 PM", event: "Wildlife Institute of India issues marine thermal warning", type: "government" }
    ],
    sources: [
      { id: "s11", source: "Government", author: "Wildlife Institute of India", timestamp: "05:10 PM", location: "Kavaratti Reefs", distance: "0.1 km", match_confidence: 98, credibility_score: 100, text: "Elkhorn and Staghorn colonies showing signs of severe thermal stress. Diving restricted.", link: "https://wii.gov.in/coral-bleaching-alert" },
      { id: "s12", source: "Citizen", author: "EcoDiver verified", timestamp: "02:15 PM", location: "Kavaratti Patch", distance: "0.2 km", match_confidence: 96, credibility_score: 88, text: "Approximately 50% of brain coral heads completely bleached white. Water temperature 31C.", link: "http://localhost:3000/citizen/reports" }
    ]
  },
  {
    id: "4023",
    hazard_type: "Illegal Fishing",
    hazard_category: "Maritime",
    location_name: "Andaman Marine Sanctuary",
    status: "Confirmed Hazard",
    confidence: 89,
    reports_count: 15,
    platforms_count: 6,
    severity: "high",
    coordinates: { x: 80, y: 210, lat: 11.6234, lng: 92.7265 },
    ai_summary: "Correlation of marine radar and satellite AIS tracking indicates multiple dark fishing vessels trawling inside protected conservation buffer grids.",
    source_breakdown: { citizen: 2, x: 4, facebook: 2, reddit: 3, news: 3, government: 1 },
    timeline: [
      { time: "11:20 PM", event: "Reddit r/Andaman: 'Large trawler spotted in Mahatma Gandhi marine sanctuary'", type: "reddit" },
      { time: "11:55 PM", event: "🕏 @MaritimeWatch: Dark ship transponder telemetry", type: "x" },
      { time: "01:10 AM", event: "Forest Department dispatched responder patrol vessels", type: "government" }
    ],
    sources: [
      { id: "s13", source: "Coast Guard", author: "Station Port Blair Command", timestamp: "01:10 AM", location: "Mahatma Gandhi Marine Sanctuary", distance: "0.5 km", match_confidence: 97, credibility_score: 98, text: "Trawler intercepted inside sanctuary boundaries. Processing documentation under state law.", link: "https://indiancoastguard.gov.in/news/andaman-interception" },
      { id: "s14", source: "X", author: "@MaritimeWatch", timestamp: "11:55 PM", location: "Sanctuary Buffer", distance: "2.1 km", match_confidence: 92, credibility_score: 72, text: "AIS tracker indicates foreign flagged vessel disabled transponder near sanctuary bounds.", link: "https://x.com/maritimewatch/status/8892" }
    ]
  },
  {
    id: "1120",
    hazard_type: "Plastic Debris Drift",
    hazard_category: "Pollution",
    location_name: "Mumbai Coastal Straits Segment C",
    status: "Probable Threat",
    confidence: 85,
    reports_count: 6,
    platforms_count: 3,
    severity: "medium",
    coordinates: { x: 200, y: 150, lat: 18.9300, lng: 72.8300 },
    ai_summary: "Widespread macro-plastic garbage drift patch clustered from citizen observations and drone photography telemetry.",
    source_breakdown: { citizen: 2, x: 2, facebook: 1, reddit: 1, news: 0, government: 0 },
    timeline: [
      { time: "04:15 PM", event: "Citizen reports floating trash slick off Mumbai Harbor", type: "citizen" },
      { time: "05:30 PM", event: "🕏 @OceanClean: 'Garbage patch moving southwest at 0.8 knots'", type: "x" }
    ],
    sources: [
      { id: "s15", source: "Citizen", author: "Observer 2901", timestamp: "04:15 PM", location: "Straits Seg C", distance: "0.2 km", match_confidence: 94, credibility_score: 80, text: "Large drift patch containing plastics, bottles, and discarded ropes floating near the shipping lane.", link: "http://localhost:3000/citizen/reports" }
    ]
  },
  {
    id: "3095",
    hazard_type: "Mammal Stranding",
    hazard_category: "Marine Ecosystem",
    location_name: "Sundarbans Coastal Flats",
    status: "Confirmed Hazard",
    confidence: 90,
    reports_count: 8,
    platforms_count: 4,
    severity: "high",
    coordinates: { x: 100, y: 250, lat: 21.9497, lng: 89.1833 },
    ai_summary: "A pod of pilot whales stranded near shallow flats. Social feeds and local marine sanctuary logs correlate coordinates.",
    source_breakdown: { citizen: 2, x: 3, facebook: 2, reddit: 1, news: 0, government: 0 },
    timeline: [
      { time: "10:30 AM", event: "Local boater FB Post: 'Dolphins stuck on mudflats near Sundarbans'", type: "facebook" },
      { time: "11:15 AM", event: "🕏 @MarineRescue: 'Dispatching vet teams to evaluate stranding incident'", type: "x" }
    ],
    sources: [
      { id: "s16", source: "Citizen", author: "SundarbansWatch", timestamp: "10:30 AM", location: "Sundarbans Flats", distance: "0.1 km", match_confidence: 96, credibility_score: 85, text: "At least 6 dolphins struggling in less than 3 feet of water. Help needed immediately.", link: "http://localhost:3000/citizen/reports" }
    ]
  },
  {
    id: "5012",
    hazard_type: "Chemical Leak",
    hazard_category: "Pollution",
    location_name: "Ennore Port Chennai Outfall",
    status: "Confirmed Hazard",
    confidence: 93,
    reports_count: 14,
    platforms_count: 4,
    severity: "critical",
    coordinates: { x: 320, y: 110, lat: 13.2161, lng: 80.3247 },
    ai_summary: "Industrial acidic runoff leaking from municipal sewer outfalls. Correlated with pH testing and satellite discoloration.",
    source_breakdown: { citizen: 4, x: 4, facebook: 2, reddit: 2, news: 1, government: 1 },
    timeline: [
      { time: "01:20 PM", event: "Citizen: Green foam observed exiting storm pipe at Pier 10", type: "citizen" },
      { time: "02:15 PM", event: "EPA dispatch team tests water acidity levels", type: "government" }
    ],
    sources: [
      { id: "s17", source: "Government", author: "CPCB Command Office", timestamp: "02:15 PM", location: "Outfall Channel", distance: "0.2 km", match_confidence: 98, credibility_score: 100, text: "Severe pH imbalance verified. Warning local marine life buffers and recreational activities.", link: "https://cpcb.nic.in/news/ennore-chemical" }
    ]
  },
  {
    id: "6024",
    hazard_type: "Tsunami/Swell Surge",
    hazard_category: "Pollution",
    location_name: "Indira Point Deep Channel",
    status: "Confirmed Hazard",
    confidence: 95,
    reports_count: 22,
    platforms_count: 5,
    severity: "critical",
    coordinates: { x: 90, y: 70, lat: 6.0800, lng: 93.8800 },
    ai_summary: "Coastal swell activity exceeding safe docking thresholds. Triangulating citizen wave logs with NOAA marine buoys.",
    source_breakdown: { citizen: 5, x: 6, facebook: 4, reddit: 3, news: 2, government: 2 },
    timeline: [
      { time: "08:10 PM", event: "NOAA marine buoys measure wave heights over 5 meters", type: "government" },
      { time: "09:15 PM", event: "Local marina alerts: Swell surging over harbor walls", type: "facebook" }
    ],
    sources: [
      { id: "s18", source: "Government", author: "INCOIS Buoy Data Center", timestamp: "08:10 PM", location: "Indira Point Deep", distance: "1.5 km", match_confidence: 99, credibility_score: 100, text: "Station 42003 reports wave swell amplitude 5.2 meters heading north.", link: "https://incois.gov.in/station/42003" }
    ]
  }
];

// Processing pipeline stages
const AI_STAGES = [
  "Querying social APIs & public feeds...",
  "Extracting ocean hazard mentions...",
  "Filtering duplicate metadata records...",
  "Comparing ingestion timestamps...",
  "Computing GPS coordinate proximity...",
  "Matching image visual vectors...",
  "Running semantic similarity mapping...",
  "Clustering correlated nodes...",
  "Running credibility weighting engine...",
  "Generating unified incident summary..."
];

export default function OSINTIntelligencePage() {
  const [incidents, setIncidents] = useState<IncidentCluster[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentCluster>(MOCK_INCIDENTS[0]);
  const [selectedReport, setSelectedReport] = useState<OSINTReport | null>(MOCK_INCIDENTS[0].sources[0]);
  
  // Pipeline State
  const [pipelineState, setPipelineState] = useState<"idle" | "running" | "completed">("completed");
  const [pipelineStage, setPipelineStage] = useState(0);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [hazardFilter, setHazardFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Run Pipeline simulation
  const handleTriggerPipeline = () => {
    setPipelineState("running");
    setPipelineStage(0);
    
    let interval = setInterval(() => {
      setPipelineStage((prev) => {
        const next = prev + 1;
        if (next >= AI_STAGES.length) {
          clearInterval(interval);
          setPipelineState("completed");
          return prev;
        }
        return next;
      });
    }, 400);
  };

  // Filter logic
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch = inc.location_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.hazard_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.ai_summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHazard = hazardFilter === "all" || inc.hazard_type === hazardFilter;
    const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter;
    
    // Check if contains specific platform in sources
    const matchesPlatform = platformFilter === "all" || inc.sources.some(s => s.source.toLowerCase() === platformFilter.toLowerCase());

    return matchesSearch && matchesHazard && matchesSeverity && matchesPlatform;
  });

  // Handle selected incident changes
  const selectIncident = (inc: IncidentCluster) => {
    setSelectedIncident(inc);
    setSelectedReport(inc.sources[0] || null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-[#0E1726] min-h-full font-mono text-xs relative overflow-hidden">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#D5E2EC] relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest mb-1.5">
              <Globe className="w-4 h-4" />
              OSINT Intelligence & Data Fusion
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#0E1726] leading-tight">
              Multi-Source Intelligence Engine
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">
              Autonomous Aggregation, Clustering & Credibility Verification
            </p>
          </div>

          <button
            onClick={handleTriggerPipeline}
            disabled={pipelineState === "running"}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg transition-all duration-300 ${
              pipelineState === "running"
                ? "bg-slate-100 text-slate-400 border border-[#D5E2EC] cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
            }`}
          >
            <Cpu className={`w-4 h-4 ${pipelineState === "running" ? "animate-spin" : ""}`} />
            {pipelineState === "running" ? "Running Correlation..." : "Trigger Correlation Pipeline"}
          </button>
        </div>

        {/* Pipeline State Overlay/Card */}
        {pipelineState === "running" && (
          <div className="bg-white border border-[#D5E2EC] rounded-2xl p-8 animate-pulse space-y-6 relative z-25 shadow-sm text-[#0E1726]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-2xl text-blue-500">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">INTELLIGENCE PIPELINE ACTIVE</span>
                <h3 className="text-lg font-black tracking-wide">Processing Clustered Incident Channels</h3>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-[#D5E2EC]">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((pipelineStage + 1) / AI_STAGES.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                <span>Stage {pipelineStage + 1} of {AI_STAGES.length}</span>
                <span className="text-blue-600">{AI_STAGES[pipelineStage]}</span>
              </div>
            </div>

            {/* Stages log list */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-semibold text-[#64748B]">
              {AI_STAGES.map((stage, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${idx <= pipelineStage ? "text-blue-600" : "text-slate-400"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  <span>{stage}</span>
                  {idx < pipelineStage && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {pipelineState === "completed" && (
          <div className="space-y-8 relative z-10">

            {/* Filter Toolbar */}
            <div className="bg-white border border-[#D5E2EC] p-5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 shrink-0">
                <Filter className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0E1726]">Telemetry Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center flex-1 max-w-3xl">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search incident markers..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5E2EC] focus:border-blue-500 rounded-xl text-xs font-semibold placeholder-slate-450 text-[#0E1726] outline-none transition-colors"
                  />
                </div>

                {/* Platform */}
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-white border border-[#D5E2EC] hover:border-blue-500 text-[#0E1726] px-4 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer transition-colors"
                >
                  <option value="all">All Sources</option>
                  <option value="citizen">Citizen</option>
                  <option value="x">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                  <option value="reddit">Reddit</option>
                  <option value="news">News</option>
                  <option value="government">Government</option>
                </select>

                {/* Hazard Type */}
                <select
                  value={hazardFilter}
                  onChange={(e) => setHazardFilter(e.target.value)}
                  className="bg-white border border-[#D5E2EC] hover:border-blue-500 text-[#0E1726] px-4 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer transition-colors"
                >
                  <option value="all">All Hazards</option>
                  <option value="Oil Spill">Oil Spill</option>
                  <option value="Algal Bloom">Algal Bloom</option>
                  <option value="Coral Bleaching">Coral Bleaching</option>
                  <option value="Illegal Fishing">Illegal Fishing</option>
                </select>

                {/* Severity */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-white border border-[#D5E2EC] hover:border-blue-500 text-[#0E1726] px-4 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer transition-colors"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            </div>

            {/* Split Screen Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: List of Incidents & Visual Graph (Colspan 5) */}
              <div className="xl:col-span-5 space-y-8">
                
                {/* Clustered Incidents Panel */}
                <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#D5E2EC]">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0E1726]">Active Incident Clusters ({filteredIncidents.length})</h3>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                    {filteredIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => selectIncident(inc)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          selectedIncident.id === inc.id
                            ? "bg-blue-50/70 border-blue-500 shadow-sm"
                            : "bg-[#F8FAFC] border-[#D5E2EC] hover:bg-[#EBF2F7]/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black tracking-wide text-[#0E1726]">{inc.hazard_type}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                              inc.severity === "critical"
                                ? "bg-red-50 text-red-500 border border-red-200"
                                : inc.severity === "high"
                                ? "bg-orange-50 text-orange-500 border border-orange-200"
                                : "bg-yellow-50 text-yellow-600 border border-yellow-200"
                            }`}>
                              {inc.severity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-bold uppercase">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {inc.location_name}
                          </div>
                          <div className="text-[10px] text-[#64748B] font-semibold">
                            Merged {inc.reports_count} reports across {inc.platforms_count} platforms
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">CONFIDENCE</span>
                          <span className="text-2xl font-black text-[#0E1726] tracking-tight">{inc.confidence}%</span>
                        </div>
                      </div>
                    ))}
                    {filteredIncidents.length === 0 && (
                      <div className="py-12 text-center text-xs text-[#64748B] uppercase font-black">
                        No incident clusters match selected filters.
                      </div>
                    )}
                  </div>
                </div>

                {/* Source Credibility Weight Card */}
                <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#D5E2EC]">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0E1726]">Source Credibility Index</h3>
                  </div>
                  
                  <div className="space-y-3.5">
                    {CREDIBILITY_CONFIG.map((source, idx) => (
                      <div key={idx} className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                          <span className="text-[#475569]">{source.source}</span>
                          <span className="text-[#64748B]">{source.score} / 100</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-[#D5E2EC]">
                          <div 
                            className={`h-full rounded-full ${source.color}`}
                            style={{ width: `${source.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Unified Cluster details, Visual correlation, and coordinate map (Colspan 7) */}
              <div className="xl:col-span-7 space-y-8">
                
                {/* Incident Intel Detail Header */}
                <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-6">
                  
                  {/* Top Stats Overview */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D5E2EC]">
                    <div className="text-left">
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest block">UNIFIED THREAT INTELLIGENCE REPORT</span>
                      <h2 className="text-2xl font-black text-[#0E1726] tracking-tight flex items-center gap-2 mt-1">
                        Incident #{selectedIncident.id}: {selectedIncident.hazard_type}
                      </h2>
                      <span className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1 mt-1 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {selectedIncident.location_name} • Triangulating...
                      </span>
                    </div>

                    <div className="flex gap-4 items-center bg-[#F8FAFC] border border-[#D5E2EC] px-4 py-2 rounded-2xl">
                      <div className="text-center">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">INCIDENTS</span>
                        <span className="text-lg font-black text-[#0E1726]">{selectedIncident.reports_count}</span>
                      </div>
                      <div className="w-px h-8 bg-[#D5E2EC]" />
                      <div className="text-center">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">CHANNELS</span>
                        <span className="text-lg font-black text-[#0E1726]">{selectedIncident.platforms_count}</span>
                      </div>
                      <div className="w-px h-8 bg-[#D5E2EC]" />
                      <div className="text-center">
                        <span className="text-[9px] text-[#64748B] font-bold uppercase block">STATUS</span>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block mt-1">VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Cluster Visualization Graph */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">AI Correlation Graph</span>
                    <div className="h-[200px] w-full bg-[#F8FAFC] border border-[#D5E2EC] rounded-2xl relative overflow-hidden flex items-center justify-center">
                      
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

                      {/* Connection SVG lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* Connecting lines from platforms to correlation center */}
                        <line x1="60" y1="35" x2="310" y2="100" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        <line x1="60" y1="75" x2="310" y2="100" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        <line x1="60" y1="120" x2="310" y2="100" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        <line x1="60" y1="165" x2="310" y2="100" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        
                        {/* NOAA & CG bulletins */}
                        <line x1="560" y1="50" x2="310" y2="100" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        <line x1="560" y1="120" x2="310" y2="100" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />

                        {/* From Center to Unified Incident */}
                        <line x1="310" y1="100" x2="310" y2="165" stroke="#10b981" strokeWidth="2.5" />
                      </svg>

                      {/* Platform Nodes (Left Side) */}
                      <div className="absolute left-6 top-6 flex items-center gap-2 bg-white border border-blue-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm">
                        <span>📱 Citizen Reports</span>
                      </div>
                      <div className="absolute left-6 top-16 flex items-center gap-2 bg-white border border-blue-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm">
                        <span>🕏 X (Twitter)</span>
                      </div>
                      <div className="absolute left-6 top-28 flex items-center gap-2 bg-white border border-blue-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm">
                        <span>📰 News Articles</span>
                      </div>
                      <div className="absolute left-6 top-40 flex items-center gap-2 bg-white border border-blue-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm">
                        <span>🍊 Reddit / Facebook</span>
                      </div>

                      {/* AI Correlation Center node */}
                      <div className="absolute top-[80px] left-[260px] w-28 h-12 bg-blue-50 border border-blue-500 rounded-xl flex flex-col justify-center items-center gap-0.5 shadow-sm z-10">
                        <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">AI FUSION ENGINE</span>
                        <span className="text-[7px] text-slate-500 font-bold font-mono">MATCHING NODES</span>
                      </div>

                      {/* Government & Agency Nodes (Right Side) */}
                      <div className="absolute right-6 top-10 flex items-center gap-2 bg-white border border-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-teal-600 shadow-sm">
                        <span>🏛️ NOAA Satellite</span>
                      </div>
                      <div className="absolute right-6 top-28 flex items-center gap-2 bg-white border border-teal-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-teal-600 shadow-sm">
                        <span>⚓ Coast Guard Advisories</span>
                      </div>

                      {/* Target Unified Incident Node (Bottom Center) */}
                      <div className="absolute bottom-3 left-[230px] w-40 h-10 bg-emerald-50 border border-emerald-500 rounded-xl flex items-center justify-center gap-2 shadow-sm z-10">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Unified Incident</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary & circular gauge grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                    {/* Summary */}
                    <div className="md:col-span-8 space-y-3">
                      <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Unified Summary Decision</span>
                      <div className="bg-[#F8FAFC] border border-[#D5E2EC] p-4 rounded-2xl text-xs font-semibold text-[#475569] leading-relaxed">
                        {selectedIncident.ai_summary}
                      </div>
                    </div>

                    {/* Circular confidence gauge */}
                    <div className="md:col-span-4 bg-[#F8FAFC] border border-[#D5E2EC] p-4 rounded-2xl flex flex-col justify-between items-center text-center h-full">
                      <span className="text-[9px] text-[#64748B] font-black uppercase tracking-wider">Incident Confidence</span>
                      
                      <div className="relative w-20 h-20 my-2 flex items-center justify-center">
                        {/* Circular ring */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="rgba(0,0,0,0.05)" strokeWidth="6" fill="transparent" />
                          <circle cx="40" cy="40" r="32" stroke="#2563eb" strokeWidth="6" fill="transparent" 
                            strokeDasharray={`${2 * Math.PI * 32}`}
                            strokeDashoffset={`${2 * Math.PI * 32 * (1 - selectedIncident.confidence / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <span className="absolute text-sm font-black text-[#0E1726]">{selectedIncident.confidence}%</span>
                      </div>

                      <div className="text-[8px] text-[#64748B] font-black uppercase tracking-widest">Calculated by Fusion Weight</div>
                    </div>
                  </div>

                  {/* Chronological Timeline feed */}
                  <div className="space-y-3 text-left">
                    <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider block">Unified Chronological Timeline</span>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      {selectedIncident.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4 items-start text-xs font-semibold">
                          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider w-16 shrink-0 mt-0.5">
                            {event.time}
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shrink-0 mt-1" />
                            {idx < selectedIncident.timeline.length - 1 && (
                              <div className="w-0.5 h-10 bg-[#D5E2EC] mt-0.5" />
                            )}
                          </div>
                          <div className="p-3 bg-[#F8FAFC] border border-[#D5E2EC] rounded-xl flex-1 text-[#475569]">
                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider mr-2">[{event.type}]</span>
                            {event.event}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OSINT Map View Coordinate Display */}
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#64748B] font-black uppercase tracking-wider">Spatial Coordinate Telemetry Map</span>
                      <span className="text-[9px] font-mono text-[#64748B]">RADAR AREA: LAT {selectedIncident.coordinates.lat.toFixed(4)} LNG {selectedIncident.coordinates.lng.toFixed(4)}</span>
                    </div>

                    <div className="h-[250px] bg-[#F8FAFC] border border-[#D5E2EC] rounded-2xl relative overflow-hidden flex items-center justify-center">
                      
                      {/* Radar sweep scanning animation */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_70%)] pointer-events-none" />
                      <div className="absolute w-[300px] h-[300px] bg-blue-500/5 border border-blue-500/10 rounded-full animate-ping pointer-events-none" />
                      
                      {/* Map Coordinate Grids */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                      
                      {/* Dynamic SVG Plotting coordinates of all incidents in the list */}
                      <svg className="absolute inset-0 w-full h-full">
                        {/* Radar sweep line */}
                        <line x1="50%" y1="50%" x2="100%" y2="0" stroke="rgba(37,99,235,0.12)" strokeWidth="1.5" className="origin-center animate-[spin_8s_linear_infinite]" />
                        
                        {incidents.map((inc) => {
                          const isSelected = inc.id === selectedIncident.id;
                          return (
                            <g key={inc.id} className="cursor-pointer" onClick={() => selectIncident(inc)}>
                              {/* Pulse wave around active node */}
                              {isSelected && (
                                <circle cx={inc.coordinates.x} cy={inc.coordinates.y} r="18" fill="rgba(37,99,235,0.1)" className="animate-pulse" />
                              )}
                              {/* Central node dot */}
                              <circle cx={inc.coordinates.x} cy={inc.coordinates.y} r="6" fill={isSelected ? "#3b82f6" : "#94a3b8"} stroke="white" strokeWidth="1.5" />
                              {/* Text label */}
                              <text x={inc.coordinates.x + 10} y={inc.coordinates.y + 4} fill={isSelected ? "#0E1726" : "#64748B"} fontSize="9" fontWeight="900" fontFamily="monospace">
                                #{inc.id} {inc.hazard_type.toUpperCase()} ({inc.confidence}%)
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* HUD Overlays */}
                      <div className="absolute top-4 left-4 p-2 bg-white border border-[#D5E2EC] rounded-xl text-[9px] font-mono text-[#64748B] space-y-0.5 shadow-sm">
                        <div className="flex gap-2"><span>GRID SEC:</span><span className="text-[#0E1726] font-bold">FL-KEYS-COASTAL</span></div>
                        <div className="flex gap-2"><span>RADAR STATUS:</span><span className="text-emerald-600 font-bold">ACTIVE FEED</span></div>
                        <div className="flex gap-2"><span>TRIANGULATION:</span><span className="text-[#0E1726] font-bold">OSINT-FUSION</span></div>
                      </div>

                      <div className="absolute bottom-4 right-4 p-2 bg-white border border-[#D5E2EC] rounded-xl text-[9px] font-mono text-[#64748B] shadow-sm">
                        <span>CLICK PLOTTED NODE TO SNAP RADAR</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Source Attribution & Detail Drawer Panel */}
                <div className="bg-white border border-[#D5E2EC] p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D5E2EC]">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0E1726]">Supporting Sources Evidence Attribution</h3>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase">{selectedIncident.sources.length} Verified Sources</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Supporting Sources List (Colspan 5) */}
                    <div className="md:col-span-5 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {selectedIncident.sources.map((src) => (
                        <div
                          key={src.id}
                          onClick={() => setSelectedReport(src)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                            selectedReport?.id === src.id
                              ? "bg-blue-50/70 border-blue-500"
                              : "bg-[#F8FAFC] border-[#D5E2EC] hover:bg-[#EBF2F7]/50"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-1">
                            <span className="text-blue-600 flex items-center gap-1.5 font-bold">
                              <span>{getSourceIcon(src.source)}</span>
                              {src.source}
                            </span>
                            <span className="text-[#64748B]">{src.timestamp}</span>
                          </div>
                          <p className="text-xs font-semibold text-[#0E1726] line-clamp-1">{src.author}</p>
                          <div className="flex justify-between items-center text-[9px] text-[#64748B] font-semibold mt-1">
                            <span>Match: {src.match_confidence}%</span>
                            <span>Cred: {src.credibility_score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Source Detail Drawer (Colspan 7) */}
                    <div className="md:col-span-7 bg-[#F8FAFC] border border-[#D5E2EC] p-5 rounded-2xl space-y-4 text-left">
                      {selectedReport ? (
                        <div className="space-y-4 text-xs">
                          <div className="flex justify-between items-start pb-3 border-b border-[#D5E2EC]">
                            <div>
                              <span className="text-[9px] text-blue-600 font-black uppercase tracking-wider block">SOURCE PLATFORM</span>
                              <h4 className="text-sm font-black text-[#0E1726] flex items-center gap-2 mt-0.5">
                                <span>{getSourceIcon(selectedReport.source)}</span>
                                {selectedReport.source} Feed
                              </h4>
                            </div>
                            
                            <a
                              href={selectedReport.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white border border-[#D5E2EC] rounded-xl hover:bg-slate-550/10 text-[#64748B] hover:text-[#0E1726] transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider">
                            <div>
                              <span className="text-[#64748B] block">AUTHOR / SOURCE</span>
                              <span className="text-[#0E1726] block mt-0.5 break-all">{selectedReport.author}</span>
                            </div>
                            <div>
                              <span className="text-[#64748B] block">POSTED TIMESTAMP</span>
                              <span className="text-[#0E1726] block mt-0.5">{selectedReport.timestamp}</span>
                            </div>
                            <div>
                              <span className="text-[#64748B] block">MATCH CONFIDENCE</span>
                              <span className="text-blue-600 block mt-0.5">{selectedReport.match_confidence}%</span>
                            </div>
                            <div>
                              <span className="text-[#64748B] block">CREDIBILITY WEIGHT</span>
                              <span className="text-emerald-600 block mt-0.5">{selectedReport.credibility_score}%</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-[#D5E2EC]">
                            <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">EXTRACTED REPORT TEXT</span>
                            <p className="text-xs font-semibold text-[#475569] leading-relaxed bg-white p-3 rounded-xl border border-[#D5E2EC]">
                              "{selectedReport.text}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-xs text-[#64748B] uppercase font-black">
                          Select a supporting source to view raw telemetry details.
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
