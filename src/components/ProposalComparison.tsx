import React, { useState, useEffect } from 'react';
import { CitizenRequest } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Scale, Award, Info, Loader2 } from 'lucide-react';

interface ProposalComparisonProps {
  requests: CitizenRequest[];
}

interface Metric {
  label: string;
  valueA: string | number;
  valueB: string | number;
  better: 'A' | 'B' | 'Equal';
}

interface ComparisonData {
  id: string;
  titleA: string;
  titleB: string;
  category: string;
  constituency: string;
  metrics: Metric[];
  aiRecommendation: string;
  finalChoice: 'A' | 'B';
}

export default function ProposalComparison({ requests }: ProposalComparisonProps) {
  const [selectedIdA, setSelectedIdA] = useState('');
  const [selectedIdB, setSelectedIdB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-select first two requests on load
  useEffect(() => {
    if (requests.length >= 2) {
      const idA = requests[0].id;
      const idB = requests[1].id;
      setSelectedIdA(idA);
      setSelectedIdB(idB);
      triggerComparison(idA, idB);
    }
  }, [requests]);

  const triggerComparison = (idA: string, idB: string) => {
    if (!idA || !idB) return;
    if (idA === idB) {
      setError('Please select two different proposals to compare.');
      return;
    }
    setError('');
    setIsLoading(true);

    fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idA, idB })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch comparison');
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setComparisonResult(data);
        } else {
          setError(data.error || 'Failed to compare proposals');
        }
      })
      .catch(err => {
        console.error('Error generating comparison:', err);
        setError('Connection error: Make sure the backend server is running and GEMINI_API_KEY is configured.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleRunComparison = (e: React.FormEvent) => {
    e.preventDefault();
    triggerComparison(selectedIdA, selectedIdB);
  };

  if (requests.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center font-serif">
        <div className="bg-white card-gov p-10 border border-gold-700/20 max-w-xl mx-auto space-y-4">
          <Scale className="w-12 h-12 text-gold-700 mx-auto" />
          <h3 className="text-xl font-bold text-navy-900">Insufficient Data</h3>
          <p className="text-sm text-slate-550">
            You need at least 2 citizen requests in the database to run dynamic comparisons. Please file more requests first!
          </p>
        </div>
      </div>
    );
  }

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
      </div>

      {/* Selectors Bar */}
      <div className="bg-white card-gov p-4 border border-gold-700/20 shadow-2xs">
        <form onSubmit={handleRunComparison} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Proposal A</label>
              <select
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(e.target.value)}
                className="w-full bg-white input-gov px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {requests.map(req => (
                  <option key={req.id} value={req.id}>
                    [{req.id}] {req.locality} - {req.category} (Score: {req.priorityScore})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Proposal B</label>
              <select
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(e.target.value)}
                className="w-full bg-white input-gov px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {requests.map(req => (
                  <option key={req.id} value={req.id}>
                    [{req.id}] {req.locality} - {req.category} (Score: {req.priorityScore})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || selectedIdA === selectedIdB}
            className="w-full md:w-auto btn-gov-primary px-8 py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <span>Generate AI Comparison</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-700" />
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="text-xs text-rose-800 font-bold mt-3 bg-rose-50 p-2 rounded border border-rose-200">{error}</p>
        )}
      </div>

      {/* Main comparative workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp">
        
        {/* Comparison Side-by-Side Table Grid */}
        <div className="lg:col-span-2 bg-white card-gov p-5 md:p-6.5 space-y-5">
          {isLoading ? (
            <div className="py-12 space-y-6 animate-pulse">
              <div className="h-8 w-1/2 bg-slate-200 rounded mx-auto"></div>
              <div className="space-y-3.5 pt-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="grid grid-cols-3 gap-4 items-center">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-5 bg-slate-200 rounded-full"></div>
                    <div className="h-5 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : comparisonResult ? (
            <>
              {/* Header of the Case study */}
              <div className="text-center pb-4 border-b border-gold-700/15">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">CONSTITUENCY: {comparisonResult.constituency}</span>
                <div className="flex flex-col md:flex-row items-center justify-center gap-3.5 mt-2">
                  <span className="text-sm font-bold text-navy-900 bg-gold-50 border border-gold-700/30 px-5 py-2.5 rounded-full block max-w-xs truncate shadow-2xs">
                    {comparisonResult.titleA}
                  </span>
                  <span className="text-xs font-bold text-slate-400 italic">vs</span>
                  <span className="text-sm font-bold text-navy-900 bg-gold-50 border border-gold-700/30 px-5 py-2.5 rounded-full block max-w-xs truncate shadow-2xs">
                    {comparisonResult.titleB}
                  </span>
                </div>
              </div>

              {/* Comparison Matrix Rows */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">Metrics Matrix</h4>
                
                <div className="divide-y divide-gold-700/10 text-xs">
                  {comparisonResult.metrics.map((metric, index) => (
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
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium">
              Select two proposals above and click "Generate AI Comparison" to run evaluation.
            </div>
          )}
        </div>

        {/* AI Final Decision Panel Card */}
        <div className="bg-gradient-to-b from-[#0F2D52] to-[#081B33] text-[#FAF6E8] rounded-2xl p-5.5 md:p-7 border-2 border-gold-700 shadow-xl flex flex-col justify-between relative overflow-hidden font-serif" id="ai-decision-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          {isLoading ? (
            <div className="space-y-5 animate-pulse py-4">
              <div className="h-5 w-2/3 bg-slate-700 rounded"></div>
              <div className="h-20 bg-slate-700/50 rounded-xl"></div>
              <div className="h-5 w-1/2 bg-slate-700 rounded"></div>
              <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
            </div>
          ) : comparisonResult ? (
            <>
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
                    {comparisonResult.aiRecommendation}
                  </p>
                </div>

                {/* Verdict Bullet info */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project Trade-off Breakdown</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-700 mt-0.5 shrink-0" />
                      <span>Recommended project: **Project {comparisonResult.finalChoice}**.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gold-700/10 flex items-center justify-between gap-2.5">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-gold-700" /> Model: Gemini-2.5-Flash
                </span>
                
                {/* Sanction final selection trigger */}
                <span className="bg-[#FAF6E8] text-[#0F2D52] text-[10px] font-bold px-3.5 py-1.5 rounded-md border border-gold-700/30 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-700" /> Selected: Project {comparisonResult.finalChoice}
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center py-12 text-slate-450 text-xs italic">
              Awaiting selection and AI analysis...
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
