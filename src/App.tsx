import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import RequestTracker from './components/RequestTracker';
import MPDashboard from './components/MPDashboard';
import AIRecommendations from './components/AIRecommendations';
import ProposalComparison from './components/ProposalComparison';
import { LANGUAGES } from './mockData';
import { CitizenRequest, Language, RequestStatus } from './types';
import { 
  Sparkles, 
  PlusCircle, 
  Search, 
  Building2, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Coins, 
  ArrowRight,
  MapPin,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function App() {
  // Global States
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('landing');
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [selectedTrackID, setSelectedTrackID] = useState<string>('');

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error('Error fetching requests:', err));
  }, []);

  const langData = LANGUAGES[currentLang] || LANGUAGES.en;

  // Handlers
  const handleAddRequest = (newReq: CitizenRequest) => {
    setRequests(prev => [newReq, ...prev]);
  };

  const handleUpvote = (id: string) => {
    fetch('/api/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then(updatedReq => {
        if (updatedReq && !updatedReq.error) {
          setRequests(prev => prev.map(req => req.id === id ? updatedReq : req));
        }
      })
      .catch(err => console.error('Error upvoting:', err));
  };

  const handleStatusChange = (id: string, newStatus: RequestStatus) => {
    fetch('/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    })
      .then(res => res.json())
      .then(updatedReq => {
        if (updatedReq && !updatedReq.error) {
          setRequests(prev => prev.map(req => req.id === id ? updatedReq : req));
        }
      })
      .catch(err => console.error('Error updating status:', err));
  };

  const handleNavigateToTrack = (id: string) => {
    setSelectedTrackID(id);
    setActiveView('track-request');
  };

  // Dynamically calculate dynamic totals from active requests state
  const totalSubmissionsCount = requests.length;
  const highPriorityCount = requests.filter(r => r.urgency === 'High').length;
  
  const avgPriorityScore = requests.length > 0 
    ? Math.round(requests.reduce((acc, r) => acc + r.priorityScore, 0) / requests.length)
    : 0;

  const totalSanctionedLakhs = requests
    .filter(r => r.status === 'Allocated' || r.status === 'In Progress' || r.status === 'Completed')
    .reduce((acc, r) => acc + r.aiAnalysis.estimatedCostLakhs, 0);

  const completedProjectsCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans antialiased text-slate-800" id="app-container">
      {/* Dynamic Global Header */}
      <Header 
        currentLang={currentLang}
        onLangChange={(lang) => setCurrentLang(lang)}
        isAdminMode={isAdminMode}
        onModeToggle={(isAdmin) => setIsAdminMode(isAdmin)}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          if (view === 'dashboard' || view === 'ai-recommendations' || view === 'proposal-comparison') {
            setIsAdminMode(true);
          } else {
            setIsAdminMode(false);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <div className="animate-fadeIn" id="landing-page">
            {/* Redesigned Hero Section */}
            <div className="relative bg-gradient-to-b from-[#FDFBF7] via-[#E8EFF7] to-[#F5EFE6] text-slate-900 overflow-hidden py-24 px-4 border-b border-gold-700/25">
              {/* Premium Architecture Dome and India Map Silhouette SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 1000 400" fill="none" stroke="#C89B3C" strokeWidth="0.5">
                {/* Minimal wave graticules */}
                <path d="M 0,180 Q 250,130 500,180 T 1000,180" strokeWidth="0.4" strokeDasharray="3,6" />
                <path d="M 0,230 Q 250,180 500,230 T 1000,230" strokeWidth="0.4" strokeDasharray="3,6" />
                
                {/* Government Architecture Dome */}
                <g transform="translate(370, 90) scale(0.65)" stroke="#0F2D52" strokeWidth="0.8" fill="none">
                  <rect x="50" y="200" width="400" height="35" rx="2" />
                  <line x1="50" y1="200" x2="450" y2="200" />
                  <line x1="80" y1="200" x2="80" y2="145" />
                  <line x1="120" y1="200" x2="120" y2="145" />
                  <line x1="160" y1="200" x2="160" y2="145" />
                  <line x1="200" y1="200" x2="200" y2="145" />
                  <line x1="240" y1="200" x2="240" y2="145" />
                  <line x1="280" y1="200" x2="280" y2="145" />
                  <line x1="320" y1="200" x2="320" y2="145" />
                  <line x1="360" y1="200" x2="360" y2="145" />
                  <line x1="400" y1="200" x2="400" y2="145" />
                  <line x1="420" y1="200" x2="420" y2="145" />
                  <rect x="90" y="135" width="320" height="10" />
                  <path d="M 170,135 A 80,80 0 0,1 330,135 Z" />
                  <line x1="250" y1="55" x2="250" y2="15" />
                  <path d="M 250,15 L 265,22 L 250,29 Z" fill="#FF9933" stroke="none" />
                </g>
                
                {/* Soft India Map Silhouette */}
                <g transform="translate(180, 50) scale(0.6)" stroke="#0E7C66" strokeWidth="0.4" fill="none" opacity="0.4">
                  <path d="M 160 20 L 190 10 L 210 20 L 220 50 L 260 70 L 280 120 L 260 160 L 300 200 L 260 240 L 210 280 L 180 320 L 170 280 L 140 230 L 120 180 L 90 130 L 100 80 Z" strokeDasharray="2,4" />
                </g>
              </svg>
              
              <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-gold-200 rounded-full blur-3xl opacity-15 pointer-events-none"></div>
              <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-navy-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

              <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 hover:bg-gold-50 backdrop-blur-md rounded-full border border-gold-700/35 transition-all cursor-pointer">
                  <Sparkles className="w-4 h-4 text-gold-700 fill-gold-700" />
                  <span className="text-[11px] font-bold tracking-wider uppercase font-serif text-navy-900">
                    National Civic Innovation Portal • Digital India Initiative
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto text-navy-900 font-serif">
                  Democratizing Civic Priority with <span className="text-[#0E7C66]">JanVikas AI</span>
                </h1>
                
                <p className="text-base md:text-lg text-slate-650 max-w-3xl mx-auto leading-relaxed font-serif">
                  JanVikas AI parses local citizen submissions in 8 major Indian languages, analyzes physical feasibility, projects fiscal outlays, and clusters community demands to empower representatives to allocate budget funds.
                </p>

                {/* Styled Hero Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                  <button
                    onClick={() => setActiveView('submit-request')}
                    className="w-full sm:w-auto btn-gov-primary px-8 py-4 text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                    id="hero-btn-file-request"
                  >
                    <PlusCircle className="w-4.5 h-4.5 text-gold-700" />
                    <span>File Development Need</span>
                  </button>
                  <button
                    onClick={() => setActiveView('track-request')}
                    className="w-full sm:w-auto btn-gov-secondary px-8 py-4 text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                    id="hero-btn-track-status"
                  >
                    <Search className="w-4.5 h-4.5 text-gold-700" />
                    <span>Track Request Status</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Metrics Highlights */}
            <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
              <div className="bg-white rounded-2xl border border-gold-700/20 shadow-md p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:divide-gold-700/15 hover:shadow-lg transition-all duration-300">
                
                {/* Metric 1 */}
                <div className="flex items-center gap-3.5 p-1">
                  <div className="w-11 h-11 rounded-2xl bg-navy-50 text-navy-900 flex items-center justify-center shrink-0 border border-gold-700/10">
                    <Users className="w-5.5 h-5.5 text-navy-900" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-serif">Total Filed Needs</p>
                    <p className="text-xl font-bold text-navy-900 mt-0.5 font-serif">{totalSubmissionsCount}</p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="flex items-center gap-3.5 p-1 md:pl-6">
                  <div className="w-11 h-11 rounded-2xl bg-gold-50 text-gold-900 flex items-center justify-center shrink-0 border border-gold-700/20">
                    <Sparkles className="w-5.5 h-5.5 text-gold-800" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-serif">Avg Priority Index</p>
                    <p className="text-xl font-bold text-navy-900 mt-0.5 font-serif">{avgPriorityScore}%</p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="flex items-center gap-3.5 p-1 md:pl-6">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700/10">
                    <Coins className="w-5.5 h-5.5 text-emerald-800" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-serif">Budget Allocated</p>
                    <p className="text-xl font-bold text-emerald-850 mt-0.5 font-serif">₹{totalSanctionedLakhs.toFixed(1)} L</p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="flex items-center gap-3.5 p-1 md:pl-6">
                  <div className="w-11 h-11 rounded-2xl bg-navy-50 text-navy-900 flex items-center justify-center shrink-0 border border-gold-700/10">
                    <CheckCircle2 className="w-5.5 h-5.5 text-navy-800" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-serif">Resolved Projects</p>
                    <p className="text-xl font-bold text-navy-950 mt-0.5 font-serif">{completedProjectsCount}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Core Features Grid */}
            <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-navy-900 font-serif">Two Integrated Portals. One United Vision.</h2>
                <p className="text-sm text-slate-500 max-w-xl mx-auto font-serif">Explore features customized for both civic participants and local Member of Parliament administrative units.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Panel 1: Citizen Corner */}
                <div className="bg-white rounded-2xl border border-gold-700/15 p-6 md:p-8 flex flex-col justify-between shadow-xs hover:border-gold-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-900 border border-gold-700/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gold-800" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 font-serif">1. Citizen Civic Portal</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-serif font-normal">
                      Empowering every citizen to voice local infrastructure, health, educational, or resource deficits directly to regional authorities. High-quality support system allows communities to cluster around identical issues.
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-650 font-medium font-serif">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Submit in 8 Indian Languages (Hindi, Tamil, Telugu, etc.)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Voice dictation simulation & photo uploads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Interactive tracking IDs with full milestone timelines</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex gap-3">
                    <button
                      onClick={() => setActiveView('submit-request')}
                      className="flex-1 btn-gov-primary py-2.5 text-xs tracking-wider uppercase cursor-pointer"
                    >
                      File New Need
                    </button>
                    <button
                      onClick={() => setActiveView('track-request')}
                      className="flex-1 btn-gov-secondary py-2.5 text-xs tracking-wider uppercase cursor-pointer"
                    >
                      Track Existing
                    </button>
                  </div>
                </div>

                {/* Panel 2: MP Command Hub */}
                <div className="bg-white rounded-2xl border border-gold-700/15 p-6 md:p-8 flex flex-col justify-between shadow-xs hover:border-gold-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold-600 rounded-full blur-3xl opacity-5 pointer-events-none"></div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-600 border border-gold-700/30 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gold-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900 font-serif">2. MP Command & Sanction Center</h3>
                    <p className="text-sm text-slate-650 leading-relaxed font-serif font-normal">
                      Administrative decision-making panel driven by spatial telemetry and algorithmic rankings. Compare candidate civil works side-by-side on upvotes, cost projections, safety, and societal benefits.
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-650 font-medium font-serif">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0E7C66]" />
                        <span>Live spatial mapping of regional priority Hot-zones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0E7C66]" />
                        <span>Side-by-side comparative feasibility matrixes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0E7C66]" />
                        <span>MPLADS annual fund tracking and milestone overrides</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-gold-700/15 mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setIsAdminMode(true);
                        setActiveView('dashboard');
                      }}
                      className="w-full btn-gov-primary py-2.5 text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Enter MP Command Center</span>
                      <ArrowRight className="w-4 h-4 text-gold-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seamless Workflow Diagram */}
            <div className="bg-[#FAF8F5] border-y border-gold-700/20 py-16 px-4">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-navy-900 tracking-tight font-serif">System Algorithmic Pipelines</h2>
                  <p className="text-sm text-slate-500 max-w-lg mx-auto font-serif">How native citizen messages are processed, ranked, and mapped to sanctioned financial releases.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Step 1 */}
                  <div className="bg-white rounded-2xl p-5 border border-gold-700/15 shadow-xs hover:border-gold-700 hover:-translate-y-1 transition-all duration-300 relative">
                    <span className="text-[10px] font-mono font-bold text-navy-900 bg-gold-50 border border-gold-700/20 px-2 py-0.5 rounded">PHASE 1</span>
                    <h4 className="font-bold text-base text-navy-900 mt-3.5 mb-1.5 font-serif">Ingest & Translate</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif">
                      Citizen inputs voice memos or text descriptions in their regional tongue. AI normalizes input and runs safety risk sentiment parsing.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white rounded-2xl p-5 border border-gold-700/15 shadow-xs hover:border-gold-700 hover:-translate-y-1 transition-all duration-300 relative">
                    <span className="text-[10px] font-mono font-bold text-navy-900 bg-gold-50 border border-gold-700/20 px-2 py-0.5 rounded">PHASE 2</span>
                    <h4 className="font-bold text-base text-navy-900 mt-3.5 mb-1.5 font-serif">Deduplicate & Cluster</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif">
                      Adjacent municipal submissions are checked against GPS bounds. Multiple reports are clustered into singular "Deficit Hotspots."
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white rounded-2xl p-5 border border-gold-700/15 shadow-xs hover:border-gold-700 hover:-translate-y-1 transition-all duration-300 relative">
                    <span className="text-[10px] font-mono font-bold text-[#8C6D2D] bg-gold-50 border border-gold-700/20 px-2 py-0.5 rounded">PHASE 3</span>
                    <h4 className="font-bold text-base text-navy-900 mt-3.5 mb-1.5 font-serif">Priority Indexing</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif">
                      The neural ranker outputs a 0-100 Priority score based on population density, risk factors, upvotes, and budget feasibility.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white rounded-2xl p-5 border border-gold-700/15 shadow-xs hover:border-gold-700 hover:-translate-y-1 transition-all duration-300 relative">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-700/20 px-2 py-0.5 rounded">PHASE 4</span>
                    <h4 className="font-bold text-base text-navy-900 mt-3.5 mb-1.5 font-serif">Resource Sanction</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-serif">
                      MP selects highly ranked issues, runs multi-criteria feasibility comparisons, and authorizes instant MPLAD fund releases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indian National Branding Footer block */}
            <footer className="bg-navy-950 text-[#FAF6E8] py-16 px-4 border-t-2 border-gold-700 text-xs text-center font-serif">
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex justify-center items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="font-serif font-bold text-white text-xs tracking-wide">JanVikas AI CIVIC HUB</span>
                </div>
                <p className="text-xs text-[#E8DCC4] max-w-xl mx-auto leading-relaxed font-normal">
                  National Civic Innovation Framework under Article 243. Designed for regional constituencies of Guntur, Varanasi, Bengaluru, Pune, Lucknow, and Coimbatore. Powered by Indian Government Digital Infrastructure stack.
                </p>
                <div className="pt-4 border-t border-gold-700/20 text-[10px] text-gold-200 font-mono">
                  © 2026 MEITY CIVIC CELL. DEPLOYED CONTAINER RUN: STABLE • SECURITY ENFORCED (SSL-256)
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* View Router conditionals */}
        {activeView === 'submit-request' && (
          <RequestForm 
            currentLang={currentLang}
            onAddRequest={handleAddRequest}
            onNavigateToTrack={handleNavigateToTrack}
          />
        )}

        {activeView === 'track-request' && (
          <RequestTracker 
            requests={requests}
            onUpvote={handleUpvote}
            initialTrackID={selectedTrackID}
          />
        )}

        {activeView === 'dashboard' && (
          <MPDashboard 
            requests={requests}
            onStatusChange={handleStatusChange}
            onNavigate={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'ai-recommendations' && (
          <AIRecommendations />
        )}

        {activeView === 'proposal-comparison' && (
          <ProposalComparison requests={requests} />
        )}
      </main>
    </div>
  );
}
