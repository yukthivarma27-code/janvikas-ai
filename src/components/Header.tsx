import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../mockData';
import { useLanguage } from '../i18n/LanguageContext';
import { Landmark, Languages, ShieldAlert, User, Bell, Radio } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isAdminMode: boolean;
  onModeToggle: (isAdmin: boolean) => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Header({
  currentLang,
  onLangChange,
  isAdminMode,
  onModeToggle,
  activeView,
  onNavigate
}: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full nav-glass" id="main-header">
      {/* Top Banner indicating Indian Gov Innovation Hub */}
      <div className="w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] text-[10px] md:text-xs font-bold py-1 px-4 flex justify-between items-center text-slate-800 border-b border-gold-700/20">
        <div className="flex items-center gap-1.5">
          <span className="bg-navy-900 text-[#FAF6E8] px-1.5 py-0.2 rounded text-[9px] border border-gold-700/30">{t('govtOfIndia')}</span>
          <span className="hidden sm:inline tracking-wide font-serif text-navy-950">{t('ministryTitle')}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-900">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-red-600 animate-pulse" />
            {t('liveCivicTracker')}
          </span>
          <span className="hidden md:inline text-gold-700">|</span>
          <span className="hidden md:inline">{t('serverLocation')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo and Title */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none" 
          onClick={() => onNavigate('landing')}
          id="brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-gold-700 border border-gold-700/50 shadow-md">
            <Landmark className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-navy-900">JanVikas AI</span>
              <span className="bg-gold-50 text-gold-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gold-700/20">v2.1</span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-650 font-serif italic font-medium">{t('mpRequestPrioritizationSystem')}</p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Language Selector */}
          <div className="relative group flex items-center gap-1 bg-ivory border border-gold-700/30 rounded-lg px-2.5 py-1.5 text-xs text-navy-900 hover:bg-gold-50 transition-colors">
            <Languages className="w-4 h-4 text-gold-700" />
            <select 
              value={currentLang} 
              onChange={(e) => onLangChange(e.target.value as Language)}
              className="bg-transparent font-serif font-bold focus:outline-hidden cursor-pointer"
              id="language-select-dropdown"
            >
              {Object.entries(LANGUAGES).map(([code, data]) => (
                <option key={code} value={code} className="text-navy-950 font-serif">
                  {data.native} ({data.name})
                </option>
              ))}
            </select>
          </div>

          {/* Role/Mode Switcher - Beautiful Dual Segment Toggle */}
          <div className="bg-beige-100 p-1 rounded-full flex items-center border border-gold-700/20 shadow-inner">
            <button
              onClick={() => {
                onModeToggle(false);
                onNavigate('landing');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                !isAdminMode 
                  ? 'bg-navy-900 text-white shadow-sm border border-gold-700/40' 
                  : 'text-slate-600 hover:text-navy-900 hover:bg-white/40'
              }`}
              id="btn-switch-citizen"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('citizenPortal')}</span>
            </button>
            <button
              onClick={() => {
                onModeToggle(true);
                onNavigate('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isAdminMode 
                  ? 'bg-navy-900 text-gold-600 shadow-sm border border-gold-700/40 font-bold' 
                  : 'text-slate-600 hover:text-navy-900 hover:bg-white/40'
              }`}
              id="btn-switch-admin"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-gold-700" />
              <span className="hidden sm:inline">{t('mpCenter')}</span>
            </button>
          </div>

          {/* Notifications Bell Mockup */}
          <button className="relative p-2 text-slate-500 hover:text-navy-900 hover:bg-gold-50 rounded-full transition-colors hidden sm:flex border border-gold-700/10">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
