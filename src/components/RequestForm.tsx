import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CONSTITUENCIES, CATEGORY_COLORS } from '../mockData';
import { Category, Urgency, CitizenRequest, Language } from '../types';
import { Mic, UploadCloud, MapPin, Sparkles, AlertCircle, CheckCircle, FileText, Compass, CornerDownRight } from 'lucide-react';

interface RequestFormProps {
  currentLang: Language;
  onAddRequest: (req: CitizenRequest) => void;
  onNavigateToTrack: (id: string) => void;
}

export default function RequestForm({ currentLang, onAddRequest, onNavigateToTrack }: RequestFormProps) {
  // Form States
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [constituency, setConstituency] = useState('Varanasi');
  const [mandal, setMandal] = useState('Kashi Vidyapith');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState<Category>('Roads');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  
  // Location simulation
  const [lat, setLat] = useState(25.3176);
  const [lng, setLng] = useState(82.9739);
  
  // Sub-states & Mock UIs
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdID, setCreatedID] = useState('');

  // AI Instant Preview state
  const [aiAnalysisPreview, setAiAnalysisPreview] = useState({
    sentiment: 'Neutral' as 'Positive' | 'Neutral' | 'Critical',
    priorityScore: 50,
    costLakhs: 8.0,
    demandLevel: 'Medium' as 'Very High' | 'High' | 'Medium'
  });

  // Fetch district and mandals based on selected constituency
  const constituencyData = CONSTITUENCIES.find(c => c.name === constituency) || CONSTITUENCIES[0];
  const district = constituencyData.district;

  useEffect(() => {
    // Auto-update first mandal when constituency changes
    if (constituencyData.mandals.length > 0) {
      setMandal(constituencyData.mandals[0]);
    }
    
    // Simulate latitude/longitude shift
    if (constituency === 'Varanasi') { setLat(25.3176); setLng(82.9739); }
    else if (constituency === 'Bengaluru South') { setLat(12.9716); setLng(77.5946); }
    else if (constituency === 'Hyderabad') { setLat(17.3850); setLng(78.4867); }
    else if (constituency === 'Pune') { setLat(18.5204); setLng(73.8567); }
    else if (constituency === 'Guntur') { setLat(16.3067); setLng(80.4365); }
    else if (constituency === 'Howrah') { setLat(22.5958); setLng(88.2636); }
    else if (constituency === 'Coimbatore') { setLat(11.0168); setLng(76.9558); }
    else if (constituency === 'Lucknow') { setLat(26.8467); setLng(80.9462); }
  }, [constituency]);

  // Handle Dynamic AI Analysis Calculations as user types description!
  useEffect(() => {
    if (description.length < 15) {
      setAiAnalysisPreview({
        sentiment: 'Neutral',
        priorityScore: urgency === 'High' ? 65 : urgency === 'Medium' ? 45 : 25,
        costLakhs: 4.5,
        demandLevel: 'Medium'
      });
      return;
    }

    // Rough NLP simulation
    const lowercaseDesc = description.toLowerCase();
    let sentiment: 'Positive' | 'Neutral' | 'Critical' = 'Neutral';
    let baseScore = 50;
    let cost = 12.0;

    if (lowercaseDesc.includes('pothole') || lowercaseDesc.includes('accident') || lowercaseDesc.includes('danger') || lowercaseDesc.includes('broken') || lowercaseDesc.includes('leak') || lowercaseDesc.includes('clog')) {
      sentiment = 'Critical';
      baseScore += 25;
    }

    if (lowercaseDesc.includes('school') || lowercaseDesc.includes('children') || lowercaseDesc.includes('hospital') || lowercaseDesc.includes('health') || lowercaseDesc.includes('solar') || lowercaseDesc.includes('farmers')) {
      baseScore += 15;
      cost += 10;
    }

    if (urgency === 'High') baseScore += 12;
    if (urgency === 'Low') baseScore -= 10;

    // Constrain score
    const finalScore = Math.min(Math.max(baseScore, 10), 98);
    const demand: 'Very High' | 'High' | 'Medium' = finalScore > 85 ? 'Very High' : finalScore > 70 ? 'High' : 'Medium';

    setAiAnalysisPreview({
      sentiment,
      priorityScore: finalScore,
      costLakhs: parseFloat((cost + (description.length * 0.05)).toFixed(1)),
      demandLevel: demand
    });

  }, [description, urgency]);

  // Voice Input Simulation
  const handleVoiceSimulation = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const textToAppend = " The water pipeline near the community center is broken and mixing with muddy surface water, causing immediate risk to children. Please repair this as soon as possible.";
      setDescription(prev => prev + textToAppend);
    }, 2800);
  };

  // Mock File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f: any) => f.name);
      setUploadedFiles(prev => [...prev, ...names]);
    }
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !contact) {
      alert("Please fill in Name, Contact, and Request Description.");
      return;
    }

    const mockId = `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: CitizenRequest = {
      id: mockId,
      name,
      contact,
      constituency,
      district,
      mandal,
      locality: locality || 'Main Village Road',
      category,
      description,
      urgency,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      language: currentLang,
      priorityScore: aiAnalysisPreview.priorityScore,
      upvotes: 1,
      latitude: lat,
      longitude: lng,
      aiAnalysis: {
        sentiment: aiAnalysisPreview.sentiment,
        estimatedImpactUsers: Math.floor(200 + Math.random() * 1500),
        estimatedCostLakhs: aiAnalysisPreview.costLakhs,
        primaryNeed: `Reconstruction of local ${category} nodes.`,
        justification: `AI analyzed safety threat: ${aiAnalysisPreview.sentiment}. Immediate municipal response recommended.`
      }
    };

    onAddRequest(newRequest);
    setCreatedID(mockId);
    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-serif" id="citizen-submission-panel">
      {/* Welcome and info banner */}
      <div className="mb-6 bg-gradient-to-b from-[#0F2D52] to-[#081B33] text-white rounded-2xl p-6.5 relative overflow-hidden shadow-md border-b-4 border-gold-700 animate-fadeIn">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-600 rounded-full blur-3xl opacity-15 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-gold-700 rounded-full blur-2xl opacity-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-1.5 text-gold-700">
          <Sparkles className="w-5 h-5 animate-pulse text-gold-600" />
          <span className="text-xs font-bold uppercase tracking-wider font-serif">Cognitive Civic Prioritizer</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#FAF6E8] font-serif">
          Submit Development Request
        </h2>
        <p className="text-slate-355 text-xs md:text-sm max-w-2xl mt-1 leading-relaxed font-serif">
          Fill in the details below. Our real-time NLP algorithms will automatically evaluate your request, rank urgency based on safety impact, and map it for immediate Member of Parliament consideration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* The Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-gold-700/20 shadow-xs animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-5" id="citizen-form">
            
            {/* Row 1: Name and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Chandra Verma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-gov px-3.5 py-2.5 text-sm font-serif font-medium text-slate-800"
                  id="input-citizen-name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">Phone or Email Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. +91 98765 43210 or ramesh@verma.com" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full input-gov px-3.5 py-2.5 text-sm font-serif font-medium text-slate-800"
                  id="input-citizen-contact"
                />
              </div>
            </div>

            {/* Row 2: Location Hierarchy (Constituency dropdown, district, ward) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gold-50/40 p-4 rounded-xl border border-gold-700/15">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">Constituency</label>
                <select 
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  className="w-full bg-white input-gov px-2.5 py-1.5 text-xs font-bold font-serif text-slate-800 cursor-pointer"
                  id="select-citizen-constituency"
                >
                  {CONSTITUENCIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">District</label>
                <input 
                  type="text" 
                  disabled
                  value={district}
                  className="w-full bg-slate-100 px-2.5 py-1.5 text-xs border border-gold-700/10 rounded-md text-slate-600 font-bold font-serif"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">Mandal / Ward</label>
                <select 
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="w-full bg-white input-gov px-2.5 py-1.5 text-xs font-bold font-serif text-slate-800 cursor-pointer"
                  id="select-citizen-mandal"
                >
                  {constituencyData.mandals.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Locality & Village level */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">Locality, Village or Land Mark</label>
              <input 
                type="text" 
                placeholder="e.g. Ward No.4, opposite Hanuman Temple lane" 
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full input-gov px-3.5 py-2.5 text-sm text-slate-800 font-serif font-medium"
                id="input-citizen-locality"
              />
            </div>

            {/* Category selection - Grid of Cards */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">Issue / Development Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="category-picker-grid">
                {(['Education', 'Roads', 'Healthcare', 'Water', 'Sanitation', 'Employment', 'Transport', 'Agriculture', 'Digital Access', 'Other'] as Category[]).map(cat => {
                  const isSelected = category === cat;

                  return (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer select-none transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-[#FAF6E8] text-[#0F2D52] border-gold-700 ring-2 ring-gold-700/10 font-bold shadow-xs' 
                          : 'bg-white text-slate-650 border-gold-700/15 hover:bg-gold-50/40'
                      }`}
                    >
                      <div className={`p-1 rounded-md ${isSelected ? 'bg-gold-100 text-[#0F2D52]' : 'bg-slate-100 text-slate-500'}`}>
                        {cat === 'Roads' && <MapPin className="w-4 h-4 text-gold-700" />}
                        {cat === 'Education' && <FileText className="w-4 h-4 text-gold-700" />}
                        {cat === 'Healthcare' && <Sparkles className="w-4 h-4 text-gold-700" />}
                        {cat !== 'Roads' && cat !== 'Education' && cat !== 'Healthcare' && <FileText className="w-4 h-4 text-gold-700" />}
                      </div>
                      <span className="text-[10px] font-bold tracking-tight font-serif">{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Area & Voice Assist */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider font-serif">Detailed Description of the Request</label>
                
                {/* Voice Assist Trigger Button */}
                <button
                  type="button"
                  onClick={handleVoiceSimulation}
                  disabled={isRecording}
                  className={`flex items-center gap-1 text-[11px] font-bold px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-gold-100 text-gold-900 hover:bg-[#EEDAA2]'
                  }`}
                  id="btn-voice-assist"
                >
                  <Mic className="w-3.5 h-3.5 text-gold-700" />
                  {isRecording ? 'Listening (AI Recording)...' : 'AI Voice Assist'}
                </button>
              </div>

              <textarea 
                rows={4}
                required
                placeholder="Explain the developmental requirement, how many families are impacted, and any emergency safety/health concerns..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full input-gov px-3.5 py-2.5 text-sm text-slate-800 font-serif"
                id="textarea-citizen-description"
              />

              {description.length > 0 && description.length < 15 && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5 font-medium font-serif">
                  <AlertCircle className="w-3 h-3 text-gold-700" /> Minimum 15 characters required for deep AI prioritization assessment.
                </p>
              )}
            </div>

            {/* Urgency Level & Document Upload Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Urgency */}
              <div className="bg-gold-50/40 p-4 rounded-xl border border-gold-700/15">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">Urgency Level</label>
                <div className="flex items-center gap-3">
                  {(['Low', 'Medium', 'High'] as Urgency[]).map(level => (
                    <label 
                      key={level} 
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all duration-200 font-serif ${
                        urgency === level 
                          ? level === 'High' 
                            ? 'bg-rose-50 text-rose-800 border-rose-300' 
                            : level === 'Medium' 
                            ? 'bg-gold-100 text-gold-900 border-gold-700/40' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-500 border-gold-700/15 hover:bg-gold-50/30'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="urgency" 
                        value={level} 
                        checked={urgency === level} 
                        onChange={() => setUrgency(level)} 
                        className="sr-only" 
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Upload dropzone */}
              <div className="bg-gold-50/40 p-4 rounded-xl border border-gold-700/15 flex flex-col justify-center">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">Supporting Photos / Documents (Optional)</label>
                <div className="border border-dashed border-gold-700/30 hover:border-gold-700 bg-white rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer relative transition-all">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <UploadCloud className="w-5 h-5 text-gold-700 mb-1" />
                  <p className="text-[10px] text-slate-600 font-serif font-bold">Click to select files or drag-and-drop</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="text-[9px] bg-gold-100 text-gold-900 px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono border border-gold-700/10">
                        <FileText className="w-2.5 h-2.5" />
                        {f.length > 12 ? f.substring(0, 10) + '...' : f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Coordinates Verification */}
            <div className="bg-gold-50/40 p-4 rounded-xl border border-gold-700/15">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider font-serif">Locational Coordinates Verification</label>
                <span className="text-[10px] font-mono bg-navy-50 text-navy-900 border border-gold-700/20 px-2 py-0.5 rounded-sm">GPS Auto-locked</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-gold-700/15 flex items-center gap-2 shadow-xs">
                  <Compass className="w-4 h-4 text-gold-700" />
                  <div className="font-mono text-xs">
                    <p className="text-[8px] text-slate-400 font-bold uppercase">LATITUDE</p>
                    <p className="font-semibold text-slate-800">{lat.toFixed(5)}° N</p>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gold-700/15 flex items-center gap-2 shadow-xs">
                  <Compass className="w-4 h-4 text-gold-700" />
                  <div className="font-mono text-xs">
                    <p className="text-[8px] text-slate-400 font-bold uppercase">LONGITUDE</p>
                    <p className="font-semibold text-slate-800">{lng.toFixed(5)}° E</p>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gold-700/15 flex items-center justify-center shadow-xs">
                  <button 
                    type="button"
                    onClick={() => {
                      setLat(prev => prev + (Math.random() - 0.5) * 0.005);
                      setLng(prev => prev + (Math.random() - 0.5) * 0.005);
                    }}
                    className="text-[10px] font-bold text-navy-900 hover:text-gold-800 flex items-center gap-1 font-serif cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-gold-700" /> Recalibrate Location
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn-gov-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                id="btn-citizen-submit"
              >
                <Sparkles className="w-4.5 h-4.5 text-gold-600 fill-gold-600 animate-pulse" />
                Submit and AI Prioritize Request
              </button>
            </div>

          </form>
        </div>

        {/* Dynamic AI Analysis Side Widget */}
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white card-gov p-5 md:p-6 relative overflow-hidden" id="realtime-nlp-preview">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-200 rounded-full blur-2xl opacity-15 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4 border-b border-gold-700/15 pb-2">
              <Sparkles className="w-4 h-4 text-gold-700 fill-gold-700 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 font-serif">REALTIME AI ASSESSMENT</h4>
            </div>

            <div className="space-y-4">
              {/* Priority Score circular gauge */}
              <div className="flex items-center gap-4 bg-gold-50/40 p-4 rounded-xl border border-gold-700/20">
                <div className="relative w-16 h-16 shrink-0">
                  <svg width="64" height="64" className="w-full h-full">
                    <circle cx="32" cy="32" r="26" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                    <circle 
                      cx="32" cy="32" r="26" fill="transparent" 
                      stroke={aiAnalysisPreview.priorityScore > 80 ? '#C89B3C' : aiAnalysisPreview.priorityScore > 50 ? '#0F2D52' : '#0E7C66'} 
                      strokeWidth="5" 
                      strokeDasharray={`${2 * Math.PI * 26}`} 
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - aiAnalysisPreview.priorityScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-navy-900 font-serif">
                    {aiAnalysisPreview.priorityScore}%
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase font-serif">Estimated Priority Rank</p>
                  <p className="text-sm font-bold text-navy-900 font-serif">
                    {aiAnalysisPreview.priorityScore > 80 ? 'Critical Priority' : aiAnalysisPreview.priorityScore > 50 ? 'Medium Priority' : 'Standard Priority'}
                  </p>
                  <p className="text-[10px] text-slate-600 leading-normal font-serif">Score calculated based on safety impact risk & location demographics</p>
                </div>
              </div>

              {/* Sentiment Analyzer */}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase font-serif">Detected Citizen Sentiment</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    aiAnalysisPreview.sentiment === 'Critical' 
                      ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                      : aiAnalysisPreview.sentiment === 'Neutral' 
                      ? 'bg-gold-50 text-gold-900 border border-gold-700/30' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {aiAnalysisPreview.sentiment}
                  </span>
                  <span className="text-[10px] text-slate-500 font-serif">Emotional severity classification</span>
                </div>
              </div>

              {/* Cost layout */}
              <div className="grid grid-cols-2 gap-3.5 bg-white p-3.5 rounded-xl border border-gold-700/20">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-serif font-bold">Cost Projection</p>
                  <p className="text-base font-bold text-navy-900 font-serif">₹{aiAnalysisPreview.costLakhs} L</p>
                  <p className="text-[8px] text-slate-400">Estim. outlay</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-serif font-bold">Voter Urgency</p>
                  <p className="text-base font-bold text-emerald-800 font-serif">{aiAnalysisPreview.demandLevel}</p>
                  <p className="text-[8px] text-slate-400">Predicted priority</p>
                </div>
              </div>

              {/* Help box */}
              <div className="text-[10px] text-slate-650 leading-relaxed bg-[#F5EFE6]/40 p-3 rounded-lg border border-gold-700/15">
                <p className="font-bold text-navy-900 mb-0.5 flex items-center gap-1 font-serif">
                  <AlertCircle className="w-3.5 h-3.5 text-gold-700" />
                  Did you know?
                </p>
                Including keywords like "accident", "hospital", "flood", "leakage", or "school children" allows the algorithm to trigger immediate safety prioritization flags.
              </div>
            </div>
          </div>

          {/* Quick FAQ info box */}
          <div className="bg-white rounded-2xl border border-gold-700/20 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-navy-900 mb-3 font-serif uppercase tracking-wider border-b border-slate-100 pb-1.5">Our Process After Submission</h4>
            <div className="space-y-3.5 text-xs text-slate-655 font-serif">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20">1</div>
                <p><strong>GPS Validation:</strong> Coords verified to prevent double entries or fraudulent bulk postings.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20">2</div>
                <p><strong>Clustering:</strong> Duplicate complaints grouped dynamically into a single priority hub.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20">3</div>
                <p><strong>MPLADS Review:</strong> MP audits high priority items on the executive Command board for quick fund allocation.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SUCCESS MODAL ON SUBMIT */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4" id="success-confirmation-modal">
          <div className="bg-white rounded-2xl p-6.5 max-w-md w-full shadow-2xl border border-gold-700/30 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mb-4 border border-emerald-250">
                <CheckCircle className="w-8 h-8 text-emerald-700" />
              </div>
              
              <h3 className="text-xl font-bold text-navy-900 font-serif">Request Lodged Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 font-serif">Thank you for participating in civic development innovation.</p>

              {/* Highlight ID box */}
              <div className="my-5 bg-[#FAF6E8] border border-gold-700/30 p-4.5 rounded-2xl w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold-900 font-serif">YOUR TRACKING ID</p>
                <p className="text-2xl font-bold text-[#0F2D52] font-serif tracking-widest">{createdID}</p>
                <p className="text-[10px] text-slate-600 font-serif mt-1">Keep this ID safe to track status and MP actions in the future.</p>
              </div>

              <div className="w-full text-left space-y-3 bg-gold-50/20 p-3.5 rounded-xl border border-gold-700/15 mb-5">
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-serif">
                  <CornerDownRight className="w-3.5 h-3.5 text-gold-700 shrink-0 mt-0.5" />
                  <span>Your local MP office has been instantly alerted via our priorization dashboard.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-serif">
                  <CornerDownRight className="w-3.5 h-3.5 text-gold-700 shrink-0 mt-0.5" />
                  <span>The request priority index scored <span className="font-bold text-navy-900">{aiAnalysisPreview.priorityScore}/100</span>.</span>
                </div>
              </div>

              <div className="flex gap-3.5 w-full">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onNavigateToTrack(createdID);
                  }}
                  className="flex-1 btn-gov-primary py-2.5 text-xs tracking-wider cursor-pointer"
                  id="btn-modal-track-req"
                >
                  Track Status Now
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setName('');
                    setContact('');
                    setLocality('');
                    setDescription('');
                    setUploadedFiles([]);
                  }}
                  className="flex-1 btn-gov-secondary py-2.5 text-xs tracking-wider cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
