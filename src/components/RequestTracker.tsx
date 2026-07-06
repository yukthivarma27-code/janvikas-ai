import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CitizenRequest, RequestStatus } from '../types';
import { CATEGORY_COLORS, getCategoryIcon } from '../mockData';
import { Search, ThumbsUp, Calendar, MapPin, User, Sparkles, CheckCircle2, CircleDot, ChevronRight, AlertCircle } from 'lucide-react';

interface RequestTrackerProps {
  requests: CitizenRequest[];
  onUpvote: (id: string) => void;
  initialTrackID?: string;
}

const TIMELINE_STEPS: { status: RequestStatus; title: string; desc: string }[] = [
  { status: 'Submitted', title: 'Request Submitted', desc: 'Citizen successfully filed demand, GPS-coordinates verified by system.' },
  { status: 'Verified', title: 'District Verification', desc: 'Regional administrative office confirmed local physical feasibility.' },
  { status: 'Prioritized', title: 'AI Prioritization', desc: 'Algorithmic assessment of density, safety, & budget fit completed.' },
  { status: 'Allocated', title: 'Fund Allocation', desc: 'Project added to MP budget, MPLADS Q1 resources earmarked.' },
  { status: 'In Progress', title: 'Execution Started', desc: 'Contract signed. Physical civil works underway on site.' },
  { status: 'Completed', title: 'Completed & Certified', desc: 'Project built successfully. Local third-party audit certified completion.' }
];

export default function RequestTracker({ requests, onUpvote, initialTrackID = '' }: RequestTrackerProps) {
  const [searchID, setSearchID] = useState(initialTrackID);
  const [activeRequest, setActiveRequest] = useState<CitizenRequest | null>(
    requests.find(r => r.id === initialTrackID) || requests[0]
  );
  const [showError, setShowError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = requests.find(r => r.id.trim().toUpperCase() === searchID.trim().toUpperCase());
    if (found) {
      setActiveRequest(found);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const getStatusIndex = (currentStatus: RequestStatus) => {
    return TIMELINE_STEPS.findIndex(step => step.status === currentStatus);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-serif" id="request-tracking-module">
      
      {/* Tracker Heading */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
          <span>Development Request Monitoring System</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Verify real-time executive progress, financial sanctions, and milestone timelines</p>
      </div>

      {/* Tracking ID Search Box */}
      <div className="bg-white border border-gold-700/20 p-5 rounded-2xl shadow-xs mb-6 animate-fadeIn">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gold-700" />
            <input 
              type="text" 
              placeholder="Enter Citizen Tracking ID (e.g. JV-2026-9041, JV-2026-1102)"
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm input-gov text-[#0F2D52] font-bold font-mono tracking-wider uppercase"
              id="input-tracker-search"
            />
          </div>
          <button
            type="submit"
            className="btn-gov-primary px-7 py-3 text-xs uppercase tracking-wider cursor-pointer shadow-xs"
            id="btn-tracker-search-submit"
          >
            Locate Request
          </button>
        </form>

        {showError && (
          <div className="mt-3 text-xs text-rose-800 flex items-center gap-1 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            No matching request found with ID "{searchID}". Please try selecting from the active list below.
          </div>
        )}
      </div>

      {/* Main Layout: Split view of detailed active tracker & list of other issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp">
        
        {/* Active tracking detail pane */}
        <div className="lg:col-span-2 space-y-6">
          {activeRequest ? (
            <div className="bg-white card-gov p-5 md:p-6.5 space-y-6" id="active-tracker-details">
              
              {/* Header inside detail page */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gold-700/15">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-[#FAF6E8] text-[#0F2D52] px-2.5 py-1 rounded-md border border-gold-700/25">
                      {activeRequest.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeRequest.urgency === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-gold-50 text-gold-900 border border-gold-700/20'
                    }`}>
                      {activeRequest.urgency} Urgency
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-navy-900 leading-tight">
                    {activeRequest.locality} • {activeRequest.category} Demand
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-gold-700" /> {activeRequest.mandal}, {activeRequest.constituency}</span>
                    <span className="flex items-center gap-1 font-medium"><Calendar className="w-3 h-3 text-slate-400" /> Filed {activeRequest.date}</span>
                  </p>
                </div>

                {/* Upvoting system button */}
                <button
                  onClick={() => onUpvote(activeRequest.id)}
                  className="flex items-center gap-1.5 bg-[#FAF6E8] hover:bg-gold-100/80 text-navy-900 border border-gold-700/30 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                  id="btn-tracker-upvote"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-gold-700 fill-gold-700" />
                  <span>{activeRequest.upvotes} Support Votes</span>
                </button>
              </div>

              {/* Original complaint explanation */}
              <div className="bg-[#FAF6E8]/30 rounded-xl p-4.5 border border-gold-700/15 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Citizen Testimonial</p>
                <p className="text-slate-700 text-xs md:text-sm leading-relaxed italic">
                  "{activeRequest.description}"
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-gold-700" /> Submitted by <strong className="text-slate-650">{activeRequest.name}</strong>
                </p>
              </div>

              {/* Progress Milestones timeline */}
              <div>
                <p className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-5">Milestone Timeline Progress</p>
                
                {/* Visual Timeline Stepper */}
                <div className="space-y-5 relative pl-4 border-l border-gold-700/20 ml-2" id="milestone-timeline">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const activeIndex = getStatusIndex(activeRequest.status);
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        {/* Bullet indicators */}
                        <div className="absolute -left-[25px] flex items-center justify-center">
                          {isCompleted ? (
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-white shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                              <CircleDot className="w-2.5 h-2.5 text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Text descriptions */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.title}
                            </span>
                            {isCurrent && (
                              <span className="bg-gold-50 text-gold-900 border border-gold-700/25 text-[9px] font-bold px-1.5 py-0.2 rounded-sm animate-pulse uppercase tracking-wider">
                                Current Milestone
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 leading-normal ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.desc}
                          </p>
                          {isCompleted && (
                            <span className="text-[9px] text-slate-400 font-mono font-medium">
                              Verified on: {new Date(new Date(activeRequest.date).getTime() + idx * 86400000).toISOString().split('T')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Justification Tray */}
              <div className="bg-[#FAF6E8]/25 rounded-2xl p-5 border border-gold-700/20 relative overflow-hidden text-navy-900">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gold-200 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
                <div className="flex items-center gap-1.5 mb-3 border-b border-gold-700/15 pb-2">
                  <Sparkles className="w-4 h-4 text-gold-700 fill-gold-700" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy-900">SYSTEM AI ANALYTICS OVERVIEW</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-gold-700/15 shadow-xs">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Estimated Direct Impact</p>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">{activeRequest.aiAnalysis.estimatedImpactUsers} citizens</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Primary beneficiary network</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gold-700/15 shadow-xs">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Financial Outlay Forecast</p>
                    <p className="text-sm font-bold text-amber-700 mt-0.5">₹{activeRequest.aiAnalysis.estimatedCostLakhs} Lakhs</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Required municipal budget</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gold-700/15 shadow-xs">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Calculated Priority Index</p>
                    <span className="text-sm font-bold text-emerald-800 mt-0.5">{activeRequest.priorityScore} / 100</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">National rank priority</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-gold-50/20 rounded-2xl p-12 text-center text-slate-500 border border-gold-700/20 font-serif">
              Select or search a Citizen Development Request from the side menu to track its milestone status.
            </div>
          )}
        </div>

        {/* Directory list of all other issues in the database */}
        <div className="bg-white border border-gold-700/20 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-navy-900 font-serif">Citizen Request Registry</h4>
            <p className="text-[11px] text-slate-550 font-serif font-medium">Click any card to load timeline progress</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]" id="tracker-directory-list">
            {requests.map((req) => {
              const isSelected = activeRequest?.id === req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setActiveRequest(req);
                    setSearchID(req.id);
                    setShowError(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                    isSelected 
                      ? 'bg-navy-900 text-[#FAF6E8] border-gold-700 shadow-md scale-[1.01]' 
                      : 'bg-white hover:bg-gold-50/30 text-slate-700 border-gold-700/15 shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`font-mono font-bold ${isSelected ? 'text-gold-500' : 'text-slate-500'}`}>
                      {req.id}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                      req.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : req.status === 'In Progress' 
                        ? 'bg-[#FAF6E8] text-[#0F2D52] animate-pulse border border-gold-700/30'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <p className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {req.locality}
                    </p>
                    <p className={`text-[10px] line-clamp-2 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {req.description}
                    </p>
                  </div>

                  <div className={`flex justify-between items-center text-[10px] border-t pt-1.5 mt-0.5 ${isSelected ? 'border-gold-700/20' : 'border-slate-200/40'}`}>
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-700 inline-block"></span>
                      {req.category}
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${isSelected ? 'text-gold-500' : 'text-[#C89B3C]'}`}>
                      ★ {req.priorityScore}% Priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
