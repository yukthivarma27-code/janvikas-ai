import React, { useState } from 'react';
import { motion } from 'motion/react';
import hotspotsData from '../../data/hotspots.json';
import mapBg from '../assets/india_dark_satellite.png';
import { 
  AlertCircle, 
  Flame, 
  Filter, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Users, 
  BookOpen, 
  Warehouse, 
  Map, 
  School, 
  Hospital, 
  Droplet, 
  Waypoints, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

interface HotspotDetails {
  focusCategories: string[];
  populationServed: number;
}

interface HotspotMetrics {
  population: string;
  literacyRate: string;
  villagesWards: string;
  area: string;
  schools: string;
  healthcareFacilities: string;
  waterCoverage: string;
  roadConnectivity: string;
}

interface HotspotIssue {
  category: string;
  percent: number;
}

interface HotspotAction {
  title: string;
  beneficiaries: string;
  budget: string;
  details: string;
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
  demandVolumeChange: string;
  primaryGapsText: string;
  metrics: HotspotMetrics;
  topIssues: HotspotIssue[];
  recommendedAction: HotspotAction;
  details?: HotspotDetails;
}

const HOTSPOTS = hotspotsData as Hotspot[];

interface HotspotMapProps {
  onConstituencySelect?: (constituency: string) => void;
  selectedConstituency?: string;
}

const getStateAbbr = (state: string) => {
  const map: Record<string, string> = {
    'Andhra Pradesh': 'AP',
    'Uttar Pradesh': 'UP',
    'Delhi': 'DL',
    'Maharashtra': 'MH',
    'Karnataka': 'KA',
    'Tamil Nadu': 'TN',
    'Telangana': 'TG',
    'West Bengal': 'WB',
    'Bihar': 'BR',
    'Jharkhand': 'JH',
    'Assam': 'AS',
    'Punjab': 'PB',
    'Haryana': 'HR',
    'Uttarakhand': 'UK',
    'Himachal Pradesh': 'HP',
    'Jammu & Kashmir': 'JK',
    'Meghalaya': 'ML',
    'Manipur': 'MN',
    'Mizoram': 'MZ',
    'Tripura': 'TR',
    'Sikkim': 'SK',
    'Arunachal Pradesh': 'AR',
    'Odisha': 'OD',
    'Madhya Pradesh': 'MP',
    'Gujarat': 'GJ',
    'Rajasthan': 'RJ',
    'Kerala': 'KL'
  };
  return map[state] || state;
};

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
        <div 
          className="lg:col-span-2 bg-[#081B33] rounded-xl border border-gold-700/20 h-[300px] md:h-[450px] relative overflow-hidden flex items-center justify-center shadow-inner"
          style={{
            backgroundImage: `url(${mapBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'luminosity'
          }}
        >
          {/* Compass Rose */}
          <div className="absolute top-3 right-3 flex flex-col items-center gap-1 opacity-60 text-gold-600 text-[9px] font-mono z-10">
            <Compass className="w-6 h-6 text-gold-700 animate-spin-slow" />
            <span>N 22.35' / E 78.96'</span>
          </div>

          {/* Priority Level Legend (Mockup top-left) */}
          <div className="absolute top-3 left-3 bg-navy-950/85 backdrop-blur-xs border border-gold-700/20 rounded-lg p-2.5 space-y-1.5 z-10 text-[9px]">
            <p className="font-bold text-gold-600 uppercase tracking-wider text-[8px] mb-0.5 font-sans">Priority Level</p>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#CD1A30]"></span> <span className="text-slate-200">Critical</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EA580C]"></span> <span className="text-slate-200">High</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#CA8A04]"></span> <span className="text-slate-200">Medium</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> <span className="text-slate-200">Low</span></div>
          </div>

          {/* Zoom Controls (Mockup bottom-left) */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1 bg-navy-950/85 backdrop-blur-xs border border-gold-700/20 rounded-md p-1 z-10">
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

          {/* Category Filter Indicators (Mockup bottom-left center) */}
          <div className="absolute bottom-3 left-14 flex items-center gap-2 bg-navy-950/85 backdrop-blur-xs p-2 rounded-lg border border-gold-700/20 z-10 text-[9px] font-mono leading-none">
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Roads</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Water</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Education</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Healthcare</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Sanitation</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Transport</span>
            <span className="flex items-center gap-1 text-slate-300"><span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> Digital</span>
          </div>

          {/* Map Overlay Popup Tooltip */}
          {activeHotspot && (
            <div 
              className="absolute bg-navy-950/90 border border-gold-700/35 rounded-lg p-2.5 text-[9px] space-y-1.5 shadow-lg pointer-events-none z-20 font-serif leading-tight animate-fadeIn"
              style={{
                left: `${(activeHotspot.x / 500) * 100}%`,
                top: `${(activeHotspot.y / 350) * 100}%`,
                transform: 'translate(10px, -50%)',
                width: '130px'
              }}
            >
              <p className="font-bold text-slate-100 leading-none">{activeHotspot.constituency}</p>
              <p className="text-slate-450 text-[8px]">{activeHotspot.state}</p>
              <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 text-slate-350">
                <span>Priority Score</span>
                <span className="font-bold font-mono text-[#C89B3C]">{activeHotspot.priorityScore}</span>
              </div>
              <div className="flex justify-between text-slate-350">
                <span>Requests</span>
                <span className="font-bold font-mono">{activeHotspot.count}</span>
              </div>
              <div className="flex justify-between text-slate-350">
                <span>Main Issue</span>
                <span className="font-bold text-gold-600">{activeHotspot.category}</span>
              </div>
              <div className="flex justify-between text-slate-350 items-center">
                <span>Level</span>
                <span className={`font-bold text-[8px] uppercase ${
                  activeHotspot.priorityLevel === 'Critical' ? 'text-[#CD1A30]' : 'text-[#EA580C]'
                }`}>{activeHotspot.priorityLevel}</span>
              </div>
            </div>
          )}

          {/* Map SVG overlay */}
          <svg 
            viewBox="0 0 500 350" 
            className="w-full h-full transition-transform duration-500 ease-out select-none"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Latitude / Longitude lines */}
            <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="5,10" className="opacity-20">
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
              fill="none" 
              stroke="#C89B3C" 
              strokeWidth="0.8" 
              className="opacity-40" 
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
                    r={isSelected ? 10 : 5.5} 
                    fill={markerColor} 
                    className={`opacity-25 ${hotspot.priorityLevel === 'Critical' ? 'animate-pulse' : ''}`} 
                  />
                  {hotspot.priorityLevel === 'Critical' && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="16" 
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
                    r={isSelected ? 5 : 3.5} 
                    fill={markerColor} 
                    stroke="#051426" 
                    strokeWidth="1.2"
                    className="transition-all duration-300" 
                  />

                  {/* Tiny Label (only visible on hover or if selected) */}
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

        {/* Hotspot Telemetry Details Panel (Tray Redesign) */}
        <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-xl border border-gold-700/20 flex flex-col justify-between text-[#FAF6E8] space-y-4">
          <div className="space-y-4">
            {/* Tray Title */}
            <h4 className="text-xs font-mono text-gold-600 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-gold-700/15 pb-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              HOTSPOT ANALYSIS TRAY
            </h4>

            {activeHotspot ? (
              <div className="space-y-4" id="telemetry-box">
                {/* Location Detail block */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Constituency</p>
                    <p className="text-base font-bold text-[#FAF6E8] flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gold-700 shrink-0" />
                      {activeHotspot.constituency} ({getStateAbbr(activeHotspot.state)})
                    </p>
                  </div>
                  <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Active
                  </span>
                </div>

                {/* Severity Indicators Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Demand Volume</p>
                    <p className="text-sm font-bold text-slate-100">{activeHotspot.count} requests</p>
                    <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      {activeHotspot.demandVolumeChange}
                    </p>
                  </div>
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Severe Status</p>
                    <span className="bg-red-950/40 text-red-300 border border-red-800 text-[8px] font-bold px-1.5 py-0.5 mt-0.5 rounded inline-block uppercase font-mono">
                      {activeHotspot.priorityLevel}
                    </span>
                    <p className="text-[9px] text-slate-300 font-bold mt-1">
                      Priority Score: <span className="text-gold-700 font-mono">{activeHotspot.priorityScore}/100</span>
                    </p>
                  </div>
                </div>

                {/* Primary Demand Gaps Explanation */}
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Primary Demand Gaps</p>
                  <p className="text-xs text-gold-100 bg-[#0F2D52]/60 p-2.5 rounded-lg border border-gold-700/20 font-medium font-serif leading-relaxed">
                    {activeHotspot.primaryGapsText}
                  </p>
                </div>

                {/* 8-Demographic Metrics Grid (Mockup 4x2 Grid) */}
                <div className="space-y-1.5">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Key Open Data Metrics</p>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-serif">
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Users className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Population</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.population}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Award className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Literacy</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.literacyRate}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Warehouse className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Wards/Vill</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.villagesWards}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Map className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Area</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.area}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <School className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Schools</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.schools}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Hospital className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Clinics</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.healthcareFacilities}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Droplet className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Water Cov</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.waterCoverage}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Waypoints className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Road Conn</p>
                      <p className="font-bold text-slate-100 font-mono">{activeHotspot.metrics.roadConnectivity}</p>
                    </div>
                  </div>
                </div>

                {/* Top Issues by Category Progress Bars */}
                <div className="space-y-2">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Top Issues by Category</p>
                  <div className="space-y-2">
                    {activeHotspot.topIssues.map((issue, idx) => (
                      <div key={idx} className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-slate-350 leading-none">
                          <span>{issue.category}</span>
                          <span className="font-bold font-mono">{issue.percent}%</span>
                        </div>
                        <div className="w-full bg-navy-950/60 h-1.5 rounded-full overflow-hidden border border-gold-700/10">
                          <div 
                            className="bg-gold-600 h-full rounded-full" 
                            style={{ width: `${issue.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Action Card (Mockup Blue Container) */}
                <div className="bg-[#0F2D52]/60 border border-gold-700/35 p-3 rounded-xl text-[10px] space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gold-200 rounded-full blur-2xl opacity-10 pointer-events-none"></div>
                  <div className="flex items-center gap-1.5 text-gold-600 font-bold uppercase tracking-wider font-sans text-[9px] border-b border-gold-700/15 pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-700 fill-gold-700/10 shrink-0" />
                    <span>Recommended Action</span>
                  </div>
                  <p className="font-bold text-slate-100 text-xs flex items-center gap-1 font-serif leading-tight">
                    <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
                    {activeHotspot.recommendedAction.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-gold-700/15 pt-1.5 mt-1">
                    <div>
                      <p className="text-slate-400">Est. Beneficiaries</p>
                      <p className="font-bold text-slate-200 font-mono text-xs">{activeHotspot.recommendedAction.beneficiaries}</p>
                    </div>
                    <div className="border-l border-gold-700/15 pl-2">
                      <p className="text-slate-400">Est. Budget</p>
                      <p className="font-bold text-[#C89B3C] font-mono text-xs">{activeHotspot.recommendedAction.budget}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-350 italic pt-1 leading-normal font-sans border-t border-gold-700/10">
                    💡 {activeHotspot.recommendedAction.details}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-550 text-xs font-serif">
                Select any constituency pin on the GIS map to view localized priority analytics.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gold-700/10 text-[9px] text-slate-400 flex items-center gap-1.5 font-sans leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 text-gold-700 shrink-0" />
            <span>AI recommends allocating MPLADS Q1 grants directly to Critical status areas first.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
