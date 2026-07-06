import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AI_RECOMMENDATIONS } from '../mockData';
import { Sparkles, IndianRupee, ShieldCheck, Check, Landmark, Calendar, Info, MapPin } from 'lucide-react';

export default function AIRecommendations() {
  // Track which recommendations have been officially "sanctioned" by the MP
  const [sanctionedList, setSanctionedList] = useState<string[]>(['REC-003']); // Default 1 already approved for visual density
  const [totalFundLimit] = useState(500.0); // 5 Crore = 500 Lakhs

  const handleSanctionToggle = (id: string) => {
    if (sanctionedList.includes(id)) {
      setSanctionedList(prev => prev.filter(item => item !== id));
    } else {
      setSanctionedList(prev => [...prev, id]);
    }
  };

  // Calculate allocated sum based on recommendation costs
  const allocatedLakhs = AI_RECOMMENDATIONS.reduce((acc, rec) => {
    if (sanctionedList.includes(rec.id)) {
      return acc + rec.estimatedCostLakhs;
    }
    return acc;
  }, 0);

  const allocationPercent = (allocatedLakhs / totalFundLimit) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-serif animate-fadeIn" id="ai-recommendations-panel">
      
      {/* Top Heading Banner */}
      <div className="bg-white card-gov p-6.5 relative overflow-hidden shadow-sm hover:border-gold-700/60 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-gold-100 rounded-full blur-2xl opacity-15 pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-1.5 text-[#C89B3C]">
          <Sparkles className="w-5 h-5 fill-[#C89B3C] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">AI Prioritizer Engine v2.0</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight">AI-Prioritized Development Recommendations</h2>
        <p className="text-xs md:text-sm text-slate-700 max-w-2xl mt-1.5 leading-relaxed font-serif">
          The neural ranking model processes spatial coordinates, citizen support indexes, and safety vulnerability factors to recommend immediate MPLADS budget allocations.
        </p>
      </div>

      {/* MPLADS Budget Allocator Tracker Indicator */}
      <div className="bg-white card-gov p-5.5 space-y-4 hover:border-gold-700/60 hover:-translate-y-0.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOK SABHA MPLAD SCHEME ALLOCATOR</span>
            <h3 className="text-base font-bold text-navy-900 mt-0.5 flex items-center gap-1.5">
              <Landmark className="w-4.5 h-4.5 text-gold-700" />
              Annual Constituency Fund Status (MPLADS)
            </h3>
          </div>
          <div className="font-mono text-xs text-navy-900 bg-[#FAF6E8] border border-gold-700/20 rounded-xl p-3 flex items-center gap-4">
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">TOTAL BANK LIMIT</p>
              <p className="font-bold text-navy-900">₹5.0 Crore (500 L)</p>
            </div>
            <div className="border-l border-gold-700/20 pl-4">
              <p className="text-[8px] text-emerald-800 uppercase font-bold">CURRENT SANCTIONED</p>
              <p className="font-bold text-emerald-800">₹{allocatedLakhs.toFixed(1)} Lakhs</p>
            </div>
          </div>
        </div>

        {/* Budget Allocation Progress Bar */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-gold-50 border border-gold-700/20 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${allocationPercent}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-full"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
            <span>0% (Allocated)</span>
            <span>{allocationPercent.toFixed(1)}% of ₹5.0 Cr Limit Utilized</span>
            <span>100% Limit</span>
          </div>
        </div>
      </div>

      {/* Recommendation Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp" id="ai-recs-cards-list">
        {AI_RECOMMENDATIONS.map((rec) => {
          const isSanctioned = sanctionedList.includes(rec.id);

          return (
            <div 
              key={rec.id} 
              className={`bg-white card-gov p-5 md:p-6 flex flex-col justify-between relative overflow-hidden ${
                isSanctioned 
                  ? 'border-emerald-500! ring-2 ring-emerald-500/10 scale-[1.01]' 
                  : 'hover:-translate-y-1'
              }`}
            >
              {/* Sanctioned Ribbon badge */}
              {isSanctioned && (
                <div className="absolute top-0 right-0 bg-emerald-750 text-white text-[9px] font-bold px-3.5 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sanctioned
                </div>
              )}

              <div className="space-y-4">
                {/* Score & Category info */}
                <div className="flex justify-between items-center pr-16">
                  <span className="text-[10px] font-mono font-bold bg-gold-50 text-gold-950 px-2 py-0.5 rounded border border-gold-700/20">
                    Priority Score: {rec.priorityScore}%
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-550">
                    <MapPin className="w-3.5 h-3.5 text-gold-700" />
                    <span>{rec.constituency}</span>
                  </div>
                </div>

                {/* Recommendation Title */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-navy-900 leading-tight">
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                    <span>Category: <strong className="text-navy-900">{rec.category}</strong></span>
                    <span>•</span>
                    <span>Demand: <strong className="text-[#C89B3C]">{rec.demandLevel}</strong></span>
                  </div>
                </div>

                {/* Impact details */}
                <div className="bg-gold-50/20 p-3.5 rounded-xl border border-gold-700/15 space-y-2 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Estimated Impact</p>
                    <p className="text-slate-700 leading-relaxed font-bold mt-0.5">{rec.estimatedImpact}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gold-700/15 pt-2 mt-2">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Sanction Cost</p>
                      <p className="font-bold text-navy-900 font-mono text-sm mt-0.5">₹{rec.estimatedCostLakhs} Lakhs</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Related Submissions</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{rec.relatedRequestCount} requests grouped</p>
                    </div>
                  </div>
                </div>

                {/* Al Algorithmic justification */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Info className="w-3 h-3 text-gold-700" />
                    Algorithmic Justification
                  </p>
                  <p className="text-xs text-slate-600 leading-normal font-serif">
                    {rec.reason}
                  </p>
                </div>

                {/* Suggested Action */}
                <div className="bg-[#FAF6E8]/30 p-3.5 rounded-xl border border-gold-700/15 text-xs">
                  <p className="text-[9px] font-bold text-gold-950 uppercase tracking-wider">Suggested MP Action Motion</p>
                  <p className="text-navy-950 leading-relaxed mt-0.5 font-bold font-serif">
                    {rec.suggestedMPAction}
                  </p>
                </div>
              </div>

              {/* Sanction button trigger */}
              <div className="mt-5 pt-4 border-t border-gold-700/15 flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target cycle: {rec.timelineMonths} months
                </span>

                <button
                  onClick={() => handleSanctionToggle(rec.id)}
                  className={`px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all duration-200 ${
                    isSanctioned 
                      ? 'bg-emerald-100! hover:bg-emerald-200! text-emerald-800! border border-emerald-300! rounded-full' 
                      : 'btn-gov-primary'
                  }`}
                  id={`btn-sanction-${rec.id}`}
                >
                  {isSanctioned ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Sanctioned Active
                    </>
                  ) : (
                    <>
                      <IndianRupee className="w-3.5 h-3.5" />
                      Sanction Funds
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
