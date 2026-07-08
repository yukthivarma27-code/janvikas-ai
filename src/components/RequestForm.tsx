import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CONSTITUENCIES, CATEGORY_COLORS } from '../mockData';
import { Category, Urgency, CitizenRequest, Language } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { prioritizeRequest, submitRequest } from '../services/api';
import { Mic, UploadCloud, MapPin, Sparkles, AlertCircle, CheckCircle, FileText, Compass, CornerDownRight } from 'lucide-react';

interface RequestFormProps {
  currentLang: Language;
  onAddRequest: (req: CitizenRequest) => void;
  onNavigateToTrack: (id: string) => void;
}

export default function RequestForm({ currentLang, onAddRequest, onNavigateToTrack }: RequestFormProps) {
  const { t } = useLanguage();
  // Form States
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [constituency, setConstituency] = useState('Visakhapatnam');
  const [mandal, setMandal] = useState('Bheemunipatnam');
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState<Category>('Roads');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  
  // Location simulation
  const [lat, setLat] = useState(17.89);
  const [lng, setLng] = useState(83.44);
  
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

  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
  const [verifiedGaps, setVerifiedGaps] = useState<string[]>([]);
  const [baselineData, setBaselineData] = useState<any>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch district and mandals based on selected constituency
  const constituencyData = CONSTITUENCIES.find(c => c.name === constituency) || CONSTITUENCIES[0];
  const district = constituencyData.district;

  useEffect(() => {
    // Auto-update first mandal when constituency changes
    if (constituencyData.mandals.length > 0) {
      setMandal(constituencyData.mandals[0]);
    }
    
    // Simulate latitude/longitude shift
    if (constituency === 'Visakhapatnam') { setLat(17.89); setLng(83.44); }
    else if (constituency === 'Varanasi') { setLat(25.3176); setLng(82.9739); }
    else if (constituency === 'Bengaluru South') { setLat(12.9716); setLng(77.5946); }
    else if (constituency === 'Hyderabad') { setLat(17.3850); setLng(78.4867); }
    else if (constituency === 'Pune') { setLat(18.5204); setLng(73.8567); }
    else if (constituency === 'Guntur') { setLat(16.3067); setLng(80.4365); }
    else if (constituency === 'Howrah') { setLat(22.5958); setLng(88.2636); }
    else if (constituency === 'Coimbatore') { setLat(11.0168); setLng(76.9558); }
    else if (constituency === 'Lucknow') { setLat(26.8467); setLng(80.9462); }
  }, [constituency]);

  // Handle Dynamic AI Analysis Calculations as user types description with a debounce!
  useEffect(() => {
    if (description.length < 20) {
      setAiAnalysisPreview({
        sentiment: 'Neutral',
        priorityScore: urgency === 'High' ? 65 : urgency === 'Medium' ? 45 : 25,
        costLakhs: 4.5,
        demandLevel: 'Medium'
      });
      setScoreBreakdown(null);
      setVerifiedGaps([]);
      setBaselineData(null);
      return;
    }

    setIsAnalyzing(true);
    const delayDebounceFn = setTimeout(() => {
      prioritizeRequest({ category, description, urgency, latitude: lat, longitude: lng, locality, mandal })
        .then(data => {
          if (data && !data.error) {
            setAiAnalysisPreview({
              sentiment: data.sentiment,
              priorityScore: data.priorityScore,
              costLakhs: data.estimatedCostLakhs,
              demandLevel: data.priorityScore > 80 ? 'Very High' : data.priorityScore > 60 ? 'High' : 'Medium'
            });
            setScoreBreakdown(data.scoreBreakdown);
            setVerifiedGaps(data.verifiedGaps || []);
            setBaselineData(data.baselineData);
          }
        })
        .catch(err => console.error('Error prioritizing:', err))
        .finally(() => setIsAnalyzing(false));
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [description, category, urgency, constituency, mandal, locality, lat, lng]);


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
      alert(t('fillRequiredAlert'));
      return;
    }

    setIsSubmitting(true);
    submitRequest({
      name,
      contact,
      constituency,
      district,
      mandal,
      locality: locality || 'Main Village Road',
      category,
      description,
      urgency,
      latitude: lat,
      longitude: lng,
      language: currentLang
    })
      .then(newRequest => {
        if (newRequest && !newRequest.error) {
          onAddRequest(newRequest);
          setCreatedID(newRequest.id);
          setShowSuccessModal(true);
        } else {
          alert('Error: ' + (newRequest.error || 'Failed to submit request'));
        }
      })
      .catch(err => {
        console.error('Error submitting request:', err);
        alert('Backend is currently unavailable. Demo data is being displayed.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
          {t('submitDevRequest')}
        </h2>
        <p className="text-slate-355 text-xs md:text-sm max-w-2xl mt-1 leading-relaxed font-serif">
          {t('formHeaderDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* The Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-gold-700/20 shadow-xs animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-5" id="citizen-form">
            
            {/* Row 1: Name and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">{t('yourFullName')}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('fullNamePlaceholder')} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-gov px-3.5 py-2.5 text-sm font-serif font-medium text-slate-800"
                  id="input-citizen-name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">{t('phoneEmail')}</label>
                <input 
                  type="text" 
                  required
                  placeholder={t('phoneEmailPlaceholder')} 
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">{t('constituency')}</label>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">{t('district')}</label>
                <input 
                  type="text" 
                  disabled
                  value={district}
                  className="w-full bg-slate-100 px-2.5 py-1.5 text-xs border border-gold-700/10 rounded-md text-slate-600 font-bold font-serif"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-serif">{t('mandalWard')}</label>
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
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5 font-serif">{t('localityVillage')}</label>
              <input 
                type="text" 
                placeholder={t('localityPlaceholder')} 
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full input-gov px-3.5 py-2.5 text-sm text-slate-800 font-serif font-medium"
                id="input-citizen-locality"
              />
            </div>

            {/* Category selection - Grid of Cards */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">{t('issueCategory')}</label>
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
                          : 'bg-white text-slate-655 border-gold-700/15 hover:bg-gold-50/40'
                      }`}
                    >
                      <div className={`p-1 rounded-md ${isSelected ? 'bg-gold-100 text-[#0F2D52]' : 'bg-slate-100 text-slate-500'}`}>
                        {cat === 'Roads' && <MapPin className="w-4 h-4 text-gold-700" />}
                        {cat === 'Education' && <FileText className="w-4 h-4 text-gold-700" />}
                        {cat === 'Healthcare' && <Sparkles className="w-4 h-4 text-gold-700" />}
                        {cat !== 'Roads' && cat !== 'Education' && cat !== 'Healthcare' && <FileText className="w-4 h-4 text-gold-700" />}
                      </div>
                      <span className="text-[10px] font-bold tracking-tight font-serif">{t(cat)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Area & Voice Assist */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider font-serif">{t('detailedDescription')}</label>
                
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
                  {isRecording ? t('listening') : t('voiceAssist')}
                </button>
              </div>

              <textarea 
                rows={4}
                required
                placeholder={t('descPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full input-gov px-3.5 py-2.5 text-sm text-slate-800 font-serif"
                id="textarea-citizen-description"
              />

              {description.length > 0 && description.length < 15 && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5 font-medium font-serif">
                  <AlertCircle className="w-3 h-3 text-gold-700" /> {t('minCharWarning')}
                </p>
              )}
            </div>

            {/* Urgency Level & Document Upload Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Urgency */}
              <div className="bg-gold-50/40 p-4 rounded-xl border border-gold-700/15">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">{t('urgencyLevel')}</label>
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
                      {t(level.toLowerCase())}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Upload dropzone */}
              <div className="bg-gold-50/40 p-4 rounded-xl border border-gold-700/15 flex flex-col justify-center">
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 font-serif">{t('supportingPhotos')}</label>
                <div className="border border-dashed border-gold-700/30 hover:border-gold-700 bg-white rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer relative transition-all">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <UploadCloud className="w-5 h-5 text-gold-700 mb-1" />
                  <p className="text-[10px] text-slate-600 font-serif font-bold">{t('uploadClick')}</p>
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
                <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider font-serif">{t('coordsVerification')}</label>
                <span className="text-[10px] font-mono bg-navy-50 text-navy-900 border border-gold-700/20 px-2 py-0.5 rounded-sm">{t('gpsLocked')}</span>
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
                    <MapPin className="w-3.5 h-3.5 text-gold-700" /> {t('recalibrateLoc')}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className={`w-full btn-gov-primary py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md ${(isSubmitting || isAnalyzing) ? 'opacity-70 cursor-not-allowed' : ''}`}
                id="btn-citizen-submit"
              >
                <Sparkles className="w-4.5 h-4.5 text-gold-600 fill-gold-600 animate-pulse" />
                {isSubmitting ? t('submittingBtn') : t('submitRequestBtn')}
              </button>
            </div>

          </form>
        </div>

        {/* Dynamic AI Analysis Side Widget */}
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white card-gov p-5 md:p-6 relative overflow-hidden" id="realtime-nlp-preview">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-200 rounded-full blur-2xl opacity-15 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4 border-b border-gold-700/15 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-700 fill-gold-700 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 font-serif">{t('realtimeAssessment')}</h4>
              </div>
              {isAnalyzing && (
                <span className="text-[10px] text-gold-800 font-bold animate-pulse">{t('analyzing')}</span>
              )}
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
                  <p className="text-[9px] text-slate-500 font-bold uppercase font-serif">{t('priorityRank')}</p>
                  <p className="text-sm font-bold text-navy-900 font-serif">
                    {aiAnalysisPreview.priorityScore > 80 ? t('criticalPriority') : aiAnalysisPreview.priorityScore > 50 ? t('mediumPriority') : t('standardPriority')}
                  </p>
                  <p className="text-[10px] text-slate-605 leading-normal font-serif">{t('scoreCalcDesc')}</p>
                </div>
              </div>

              {/* Sentiment Analyzer */}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-500 uppercase font-serif">{t('detectedSentiment')}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    aiAnalysisPreview.sentiment === 'Critical' 
                      ? 'bg-rose-50 text-rose-800 border border-rose-205' 
                      : aiAnalysisPreview.sentiment === 'Neutral' 
                      ? 'bg-gold-50 text-gold-900 border border-gold-700/30' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-205'
                  }`}>
                    {t(aiAnalysisPreview.sentiment) || aiAnalysisPreview.sentiment}
                  </span>
                  <span className="text-[10px] text-slate-500 font-serif">{t('emotionalSeverity')}</span>
                </div>
              </div>              
              {/* Cost layout */}
              <div className="grid grid-cols-2 gap-3.5 bg-white p-3.5 rounded-xl border border-gold-700/20">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-serif font-bold">{t('costProjection')}</p>
                  <p className="text-base font-bold text-navy-900 font-serif">₹{aiAnalysisPreview.costLakhs} L</p>
                  <p className="text-[8px] text-slate-400">{t('estimOutlay')}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-serif font-bold">{t('voterUrgency')}</p>
                  <p className="text-base font-bold text-emerald-800 font-serif">{t(aiAnalysisPreview.demandLevel) || aiAnalysisPreview.demandLevel}</p>
                  <p className="text-[8px] text-slate-400">{t('predictedPriority')}</p>
                </div>
              </div>

              {/* Verified Data Checks */}
              {baselineData && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-gold-700/15 text-xs text-slate-700">
                  <p className="text-[9px] font-bold text-[#0F2D52] uppercase font-serif tracking-wider border-b border-gold-700/10 pb-1">
                    ✓ {t('verifiedOgd')}
                  </p>
                  <div className="space-y-1.5 text-[11px] font-serif leading-relaxed">
                    <p className="flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span>
                      <strong>LGD lookup:</strong> {baselineData.villageName} Village (Mandal: {baselineData.mandalName})
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span>
                      <strong>Census Pop:</strong> {baselineData.totalPopulation?.toLocaleString()} (SC/ST: {Math.round((baselineData.scStPopulation || 0) / (baselineData.totalPopulation || 1) * 100)}%)
                    </p>
                    
                    {category === 'Education' && baselineData.schoolCode && (
                      <div className="pl-3 mt-1 space-y-0.5 border-l border-gold-700/20">
                        <p className="text-[10px] text-slate-500 font-bold">UDISE+ SCHOOL DIRECTORY VERIFICATION:</p>
                        <p className="font-bold">🏫 {baselineData.schoolName}</p>
                        <p>• Toilets: {baselineData.schoolToilets ? '✅ Present' : '❌ Lacking (TOILET_GAP)'}</p>
                        <p>• Water: {baselineData.schoolWater ? '✅ Present' : '❌ Lacking (WATER_GAP)'}</p>
                        <p>• Student-Teacher Ratio: <span className={baselineData.pupilTeacherRatio > 30 ? 'text-rose-600 font-bold' : ''}>{baselineData.pupilTeacherRatio}:1</span></p>
                      </div>
                    )}

                    {(category === 'Water' || category === 'Sanitation') && baselineData.totalHouseholds && (
                      <div className="pl-3 mt-1 space-y-0.5 border-l border-gold-700/20">
                        <p className="text-[10px] text-slate-500 font-bold">JAL JEEVAN MISSION DIRECTORY VERIFICATION:</p>
                        <p>💧 JJM Connections: <span className="font-bold">{baselineData.tapConnectionsPercentage}%</span></p>
                        <p>🧪 Quality Check: <span className={baselineData.waterQualityStatus !== 'Safe' ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>{baselineData.waterQualityStatus}</span></p>
                      </div>
                    )}

                    {category === 'Healthcare' && baselineData.nearestFacilityName && (
                      <div className="pl-3 mt-1 space-y-0.5 border-l border-gold-700/20">
                        <p className="text-[10px] text-slate-500 font-bold">HEALTH FACILITY REGIFICATION:</p>
                        <p className="font-bold">🏥 Closest: {baselineData.nearestFacilityName} ({baselineData.nearestFacilityDistanceKm} km)</p>
                        <p>• Capacity: {baselineData.nearestFacilityBeds} Beds, {baselineData.nearestFacilityDoctors} Doctors</p>
                      </div>
                    )}

                    {verifiedGaps.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {verifiedGaps.map(gap => (
                          <span key={gap} className="text-[9px] bg-rose-50 text-rose-800 border border-rose-205 px-1.5 py-0.5 rounded font-mono font-bold">
                            {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Priority Score Breakdown Chart */}
              {scoreBreakdown && (
                <div className="space-y-2 bg-[#FAF6E8]/45 p-3.5 rounded-xl border border-gold-700/15 text-xs text-slate-700">
                  <p className="text-[9px] font-bold text-navy-900 uppercase font-serif tracking-wider border-b border-gold-700/10 pb-1">
                    📊 {t('explainableAi')}
                  </p>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Sentiment Factor (15%)</span>
                        <span>{scoreBreakdown.sentiment} / 15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.sentiment / 15) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>User-reported Urgency (10%)</span>
                        <span>{scoreBreakdown.urgency} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.urgency / 10) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Local Demand (Upvotes) (15%)</span>
                        <span>{scoreBreakdown.upvotes} / 15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.upvotes / 15) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-650 font-sans">
                        <span>Population Density (15%)</span>
                        <span>{scoreBreakdown.density} / 15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.density / 15) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Antyodaya Deprivation (15%)</span>
                        <span>{scoreBreakdown.antyodaya} / 15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.antyodaya / 15) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Verified Structural Gaps (20%)</span>
                        <span>{scoreBreakdown.infraGap} / 20</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0F2D52] h-full" style={{ width: `${(scoreBreakdown.infraGap / 20) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Disaster & hazard Risk (10%)</span>
                        <span>{scoreBreakdown.disasterRisk} / 10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold-600 h-full" style={{ width: `${(scoreBreakdown.disasterRisk / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Help box */}
              <div className="text-[10px] text-slate-655 leading-relaxed bg-[#F5EFE6]/40 p-3 rounded-lg border border-gold-700/15">
                <p className="font-bold text-navy-900 mb-0.5 flex items-center gap-1 font-serif">
                  <AlertCircle className="w-3.5 h-3.5 text-gold-700" />
                  {t('evidenceScoring')}
                </p>
                {t('evidenceScoringDesc')}
              </div>
            </div>
          </div>

          {/* Quick FAQ info box */}
          <div className="bg-white rounded-2xl border border-gold-700/20 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-navy-900 mb-3 font-serif uppercase tracking-wider border-b border-slate-100 pb-1.5">{t('ourProcessTitle')}</h4>
            <div className="space-y-3.5 text-xs text-slate-655 font-serif">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20 font-sans">1</div>
                <p><strong>{t('processStep1')}:</strong> {t('processStep1Desc')}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20 font-sans">2</div>
                <p><strong>{t('processStep2')}:</strong> {t('processStep2Desc')}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gold-50 text-gold-900 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-700/20 font-sans">3</div>
                <p><strong>{t('processStep3')}:</strong> {t('processStep3Desc')}</p>
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
              
              <h3 className="text-xl font-bold text-navy-900 font-serif">{t('reqSuccess')}</h3>
              <p className="text-xs text-slate-500 mt-1 font-serif">{t('reqSuccessSub')}</p>

              {/* Highlight ID box */}
              <div className="my-5 bg-[#FAF6E8] border border-gold-700/30 p-4.5 rounded-2xl w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold-900 font-serif">{t('yourTrackingId')}</p>
                <p className="text-2xl font-bold text-[#0F2D52] font-serif tracking-widest">{createdID}</p>
                <p className="text-[10px] text-slate-600 font-serif mt-1">{t('trackingIdDesc')}</p>
              </div>

              <div className="w-full text-left space-y-3 bg-gold-50/20 p-3.5 rounded-xl border border-gold-700/15 mb-5">
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-serif">
                  <CornerDownRight className="w-3.5 h-3.5 text-gold-700 shrink-0 mt-0.5" />
                  <span>{t('mpAlerted')}</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-600 font-serif">
                  <CornerDownRight className="w-3.5 h-3.5 text-gold-700 shrink-0 mt-0.5" />
                  <span>{t('priorityIndexScored')} <span className="font-bold text-navy-900">{aiAnalysisPreview.priorityScore}/100</span>.</span>
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
                  {t('trackStatusNow')}
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
                  {t('submitAnother')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
