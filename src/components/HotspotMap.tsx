import React, { useState } from 'react';
import { motion } from 'motion/react';
import hotspotsData from '../../data/hotspots.json';
import statesData from '../assets/india_states_simplified.json';
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
    'Kerala': 'KL',
    'Goa': 'GA',
    'Chhattisgarh': 'CG',
    'Nagaland': 'NL',
    'Puducherry': 'PY',
    'Ladakh': 'LA',
    'Chandigarh': 'CH',
    'Andaman & Nicobar Islands': 'AN',
    'Lakshadweep': 'LD',
    'Dadra & Nagar Haveli and Daman & Diu': 'DN'
  };
  return map[state] || state;
};

// Equirectangular projection mapping coordinates of India to fit inside a 500x350 viewport.
// Centered around 81.5°E, 22.0°N with scale 9.5. This ensures the entire outline of India, 
// including the full northern region (Jammu & Kashmir and Ladakh), is 100% visible and centered.
const project = (lng: number, lat: number) => {
  const centerLng = 81.5;
  const centerLat = 22.0;
  const scale = 9.5; 
  const svgCenterX = 250;
  const svgCenterY = 185;
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  
  const x = svgCenterX + (lng - centerLng) * scale * cosLat;
  const y = svgCenterY - (lat - centerLat) * scale;
  return { x, y };
};

// Get the SVG path string for a state polygon
const getSvgPath = (state: any) => {
  const { type, coordinates } = state;
  if (type === 'Polygon') {
    return coordinates.map((ring: any) => {
      return 'M ' + ring.map((pt: any) => {
        const { x, y } = project(pt[0], pt[1]);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' L ') + ' Z';
    }).join(' ');
  } else if (type === 'MultiPolygon') {
    return coordinates.map((polygon: any) => {
      return polygon.map((ring: any) => {
        return 'M ' + ring.map((pt: any) => {
          const { x, y } = project(pt[0], pt[1]);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' L ') + ' Z';
      }).join(' ');
    }).join(' ');
  }
  return '';
};

export default function HotspotMap({ onConstituencySelect, selectedConstituency }: HotspotMapProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Active' | 'Normal'>('All');
  // Default to Visakhapatnam if found, otherwise first hotspot
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(
    HOTSPOTS.find(h => h.constituency === 'Visakhapatnam') || HOTSPOTS[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [hoveredHotspot, setHoveredHotspot] = useState<any | null>(null);

  // Apply filters on the primary list
  const filteredHotspots = HOTSPOTS.filter(h => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Critical') return h.priorityLevel === 'Critical';
    if (filterStatus === 'Active') return h.priorityLevel === 'High' || h.priorityLevel === 'Medium';
    if (filterStatus === 'Normal') return h.priorityLevel === 'Low';
    return true;
  });

  // Calculate dynamic projected coordinates for filtered hotspots
  const projectedHotspots = filteredHotspots.map(h => {
    const { x, y } = project(h.longitude, h.latitude);
    return { ...h, x, y };
  });

  // Clustering logic for National Zoom (zoomLevel < 100)
  const getClusters = (hotspots: typeof projectedHotspots, zoom: number) => {
    if (zoom >= 100) {
      return hotspots.map(h => ({
        ...h,
        id: `${h.state}-${h.constituency}`,
        isCluster: false,
        childHotspots: [h]
      }));
    }

    const clusters: any[] = [];
    const visited = new Set<string>();
    const threshold = 35; // Cluster distance threshold in pixels

    // Sort by priority score descending to center clusters around critical areas
    const sorted = [...hotspots].sort((a, b) => b.priorityScore - a.priorityScore);

    for (const h of sorted) {
      const key = `${h.state}-${h.constituency}`;
      if (visited.has(key)) continue;

      visited.add(key);
      const childHotspots = [h];

      for (const other of sorted) {
        const otherKey = `${other.state}-${other.constituency}`;
        if (visited.has(otherKey)) continue;

        const dx = h.x - other.x;
        const dy = h.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < threshold) {
          visited.add(otherKey);
          childHotspots.push(other);
        }
      }

      if (childHotspots.length > 1) {
        // Average coordinates for the cluster
        const avgX = childHotspots.reduce((sum, c) => sum + c.x, 0) / childHotspots.length;
        const avgY = childHotspots.reduce((sum, c) => sum + c.y, 0) / childHotspots.length;
        const totalCount = childHotspots.reduce((sum, c) => sum + c.count, 0);
        const maxScore = Math.max(...childHotspots.map(c => c.priorityScore));
        
        // Take priorityLevel of the highest priority score node
        const leader = childHotspots.find(c => c.priorityScore === maxScore) || h;

        clusters.push({
          id: `cluster-${leader.constituency}`,
          constituency: `${leader.constituency} Area Cluster`,
          state: leader.state,
          x: avgX,
          y: avgY,
          latitude: leader.latitude,
          longitude: leader.longitude,
          category: leader.category,
          priorityScore: maxScore,
          priorityLevel: leader.priorityLevel,
          count: totalCount,
          demandVolumeChange: leader.demandVolumeChange,
          primaryGapsText: leader.primaryGapsText,
          metrics: leader.metrics,
          topIssues: leader.topIssues,
          recommendedAction: leader.recommendedAction,
          isCluster: true,
          childHotspots
        });
      } else {
        clusters.push({
          ...h,
          id: `${h.state}-${h.constituency}`,
          isCluster: false,
          childHotspots: [h]
        });
      }
    }

    return clusters;
  };

  const visibleItems = getClusters(projectedHotspots, zoomLevel);

  // Label overlap collision avoidance algorithm
  const computeLabelPositions = (items: any[]) => {
    const layout = items.map(item => ({
      item,
      x: item.x,
      y: item.y,
      dx: 0,
      dy: -10,
      textAnchor: "middle" as "middle" | "start" | "end"
    }));

    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const p1 = layout[i];
        const p2 = layout[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If markers are close, shift labels to prevent collisions
        if (dist < 22) {
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal shift
            if (dx > 0) {
              p1.dx = 10; p1.dy = 3; p1.textAnchor = "start";
              p2.dx = -10; p2.dy = 3; p2.textAnchor = "end";
            } else {
              p1.dx = -10; p1.dy = 3; p1.textAnchor = "end";
              p2.dx = 10; p2.dy = 3; p2.textAnchor = "start";
            }
          } else {
            // Vertical shift
            if (dy > 0) {
              p1.dx = 0; p1.dy = 12; p1.textAnchor = "middle";
              p2.dx = 0; p2.dy = -12; p2.textAnchor = "middle";
            } else {
              p1.dx = 0; p1.dy = -12; p1.textAnchor = "middle";
              p2.dx = 0; p2.dy = 12; p2.textAnchor = "middle";
            }
          }
        }
      }
    }
    return layout;
  };

  const labelLayouts = computeLabelPositions(visibleItems);

  // Find dynamic selected constituency state
  const currentSelectTarget = selectedConstituency 
    ? HOTSPOTS.find(h => h.constituency === selectedConstituency) 
    : activeHotspot;

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
          <p className="text-xs text-slate-400">
            {zoomLevel < 100 ? "National Zoom — Displaying clustered hotspots" : 
             zoomLevel < 130 ? "State Zoom — Displaying constituencies with overlap filters" :
             "District Zoom — Displaying deep constituency metrics"}
          </p>
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

          {/* Hover / Click Tooltip Overlay (Priority details) */}
          {hoveredHotspot && (
            <div 
              className="absolute bg-navy-950/90 border border-gold-700/35 rounded-lg p-2.5 text-[9px] space-y-1.5 shadow-lg pointer-events-none z-20 font-serif leading-tight animate-fadeIn"
              style={{
                left: `${(hoveredHotspot.x / 500) * 100}%`,
                top: `${(hoveredHotspot.y / 350) * 100}%`,
                transform: 'translate(12px, -50%)',
                width: '135px'
              }}
            >
              <p className="font-bold text-slate-100 leading-none">{hoveredHotspot.constituency}</p>
              <p className="text-slate-450 text-[8px]">{hoveredHotspot.state}</p>
              <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 text-slate-355">
                <span>Priority Score</span>
                <span className="font-bold font-mono text-[#C89B3C]">{hoveredHotspot.priorityScore}</span>
              </div>
              <div className="flex justify-between text-slate-355">
                <span>Requests</span>
                <span className="font-bold font-mono">{hoveredHotspot.count}</span>
              </div>
              <div className="flex justify-between text-slate-355">
                <span>Main Issue</span>
                <span className="font-bold text-gold-600">{hoveredHotspot.category}</span>
              </div>
              <div className="flex justify-between text-slate-355 items-center">
                <span>Level</span>
                <span className={`font-bold text-[8px] uppercase ${
                  hoveredHotspot.priorityLevel === 'Critical' ? 'text-[#CD1A30]' : 
                  hoveredHotspot.priorityLevel === 'High' ? 'text-[#EA580C]' : 'text-slate-400'
                }`}>{hoveredHotspot.priorityLevel}</span>
              </div>
              {hoveredHotspot.isCluster && (
                <div className="border-t border-slate-800 pt-1 text-[7px] text-emerald-400 italic">
                  * Cluster of {hoveredHotspot.childHotspots.length} hotspots. Click to zoom.
                </div>
              )}
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

            {/* High-quality India base map state boundaries GeoJSON rendering */}
            <g id="state-boundaries-layer">
              {statesData.map((state: any, idx: number) => {
                const pathD = getSvgPath(state);
                return (
                  <path
                    key={idx}
                    d={pathD}
                    fill="#0F2D52"
                    fillOpacity="0.05"
                    stroke="#C89B3C"
                    strokeWidth="0.5"
                    className="opacity-40 hover:fill-opacity-20 hover:opacity-100 transition-all duration-200 cursor-default"
                  />
                );
              })}
            </g>

            {/* Map Markers */}
            {labelLayouts.map((layout, idx) => {
              const hotspot = layout.item;
              const x = layout.x;
              const y = layout.y;

              const isSelected = currentSelectTarget?.constituency === hotspot.constituency;
              const isHovered = hoveredHotspot?.id === hotspot.id;
              
              // Marker colors: Red -> Critical, Orange -> High, Yellow -> Medium, Green -> Low
              const markerColor = 
                hotspot.priorityLevel === 'Critical' ? '#CD1A30' : // Red
                hotspot.priorityLevel === 'High' ? '#EA580C' :     // Orange
                hotspot.priorityLevel === 'Medium' ? '#CA8A04' :   // Yellow
                '#16A34A';                                         // Green (Low)

              // Dynamic marker sizing representing priority score & request count
              const markerRadius = hotspot.isCluster 
                ? 6.5 + Math.min(hotspot.count / 40, 5) 
                : 3.5 + Math.min(hotspot.priorityScore / 22, 3.5);

              // Render text labels only when needed (hovered, selected, critical, or if it is a cluster node)
              // This guarantees a clean, professional, and readable national level visualization
              const shouldShowLabel = isSelected || isHovered || hotspot.priorityLevel === 'Critical' || hotspot.isCluster;

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredHotspot(hotspot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onClick={() => {
                    if (hotspot.isCluster) {
                      // Zoom in on cluster center
                      setZoomLevel(115);
                      setActiveHotspot(hotspot.childHotspots[0]);
                      if (onConstituencySelect) onConstituencySelect(hotspot.childHotspots[0].constituency);
                    } else {
                      setActiveHotspot(hotspot);
                      if (onConstituencySelect) onConstituencySelect(hotspot.constituency);
                    }
                  }}
                >
                  {/* Glowing pulse aura - critical hotspots pulse smoothly */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? markerRadius + 5 : markerRadius + 2.5} 
                    fill={markerColor} 
                    className={`opacity-25 ${hotspot.priorityLevel === 'Critical' ? 'animate-pulse' : ''}`} 
                  />
                  {hotspot.priorityLevel === 'Critical' && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={markerRadius + 8} 
                      fill="none" 
                      stroke={markerColor} 
                      strokeWidth="0.8" 
                      className="animate-ping opacity-45" 
                      style={{ animationDuration: '3s' }}
                    />
                  )}
                  
                  {/* Central marker pin */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={markerRadius} 
                    fill={markerColor} 
                    stroke="#051426" 
                    strokeWidth="1.2"
                    className="transition-all duration-300" 
                  />

                  {/* Render Cluster counts inside the pin if clustered */}
                  {hotspot.isCluster && (
                    <text
                      x={x}
                      y={y + 2.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="6.5"
                      fontWeight="bold"
                      className="pointer-events-none font-sans"
                    >
                      {hotspot.childHotspots.length}
                    </text>
                  )}

                  {/* Collision-free label texts */}
                  {shouldShowLabel && (
                    <text 
                      x={x + layout.dx} 
                      y={y + layout.dy} 
                      textAnchor={layout.textAnchor} 
                      fill={isSelected ? '#C89B3C' : '#cbd5e1'} 
                      fontSize="6.5" 
                      fontWeight={isSelected ? "bold" : "normal"}
                      className={`tracking-wide font-serif transition-opacity duration-200 ${
                        isSelected ? 'opacity-100 text-shadow-sm' : 'opacity-85 group-hover:opacity-100'
                      }`}
                    >
                      {hotspot.constituency}
                      {/* District zoom displays request stats below labels */}
                      {zoomLevel >= 130 && ` (${hotspot.count})`}
                    </text>
                  )}
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

            {currentSelectTarget ? (
              <div className="space-y-4" id="telemetry-box animate-fadeIn">
                {/* Location Detail block */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Constituency</p>
                    <p className="text-base font-bold text-[#FAF6E8] flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gold-700 shrink-0" />
                      {currentSelectTarget.constituency} ({getStateAbbr(currentSelectTarget.state)})
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
                    <p className="text-sm font-bold text-slate-100">{currentSelectTarget.count} requests</p>
                    <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      {currentSelectTarget.demandVolumeChange}
                    </p>
                  </div>
                  <div className="bg-navy-900/60 p-2.5 rounded-lg border border-gold-700/15">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Severe Status</p>
                    <span className={`border text-[8px] font-bold px-1.5 py-0.5 mt-0.5 rounded inline-block uppercase font-mono ${
                      currentSelectTarget.priorityLevel === 'Critical' 
                        ? 'bg-red-950/40 text-red-300 border-red-800' 
                        : currentSelectTarget.priorityLevel === 'High' 
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                        : 'bg-yellow-950/40 text-yellow-300 border-yellow-800'
                    }`}>
                      {currentSelectTarget.priorityLevel}
                    </span>
                    <p className="text-[9px] text-slate-300 font-bold mt-1">
                      Priority Score: <span className="text-gold-700 font-mono">{currentSelectTarget.priorityScore}/100</span>
                    </p>
                  </div>
                </div>

                {/* Primary Demand Gaps Explanation */}
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Primary Demand Gaps</p>
                  <p className="text-xs text-gold-100 bg-[#0F2D52]/60 p-2.5 rounded-lg border border-gold-700/20 font-medium font-serif leading-relaxed">
                    {currentSelectTarget.primaryGapsText}
                  </p>
                </div>

                {/* 8-Demographic Metrics Grid (Mockup 4x2 Grid) */}
                <div className="space-y-1.5">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Key Open Data Metrics</p>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-serif">
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Users className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Population</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.population}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Award className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Literacy</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.literacyRate}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Warehouse className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Wards/Vill</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.villagesWards}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Map className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Area</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.area}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <School className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Schools</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.schools}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Hospital className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Clinics</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.healthcareFacilities}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Droplet className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Water Cov</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.waterCoverage}</p>
                    </div>
                    <div className="bg-navy-950/60 p-1.5 border border-gold-700/10 rounded">
                      <Waypoints className="w-3.5 h-3.5 mx-auto text-gold-700 mb-1" />
                      <p className="text-[8px] text-slate-400 uppercase">Road Conn</p>
                      <p className="font-bold text-slate-100 font-mono">{currentSelectTarget.metrics.roadConnectivity}</p>
                    </div>
                  </div>
                </div>

                {/* Top Issues by Category Progress Bars */}
                <div className="space-y-2">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Top Issues by Category</p>
                  <div className="space-y-2">
                    {currentSelectTarget.topIssues.map((issue, idx) => (
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
                    {currentSelectTarget.recommendedAction.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-gold-700/15 pt-1.5 mt-1">
                    <div>
                      <p className="text-slate-400">Est. Beneficiaries</p>
                      <p className="font-bold text-slate-200 font-mono text-xs">{currentSelectTarget.recommendedAction.beneficiaries}</p>
                    </div>
                    <div className="border-l border-gold-700/15 pl-2">
                      <p className="text-slate-400">Est. Budget</p>
                      <p className="font-bold text-[#C89B3C] font-mono text-xs">{currentSelectTarget.recommendedAction.budget}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-350 italic pt-1 leading-normal font-sans border-t border-gold-700/10">
                    💡 {currentSelectTarget.recommendedAction.details}
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
