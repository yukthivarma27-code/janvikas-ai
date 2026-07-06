import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HOTSPOTS, CATEGORY_COLORS } from '../mockData';
import { Category } from '../types';
import { AlertCircle, Flame, Filter, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface HotspotMapProps {
  onConstituencySelect?: (constituency: string) => void;
  selectedConstituency?: string;
}

export default function HotspotMap({ onConstituencySelect, selectedConstituency }: HotspotMapProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Active' | 'Normal'>('All');
  const [activeHotspot, setActiveHotspot] = useState<typeof HOTSPOTS[0] | null>(HOTSPOTS[1]); // Default to Varanasi
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const filteredHotspots = HOTSPOTS.filter(h => {
    if (filterStatus === 'All') return true;
    return h.status === filterStatus;
  });

  return (
    <div className="w-full bg-gradient-to-b from-[#0F2D52] to-[#081B33] text-[#FAF6E8] p-5 rounded-2xl border-2 border-gold-700 shadow-xl relative overflow-hidden font-serif" id="hotspot-map-module">
      {/* Background Tech Hex Mesh Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#C89B3C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      {/* Map Control Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b border-gold-700/20 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <h3 className="font-bold text-base text-slate-100">National Priority Hotspot GIS</h3>
          </div>
          <p className="text-xs text-slate-400">Spatial telemetry of developmental gaps & citizen mandates</p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-navy-950/60 p-1 rounded-lg border border-gold-700/20">
          <Filter className="w-3 h-3 text-gold-700 mx-1.5" />
          {(['All', 'Critical', 'Active', 'Normal'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                filterStatus === status 
                  ? 'bg-[#FAF6E8] text-navy-900 border border-gold-700/30' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
        
        {/* The Map Canvas Pane */}
        <div className="lg:col-span-2 bg-[#081B33] rounded-xl border border-gold-700/20 h-[280px] md:h-[350px] relative overflow-hidden flex items-center justify-center">
          
          {/* Compass Rose */}
          <div className="absolute top-3 right-3 flex flex-col items-center gap-1 opacity-60 text-gold-600 text-[9px] font-mono">
            <Compass className="w-6 h-6 text-gold-700 animate-spin-slow" />
            <span>N 22.35' / E 78.96'</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-navy-950 border border-gold-700/20 rounded-md p-1">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))} 
              className="p-1 hover:bg-navy-900 rounded text-gold-700 hover:text-white cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 15, 70))} 
              className="p-1 hover:bg-navy-900 rounded text-gold-700 hover:text-white cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulated Map Terrain Outline with Grid Graticules */}
          <svg 
            viewBox="0 0 500 350" 
            className="w-full h-full transition-transform duration-500 ease-out select-none"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Latitude / Longitude lines */}
            <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="5,10" className="opacity-40">
              <line x1="50" y1="0" x2="50" y2="350" />
              <line x1="150" y1="0" x2="150" y2="350" />
              <line x1="250" y1="0" x2="250" y2="350" />
              <line x1="350" y1="0" x2="350" y2="350" />
              <line x1="450" y1="0" x2="450" y2="350" />
              
              <line x1="0" y1="70" x2="500" y2="70" />
              <line x1="0" y1="140" x2="500" y2="140" />
              <line x1="0" y1="210" x2="500" y2="210" />
              <line x1="0" y1="280" x2="500" y2="280" />
            </g>

            {/* Abstract Indian Peninsular Map Path for premium UI background */}
            <path 
              d="M 120 40 L 190 20 L 260 25 L 340 45 L 380 90 L 360 140 L 410 180 L 370 230 L 290 290 L 220 330 L 210 280 L 160 230 L 120 180 L 80 130 L 90 80 Z" 
              fill="#0F2D52" 
              stroke="#C89B3C" 
              strokeWidth="1.5" 
              className="opacity-25" 
            />

            {/* Inter-state highway link lines */}
            <path 
              d="M 120 180 Q 210 280 290 290 Q 360 140 260 25" 
              fill="none" 
              stroke="#102b4d" 
              strokeWidth="2" 
              strokeDasharray="4,4" 
              className="opacity-50"
            />

            {/* Map Markers */}
            {filteredHotspots.map((hotspot, idx) => {
              let x = 200;
              let y = 150;
              
              if (hotspot.constituency === 'Varanasi') { x = 250; y = 100; }
              else if (hotspot.constituency === 'Guntur') { x = 230; y = 240; }
              else if (hotspot.constituency === 'Bengaluru South') { x = 180; y = 280; }
              else if (hotspot.constituency === 'Hyderabad') { x = 190; y = 200; }
              else if (hotspot.constituency === 'Pune') { x = 140; y = 180; }
              else if (hotspot.constituency === 'Howrah') { x = 370; y = 130; }
              else if (hotspot.constituency === 'Coimbatore') { x = 160; y = 310; }
              else if (hotspot.constituency === 'Lucknow') { x = 260; y = 70; }

              const isSelected = activeHotspot?.constituency === hotspot.constituency || selectedConstituency === hotspot.constituency;
              const markerColor = hotspot.status === 'Critical' ? '#CD1A30' : hotspot.status === 'Active' ? '#C89B3C' : '#0E7C66';

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveHotspot(hotspot);
                    if (onConstituencySelect) onConstituencySelect(hotspot.constituency);
                  }}
                >
                  {/* Glowing pulse aura */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? "14" : "7"} 
                    fill={markerColor} 
                    className={`opacity-20 ${hotspot.status === 'Critical' ? 'animate-pulse' : ''}`} 
                  />
                  {hotspot.status === 'Critical' && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="22" 
                      fill="none" 
                      stroke={markerColor} 
                      strokeWidth="1" 
                      className="animate-ping opacity-45" 
                      style={{ animationDuration: '3s' }}
                    />
                  )}
                  {/* Central marker pin */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? "6" : "4.5"} 
                    fill={markerColor} 
                    stroke="#051426" 
                    strokeWidth="1.5"
                    className="transition-all duration-300" 
                  />

                  {/* Tiny Label */}
                  <text 
                    x={x} 
                    y={y - 10} 
                    textAnchor="middle" 
                    fill={isSelected ? '#C89B3C' : '#cbd5e1'} 
                    fontSize="8" 
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="tracking-wide font-bold font-serif"
                  >
                    {hotspot.constituency}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hotspot Telemetry Details Panel */}
        <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-xl border border-gold-700/20 flex flex-col justify-between text-[#FAF6E8]">
          <div>
            <h4 className="text-xs font-mono text-gold-600 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-gold-700/15 pb-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              HOTSPOT ANALYSIS TRAY
            </h4>

            {activeHotspot ? (
              <div className="space-y-3.5" id="telemetry-box">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Constituency</p>
                  <p className="text-lg font-bold text-[#FAF6E8] flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gold-700" />
                    {activeHotspot.constituency}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Demand Volume</p>
                    <p className="text-base font-bold text-slate-100">{activeHotspot.count} requests</p>
                  </div>
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Severe Status</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded ${
                      activeHotspot.status === 'Critical' 
                        ? 'bg-red-950/40 text-red-300 border border-red-800' 
                        : activeHotspot.status === 'Active' 
                        ? 'bg-amber-950/40 text-[#C89B3C] border border-[#C89B3C]/50' 
                        : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                    }`}>
                      {activeHotspot.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Primary Demand Gaps</p>
                  <p className="text-xs text-gold-100 bg-[#0F2D52]/60 p-2.5 rounded-lg border border-gold-700/20 font-medium font-serif leading-relaxed">
                    Heavy request concentration detected in <span className="text-gold-700 font-bold">{activeHotspot.primaryCategory}</span> infrastructures. AI predicts immediate intervention reduces local voter dissatisfaction index by <span className="text-[#0E7C66] font-bold">18-24%</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-serif">
                Select any constituency pin on the GIS map to view localized priority analytics.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gold-700/10 text-[10px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-gold-700 shrink-0" />
            <span>AI recommends allocating MPLAD Q1 grants directly to Critical status areas first.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
