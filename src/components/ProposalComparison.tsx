import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PROPOSAL_COMPARISONS } from '../mockData';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Scale, Award, Info } from 'lucide-react';

export default function ProposalComparison() {
  const [activeCompIndex, setActiveCompIndex] = useState(0);
  const activeComp = PROPOSAL_COMPARISONS[activeCompIndex] || PROPOSAL_COMPARISONS[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 font-serif animate-fadeIn" id="proposal-comparison-panel">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C89B3C] uppercase">
            <Scale className="w-4 h-4 text-gold-700" />
            <span>MPLADS Feasibility Optimizer</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight mt-1 font-serif">Proposal Comparison Hub</h2>
          <p className="text-xs text-slate-500">Multi-criteria algorithmic trade-offs of competing developmental proposals</p>
        </div>

        {/* Tab switcher for comps */}
        <div className="flex bg-[#FAF6E8] p-1 rounded-full border border-gold-700/25">
          {PROPOSAL_COMPARISONS.map((comp, idx) => (
            <button
              key={comp.id}
              onClick={() => setActiveCompIndex(idx)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCompIndex === idx 
                  ? 'bg-navy-900 text-[#FAF6E8] shadow-xs border border-gold-700/30' 
                  : 'text-navy-900/70 hover:text-navy-900'
              }`}
              id={`btn-comp-tab-${idx}`}
            >
              Case {idx + 1}: {comp.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main comparative workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp">
        
        {/* Comparison Side-by-Side Table Grid */}
        <div className="lg:col-span-2 bg-white card-gov p-5 md:p-6.5 space-y-5">
          
          {/* Header of the Case study */}
          <div className="text-center pb-4 border-b border-gold-700/15">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">CONSTITUENCY: {activeComp.constituency}</span>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3.5 mt-2">
              <span className="text-sm font-bold text-navy-900 bg-gold-50 border border-gold-700/30 px-5 py-2.5 rounded-full block max-w-xs truncate shadow-2xs">
                {activeComp.titleA}
              </span>
              <span className="text-xs font-bold text-slate-400 italic">vs</span>
              <span className="text-sm font-bold text-navy-900 bg-gold-50 border border-gold-700/30 px-5 py-2.5 rounded-full block max-w-xs truncate shadow-2xs">
                {activeComp.titleB}
              </span>
            </div>
          </div>

          {/* Comparison Matrix Rows */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">Metrics Matrix</h4>
            
            <div className="divide-y divide-gold-700/10 text-xs">
              {activeComp.metrics.map((metric, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-3 py-3.5 items-center rounded-lg px-2.5 transition-colors ${
                    index % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-[#FAF6E8]/15'
                  } hover:bg-gold-50/40`}
                >
                  {/* Metric Label */}
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wide pr-2">
                    {metric.label}
                  </div>

                  {/* Option A value */}
                  <div className="px-2">
                    <span className={`inline-block font-bold rounded-full px-3 py-1 ${
                      metric.better === 'A' 
                        ? 'bg-[#E6F5F2] text-[#0E7C66] border border-[#0E7C66]/20' 
                        : 'text-slate-600'
                    }`}>
                      {metric.valueA}
                    </span>
                  </div>

                  {/* Option B value */}
                  <div className="px-2">
                    <span className={`inline-block font-bold rounded-full px-3 py-1 ${
                      metric.better === 'B' 
                        ? 'bg-[#E6F5F2] text-[#0E7C66] border border-[#0E7C66]/20' 
                        : 'text-slate-600'
                    }`}>
                      {metric.valueB}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Final Decision Panel Card */}
        <div className="bg-gradient-to-b from-[#0F2D52] to-[#081B33] text-[#FAF6E8] rounded-2xl p-5.5 md:p-7 border-2 border-gold-700 shadow-xl flex flex-col justify-between relative overflow-hidden font-serif" id="ai-decision-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6E8] flex items-center justify-center text-navy-900 border border-gold-700/20">
                <Sparkles className="w-4 h-4 text-gold-700 fill-gold-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono text-gold-600">DECISION OPTIMIZATION</h4>
                <p className="text-sm font-bold text-[#FAF6E8]">AI Final Sanction Verdict</p>
              </div>
            </div>

            {/* Rec Text Box */}
            <div className="bg-navy-950/60 p-4.5 rounded-xl border border-gold-700/20 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-700 fill-gold-700/10 shrink-0" />
                <span className="text-[11px] font-bold text-gold-600 uppercase tracking-widest font-mono">RELIABILITY ADVISORY</span>
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-medium">
                {activeComp.aiRecommendation}
              </p>
            </div>

            {/* Verdict Bullet info */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project Trade-off Breakdown</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-700 mt-0.5 shrink-0" />
                  <span>Cost efficiency rating is higher for **Project {activeComp.finalChoice}**.</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-700 mt-0.5 shrink-0" />
                  <span>Public density upvotes strongly favour **Project {activeComp.finalChoice}**.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gold-700/10 flex items-center justify-between gap-2.5">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gold-700" /> Model: Gemini-3.5-Civic
            </span>
            
            {/* Sanction final selection trigger */}
            <span className="bg-[#FAF6E8] text-[#0F2D52] text-[10px] font-bold px-3.5 py-1.5 rounded-md border border-gold-700/30 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-700" /> Selected: Project {activeComp.finalChoice}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
