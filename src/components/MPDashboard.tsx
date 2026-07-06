import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CitizenRequest, Category, Urgency, RequestStatus } from '../types';
import { CATEGORY_COLORS, getCategoryIcon } from '../mockData';
import { CategoryBarChart, MonthlyTrendLineChart, UrgencyDonutChart } from './CustomChart';
import HotspotMap from './HotspotMap';
import { Search, SlidersHorizontal, ArrowUpRight, CheckSquare, Clock, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

interface MPDashboardProps {
  requests: CitizenRequest[];
  onStatusChange: (id: string, newStatus: RequestStatus) => void;
  onNavigate: (view: string) => void;
}

export default function MPDashboard({ requests, onStatusChange, onNavigate }: MPDashboardProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | 'All'>('All');
  
  // Highlighted states
  const [selectedConstituency, setSelectedConstituency] = useState<string>('Varanasi');

  // Compute stats
  const totalCount = requests.length;
  const highPriorityCount = requests.filter(r => r.urgency === 'High').length;
  
  // Calculate top category
  const catCounts: Record<Category, number> = {} as any;
  requests.forEach(r => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  let topCategory: Category = 'Roads';
  let maxCatCount = 0;
  Object.entries(catCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat as Category;
    }
  });

  const activeHotspotsCount = 5; // Static realistic
  const pendingProjectsCount = requests.filter(r => r.status !== 'Completed').length;

  // Filter requests for Table
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'All' || req.urgency === selectedUrgency;

    return matchesSearch && matchesCategory && matchesUrgency;
  });

  // Category counts data for BarChart
  const barChartData = Object.entries(catCounts).map(([cat, val]) => ({
    category: cat as Category,
    count: val
  })).sort((a,b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-serif" id="mp-admin-command-center">
      
      {/* KPI Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-gold-50 text-gold-950 border border-gold-700/20 font-bold text-xs uppercase font-serif">GOVERNMENT TELEMETRY</span>
            <span className="text-[11px] text-[#5C6670] font-bold">• SECURE COMMAND ACCESS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900 tracking-tight font-serif mt-1">MP Command Center Dashboard</h2>
          <p className="text-xs text-slate-500">Real-time analytical visualization of public development needs and AI-priority actions</p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-2.5 font-serif">
          <button 
            onClick={() => onNavigate('ai-recommendations')}
            className="btn-gov-primary px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
            id="btn-nav-ai-recs"
          >
            <span>View AI Ranked Recommendations</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gold-700" />
          </button>
          <button 
            onClick={() => onNavigate('proposal-comparison')}
            className="btn-gov-secondary px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer shadow-xs"
            id="btn-nav-proposal-comp"
          >
            Sanction Comparisons
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fadeIn" id="kpi-scorecard-grid">
        <div className="bg-white card-gov p-5 flex flex-col justify-between hover:-translate-y-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-2xl font-bold text-navy-900 font-mono mt-1">{totalCount}</h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-gold-700 animate-pulse" /> 
            100% Verified Lodges
          </p>
        </div>

        <div className="bg-white card-gov p-5 flex flex-col justify-between hover:-translate-y-1">
          <div>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">High Priority Issues</p>
            <h3 className="text-2xl font-bold text-rose-700 font-mono mt-1">{highPriorityCount}</h3>
          </div>
          <p className="text-[10px] text-rose-700 font-bold mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            Safety Risk Triggers
          </p>
        </div>

        <div className="bg-white card-gov p-5 flex flex-col justify-between hover:-translate-y-1">
          <div>
            <p className="text-[10px] font-bold text-gold-950 uppercase tracking-wider">Top Demand Category</p>
            <h3 className="text-base font-bold text-[#C89B3C] mt-1 truncate">{topCategory}</h3>
          </div>
          <p className="text-[10px] text-gold-900 font-bold mt-2">
            Highest Citizen Influx
          </p>
        </div>

        <div className="bg-white card-gov p-5 flex flex-col justify-between hover:-translate-y-1">
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Active Hotspots</p>
            <h3 className="text-2xl font-bold text-emerald-800 font-mono mt-1">{activeHotspotsCount}</h3>
          </div>
          <p className="text-[10px] text-emerald-800 font-bold mt-2 font-serif">
            High Density Gaps
          </p>
        </div>

        <div className="bg-white card-gov p-5 flex flex-col justify-between col-span-2 md:col-span-1 hover:-translate-y-1">
          <div>
            <p className="text-[10px] font-bold text-navy-900 uppercase tracking-wider">Pending Projects</p>
            <h3 className="text-2xl font-bold text-navy-900 font-mono mt-1">{pendingProjectsCount}</h3>
          </div>
          <p className="text-[10px] text-navy-900 font-bold mt-2 font-serif">
            Awaiting Sanctions
          </p>
        </div>
      </div>

      {/* GIS map preview */}
      <div className="animate-fadeIn">
        <HotspotMap 
          selectedConstituency={selectedConstituency}
          onConstituencySelect={(cons) => setSelectedConstituency(cons)}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        <div className="lg:col-span-1">
          <CategoryBarChart data={barChartData} />
        </div>
        <div className="lg:col-span-1">
          <MonthlyTrendLineChart />
        </div>
        <div className="lg:col-span-1">
          <UrgencyDonutChart />
        </div>
      </div>

      {/* Interactive Table with searching and filtering */}
      <div className="bg-white card-gov p-5 md:p-6.5 font-serif animate-slideUp" id="table-command-box">
        
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-gold-700/15">
          <div>
            <h3 className="font-bold text-sm text-navy-900 font-serif">Administrative Request Database</h3>
            <p className="text-xs text-slate-500">Live sorting, priority audits, and executive milestone overrides</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gold-700" />
              <input
                type="text"
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs input-gov"
                id="input-db-search"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-white input-gov px-4 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              id="select-db-category-filter"
            >
              <option value="All">All Categories</option>
              <option value="Education">Education</option>
              <option value="Roads">Roads</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Water">Water</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Employment">Employment</option>
              <option value="Transport">Transport</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Digital Access">Digital Access</option>
              <option value="Other">Other</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value as any)}
              className="bg-white input-gov px-4 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              id="select-db-urgency-filter"
            >
              <option value="All">All Urgencies</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>
          </div>
        </div>

        {/* Database Table Pane */}
        <div className="overflow-x-auto table-gov-container" id="request-db-table">
          <table className="w-full text-left border-collapse table-gov">
            <thead>
              <tr className="border-b border-gold-700/35 text-[10px] font-bold text-navy-900 uppercase tracking-wider bg-[#FAF6E8]">
                <th className="py-3.5 px-4 font-serif">Tracking ID</th>
                <th className="py-3.5 px-4 font-serif">Citizen details</th>
                <th className="py-3.5 px-4 font-serif">Development Demand</th>
                <th className="py-3.5 px-4 font-serif">Urgency / Priority</th>
                <th className="py-3.5 px-4 font-serif">AI Score</th>
                <th className="py-3.5 px-4 font-serif">Executive Status Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-700/10 text-xs">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  return (
                    <tr key={req.id} className="transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                        {req.id}
                      </td>

                      {/* Citizen info */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 font-serif">{req.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.contact}</p>
                      </td>

                      {/* Description & Category */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FAF6E8] text-[#0F2D52] border border-gold-700/20 font-serif">
                            {getCategoryIcon(req.category, "w-2.5 h-2.5")}
                            {req.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{req.mandal}, {req.constituency}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed font-serif">{req.description}</p>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4 font-serif">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.urgency === 'High' 
                            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                            : req.urgency === 'Medium' 
                            ? 'bg-gold-50 text-gold-900 border border-gold-700/20' 
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-250'
                        }`}>
                          {req.urgency}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono mt-1 font-medium">★ {req.upvotes} upvotes</p>
                      </td>

                      {/* AI Priority Rank */}
                      <td className="py-3.5 px-4 font-serif">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`text-sm font-bold ${
                            req.priorityScore > 85 ? 'text-rose-700' : req.priorityScore > 60 ? 'text-navy-900' : 'text-emerald-800'
                          }`}>
                            {req.priorityScore}%
                          </span>
                        </div>
                      </td>

                      {/* Action status switcher */}
                      <td className="py-3.5 px-4 font-serif">
                        <select
                          value={req.status}
                          onChange={(e) => onStatusChange(req.id, e.target.value as RequestStatus)}
                          className="bg-white input-gov px-2.5 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Verified">Verified</option>
                          <option value="Prioritized">Prioritized</option>
                          <option value="Allocated">Allocated</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium font-serif">
                    No records found matching the active search/filter options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
