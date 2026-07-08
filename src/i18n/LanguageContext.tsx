import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from './translations';

interface LanguageContextProps {
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('janvikas_language');
      const validLanguages: Language[] = ['en', 'hi', 'te', 'ta', 'kn', 'mr', 'bn', 'ur'];
      if (saved && validLanguages.includes(saved as Language)) {
        return saved as Language;
      }
    } catch (e) {
      console.error('Error reading language from localStorage:', e);
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('janvikas_language', lang);
    } catch (e) {
      console.error('Error saving language to localStorage:', e);
    }
  };

  const t = (key: string): string => {
    if (!key) return '';
    const langTrans = translations[currentLang];
    const val = langTrans ? langTrans[key] : undefined;
    if (val !== undefined) return val;

    const enTrans = translations.en[key];
    if (enTrans !== undefined) return enTrans;

    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
