import React, { useState } from 'react';
import { motion } from 'motion/react';
import hotspotsData from '../../data/hotspots.json';
import { AlertCircle, Flame, Filter, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface HotspotDetails {
  focusCategories: string[];
  populationServed: number;
}

interface Hotspot {
  constituency: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  category: string;
  priorityScore: number;
  priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  count: number;
  recommendedProject: string;
  details?: HotspotDetails;
}

const HOTSPOTS = hotspotsData as Hotspot[];

interface HotspotMapProps {
  onConstituencySelect?: (constituency: string) => void;
  selectedConstituency?: string;
}

export default function HotspotMap({ onConstituencySelect, selectedConstituency }: HotspotMapProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Active' | 'Normal'>('All');
  // Default to Visakhapatnam if found, otherwise first hotspot
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(
    HOTSPOTS.find(h => h.constituency === 'Visakhapatnam') || HOTSPOTS[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const filteredHotspots = HOTSPOTS.filter(h => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Critical') return h.priorityLevel === 'Critical';
    if (filterStatus === 'Active') return h.priorityLevel === 'High' || h.priorityLevel === 'Medium';
    if (filterStatus === 'Normal') return h.priorityLevel === 'Low';
    return true;
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

          {/* Map Terrain Outline with Grid Graticules */}
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

            {/* Detailed Realistic India Map Outline Path */}
            <path 
              d="M 235 15 L 245 15 L 255 20 L 260 25 L 260 35 L 250 45 L 255 55 L 265 65 L 270 80 L 290 95 L 305 95 L 320 110 L 300 120 L 320 135 L 350 140 L 355 130 L 360 130 L 365 135 L 375 135 L 380 130 L 390 135 L 400 125 L 415 115 L 430 120 L 440 125 L 435 140 L 420 145 L 425 160 L 415 170 L 410 165 L 395 160 L 390 175 L 380 170 L 375 185 L 365 195 L 350 210 L 345 225 L 330 240 L 320 255 L 300 280 L 295 295 L 270 325 L 255 335 L 245 340 L 238 330 L 242 320 L 230 300 L 210 280 L 195 250 L 180 220 L 170 195 L 160 180 L 155 165 L 145 160 L 135 165 L 125 155 L 115 150 L 105 155 L 85 155 L 80 145 L 90 135 L 105 130 L 120 135 L 125 120 L 120 110 L 130 95 L 140 80 L 165 70 L 185 55 L 205 45 L 220 35 L 225 25 Z" 
              fill="#0F2D52" 
              stroke="#C89B3C" 
              strokeWidth="1.2" 
              className="opacity-25" 
            />

            {/* Inter-state highway link lines */}
            <path 
              d="M 208 198 L 248 275 L 272 274 L 258 222 L 248 92 L 300 125 L 350 152" 
              fill="none" 
              stroke="#102b4d" 
              strokeWidth="1" 
              strokeDasharray="3,5" 
              className="opacity-55"
            />

            {/* Map Markers */}
            {filteredHotspots.map((hotspot, idx) => {
              const x = hotspot.x;
              const y = hotspot.y;

              const isSelected = activeHotspot?.constituency === hotspot.constituency || selectedConstituency === hotspot.constituency;
              
              // Marker colors: Red -> Critical, Orange -> High, Yellow -> Medium, Green -> Low
              const markerColor = 
                hotspot.priorityLevel === 'Critical' ? '#CD1A30' : // Red
                hotspot.priorityLevel === 'High' ? '#EA580C' :     // Orange
                hotspot.priorityLevel === 'Medium' ? '#CA8A04' :   // Yellow
                '#16A34A';                                         // Green (Low)

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
                    r={isSelected ? 12 : 6} 
                    fill={markerColor} 
                    className={`opacity-20 ${hotspot.priorityLevel === 'Critical' ? 'animate-pulse' : ''}`} 
                  />
                  {hotspot.priorityLevel === 'Critical' && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="18" 
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
                    r={isSelected ? 5.5 : 4} 
                    fill={markerColor} 
                    stroke="#051426" 
                    strokeWidth="1.5"
                    className="transition-all duration-300" 
                  />

                  {/* Tiny Label (only visible if selected or on hover) */}
                  <text 
                    x={x} 
                    y={y - 8} 
                    textAnchor="middle" 
                    fill={isSelected ? '#C89B3C' : '#cbd5e1'} 
                    fontSize="7" 
                    fontWeight={isSelected ? "bold" : "normal"}
                    className={`tracking-wide font-serif transition-opacity duration-200 ${
                      isSelected ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'
                    }`}
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
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Constituency & Location</p>
                  <p className="text-base font-bold text-[#FAF6E8] flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gold-700 shrink-0" />
                    {activeHotspot.constituency}
                  </p>
                  <p className="text-[10px] text-slate-300 italic mt-0.5">
                    District: {activeHotspot.district} | State: {activeHotspot.state}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Coords: {activeHotspot.latitude.toFixed(2)}°N, {activeHotspot.longitude.toFixed(2)}°E
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Demand Volume</p>
                    <p className="text-sm font-bold text-slate-100">{activeHotspot.count} requests</p>
                  </div>
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Priority Score</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-mono font-bold text-[#C89B3C]">{activeHotspot.priorityScore}%</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        activeHotspot.priorityLevel === 'Critical' 
                          ? 'bg-red-950/40 text-red-300 border border-red-800' 
                          : activeHotspot.priorityLevel === 'High' 
                          ? 'bg-amber-950/40 text-[#C89B3C] border border-[#C89B3C]/50' 
                          : activeHotspot.priorityLevel === 'Medium'
                          ? 'bg-yellow-950/40 text-yellow-300 border border-yellow-800'
                          : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                      }`}>
                        {activeHotspot.priorityLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visakhapatnam primary demo details */}
                {activeHotspot.constituency === 'Visakhapatnam' && activeHotspot.details && (
                  <div className="bg-gold-950/20 p-2.5 rounded-lg border border-gold-700/30 space-y-1.5 text-xs">
                    <p className="text-[9px] text-gold-600 font-bold uppercase tracking-wider">Demo Target Focus Areas</p>
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {activeHotspot.details.focusCategories.map((c, i) => (
                        <span key={i} className="bg-[#0F2D52] text-[#FAF6E8] px-2 py-0.5 rounded border border-gold-700/20 font-bold">{c}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-200 mt-1 font-bold">
                      👥 Population Served: {activeHotspot.details.populationServed.toLocaleString()} citizens
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Primary Demand Gaps</p>
                  <p className="text-xs text-gold-100 bg-[#0F2D52]/60 p-2.5 rounded-lg border border-gold-700/20 font-medium font-serif leading-relaxed">
                    Heavy request concentration detected in <span className="text-gold-700 font-bold">{activeHotspot.category}</span> infrastructures. AI predicts immediate intervention reduces local voter dissatisfaction index by <span className="text-[#0E7C66] font-bold">18-24%</span>.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Recommended Development Project</p>
                  <p className="text-xs text-slate-200 bg-navy-950/60 p-2.5 rounded-lg border border-gold-700/15 font-bold italic leading-relaxed">
                    "{activeHotspot.recommendedProject}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-550 text-xs font-serif">
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
