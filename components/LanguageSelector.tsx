
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { Globe, ChevronDown } from './Icons';

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'hi', label: 'हिन्दी' }, // Hindi
  { code: 'es', label: 'Español' }, // Spanish
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' }, // Portuguese
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-bible-50 hover:bg-bible-100 rounded-lg px-3 py-2 border border-bible-200 text-sm text-bible-700 transition-all whitespace-nowrap"
      >
        <Globe className="w-4 h-4 text-bible-500" />
        <span className="font-medium">{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 text-bible-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-bible-100 py-1 z-50 animate-fade-in max-h-80 overflow-y-auto custom-scrollbar">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-bible-50 transition-colors ${
                language === lang.code ? 'text-bible-900 font-bold bg-bible-50' : 'text-bible-600'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
