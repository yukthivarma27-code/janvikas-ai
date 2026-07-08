import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Category, Urgency } from '../types';
import { CATEGORY_COLORS } from '../mockData';
import { useLanguage } from '../i18n/LanguageContext';
import { Milestone, GraduationCap, HeartPulse, Droplets, Trash2, Briefcase, Bus, Sprout, Wifi, HelpCircle } from 'lucide-react';

// Help helper to get matching lucide icon for categories
export function getCategoryIcon(cat: Category, className = "w-4 h-4") {
  switch (cat) {
    case 'Education': return <GraduationCap className={className} />;
    case 'Roads': return <Milestone className={className} />;
    case 'Healthcare': return <HeartPulse className={className} />;
    case 'Water': return <Droplets className={className} />;
    case 'Sanitation': return <Trash2 className={className} />;
    case 'Employment': return <Briefcase className={className} />;
    case 'Transport': return <Bus className={className} />;
    case 'Agriculture': return <Sprout className={className} />;
    case 'Digital Access': return <Wifi className={className} />;
    default: return <HelpCircle className={className} />;
  }
}

interface CategoryData {
  category: Category;
  count: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="w-full bg-white card-gov p-5" id="category-bar-chart">
      <div className="flex justify-between items-center mb-4 border-b border-gold-700/15 pb-2">
        <div>
          <h4 className="font-bold text-sm text-navy-900">{t('requestsByCategory') || 'Requests by Category'}</h4>
          <p className="text-xs text-slate-500">{t('livePriorityTrends') || 'Live citizen priority trends'}</p>
        </div>
        <span className="text-[9px] font-mono bg-gold-50 text-gold-950 border border-gold-700/15 px-2 py-0.5 rounded-sm">100% SVG</span>
      </div>

      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
          const percentage = (item.count / maxCount) * 100;
          
          return (
            <div 
              key={item.category} 
              className="group"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <div className="p-1.5 rounded-md bg-[#FAF6E8] text-[#0F2D52] border border-gold-700/15">
                    {getCategoryIcon(item.category, "w-3.5 h-3.5")}
                  </div>
                  <span>{t(item.category)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-900">{item.count}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({Math.round((item.count / data.reduce((acc, curr) => acc + curr.count, 0)) * 100)}%)</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="h-2.5 w-full bg-gold-50/40 rounded-full overflow-hidden relative border border-gold-700/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-navy-900 to-[#C89B3C]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonthlyTrendLineChart() {
  const { t } = useLanguage();
  const points = [
    { month: 'Jan', requests: 45, projects: 2 },
    { month: 'Feb', requests: 62, projects: 3 },
    { month: 'Mar', requests: 90, projects: 5 },
    { month: 'Apr', requests: 120, projects: 7 },
    { month: 'May', requests: 175, projects: 12 },
    { month: 'Jun', requests: 245, projects: 18 }
  ];

  const maxVal = 250;
  const height = 140;
  const width = 340;
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate SVG coordinate points
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.requests / maxVal) * chartHeight;
    return { x, y, ...p };
  });

  // SVG Line path string generator
  const linePath = coords.reduce((acc, c, idx) => {
    return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, '');

  // Filled area path string generator
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`;

  const [activePoint, setActivePoint] = useState<typeof coords[0] | null>(null);

  return (
    <div className="bg-white card-gov p-5" id="monthly-trend-chart">
      <div className="flex justify-between items-center mb-4 border-b border-gold-700/15 pb-2">
        <div>
          <h4 className="font-bold text-sm text-navy-900">{t('monthlySubmissionInflux') || 'Monthly Submission Influx'}</h4>
          <p className="text-xs text-slate-500">{t('growthTrend') || 'First-half 2026 growth trend'}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navy-900 inline-block"></span>{t('submissionsLabel') || 'Submissions'}</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * chartHeight;
            const labelValue = Math.round(maxVal - ratio * maxVal);
            return (
              <g key={ratio} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#cbd5e1" 
                  strokeWidth="1" 
                  strokeDasharray="3,3"
                />
                <text 
                  x={paddingLeft - 6} 
                  y={y + 3} 
                  textAnchor="end" 
                  fontSize="8" 
                  fill="#64748b" 
                  className="font-mono"
                >
                  {labelValue}
                </text>
              </g>
            );
          })}

          {/* Saffron & Green Gradient for filled Area */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F2D52" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C89B3C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Path */}
          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            d={areaPath} 
            fill="url(#chartGradient)"
          />

          {/* Line Path */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            d={linePath} 
            fill="none" 
            stroke="#0F2D52" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />

          {/* Data Points / Interaction anchors */}
          {coords.map((c, idx) => (
            <g key={idx}>
              <circle 
                cx={c.x} 
                cy={c.y} 
                r={activePoint?.month === c.month ? "5" : "3.5"} 
                fill="#ffffff" 
                stroke="#C89B3C" 
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setActivePoint(c)}
                onMouseLeave={() => setActivePoint(null)}
              />
              {/* Month label at bottom */}
              <text 
                x={c.x} 
                y={paddingTop + chartHeight + 14} 
                textAnchor="middle" 
                fontSize="9" 
                fill="#475569" 
                className="font-sans font-medium"
              >
                {t(c.month.toLowerCase()) || c.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && (
          <div className="absolute top-2 left-[40%] transform -translate-x-1/2 bg-navy-900 border border-gold-700/35 text-[#FAF6E8] text-[11px] px-2.5 py-1.5 rounded-lg shadow-md flex flex-col gap-0.5 pointer-events-none">
            <span className="font-bold text-[10px] text-slate-300">{t(activePoint.month.toLowerCase()) || activePoint.month} 2026</span>
            <span className="font-bold text-[#C89B3C]">{activePoint.requests} {t('newRequestsLabel') || 'New Requests'}</span>
            <span className="text-emerald-400 font-bold">{activePoint.projects} {t('aiPrioritizedLabel') || 'AI Prioritized'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function UrgencyDonutChart() {
  const { t } = useLanguage();
  const data = [
    { label: 'High', count: 18, color: '#C89B3C', hoverBg: 'bg-amber-600' }, // Gold
    { label: 'Medium', count: 24, color: '#0F2D52', hoverBg: 'bg-navy-900' }, // Navy
    { label: 'Low', count: 12, color: '#0E7C66', hoverBg: 'bg-emerald-700' } // Emerald
  ];

  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  
  // Custom SVG donut math
  const size = 130;
  const center = size / 2;
  const radius = 45;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="bg-white card-gov p-5" id="urgency-donut-chart">
      <h4 className="font-bold text-sm text-navy-900 mb-0.5 font-serif">{t('urgencySegmentation') || 'Urgency Segmentation'}</h4>
      <p className="text-xs text-slate-500 mb-4">{t('urgencySegmentationDesc') || 'Request distribution by civic emergency levels'}</p>

      <div className="flex items-center gap-6 justify-center">
        {/* Radial Donut */}
        <div className="relative w-[130px] h-[130px]">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle 
              cx={center} 
              cy={center} 
              r={radius} 
              fill="transparent" 
              stroke="#FAF6E8" 
              strokeWidth={strokeWidth} 
            />
            {data.map((item, idx) => {
              const percentage = item.count / total;
              const strokeLength = percentage * circumference;
              const strokeOffset = circumference - strokeLength + accumulatedAngle;
              accumulatedAngle -= strokeLength;

              return (
                <motion.circle 
                  key={idx}
                  cx={center} 
                  cy={center} 
                  r={radius} 
                  fill="transparent" 
                  stroke={item.color} 
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${strokeLength} ${circumference}` }}
                  transition={{ duration: 1, delay: idx * 0.15 }}
                />
              );
            })}
          </svg>

          {/* Central Statistics overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400 font-bold tracking-wide">{t('totalLabel') || 'TOTAL'}</span>
            <span className="text-xl font-bold text-navy-900 font-serif">{total}</span>
            <span className="text-[9px] text-slate-400 font-bold">{t('issuesLabel') || 'Issues'}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">{t(item.label.toLowerCase()) || item.label}</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {item.count} {t('itemsLabel') || 'items'} ({Math.round((item.count / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
