import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AIRecommendation } from '../types';
import { Sparkles, IndianRupee, ShieldCheck, Check, Landmark, Calendar, Info, MapPin } from 'lucide-react';

export default function AIRecommendations() {
  // Track which recommendations have been officially "sanctioned" by the MP
  const [sanctionedList, setSanctionedList] = useState<string[]>([]);
  const [totalFundLimit] = useState(500.0); // 5 Crore = 500 Lakhs
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecommendations(data);
          // Set a default sanctioned if there's any for UI weight
          if (data.length > 2) {
            setSanctionedList([data[2].id]);
          }
        }
      })
      .catch(err => console.error('Error fetching recommendations:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSanctionToggle = (id: string) => {
    if (sanctionedList.includes(id)) {
      setSanctionedList(prev => prev.filter(item => item !== id));
    } else {
      setSanctionedList(prev => [...prev, id]);
    }
  };

  // Calculate allocated sum based on recommendation costs
  const allocatedLakhs = recommendations.reduce((acc, rec) => {
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
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white card-gov p-5 md:p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-center pr-16">
                  <div className="h-5 w-28 bg-slate-200 rounded"></div>
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-3.5 w-1/2 bg-slate-200 rounded"></div>
                <div className="bg-gold-50/10 p-3.5 rounded-xl border border-gold-700/5 space-y-2">
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                </div>
                <div className="h-3.5 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </>
        ) : recommendations.length === 0 ? (
          <div className="col-span-2 bg-white card-gov p-10 text-center text-slate-500 font-serif border border-gold-700/20">
            No dynamic recommendations available. Please submit more citizen requests first so the AI model can cluster them!
          </div>
        ) : (
          recommendations.map((rec) => {
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
                    {rec.verifiedGaps && rec.verifiedGaps.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.verifiedGaps.map(gap => (
                          <span key={gap} className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-mono font-bold">
                            {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Impact details */}
                  <div className="bg-gold-50/20 p-3.5 rounded-xl border border-gold-700/15 space-y-2 text-xs">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Estimated Impact</p>
                      <p className="text-slate-700 leading-relaxed font-bold mt-0.5">{rec.estimatedImpact}</p>
                      {rec.baselineSummary && (
                        <p className="text-[10px] text-navy-800 bg-white border border-gold-700/10 p-1.5 rounded mt-1.5 font-serif">
                          <strong>Data-Backed Validation:</strong> {rec.baselineSummary}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-gold-700/15 pt-2 mt-2 text-center sm:text-left">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Sanction Cost</p>
                        <p className="font-bold text-navy-900 font-mono text-xs mt-0.5">₹{rec.estimatedCostLakhs} L</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Grouped Demands</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{rec.relatedRequestCount} requests</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Population Served</p>
                        <p className="font-bold text-emerald-800 text-xs mt-0.5">{(rec.totalPopulationServed || 1200).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Algorithmic justification */}
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
          })
        )}
      </div>
    </div>
  );
}
