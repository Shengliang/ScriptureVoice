
import React from 'react';
import { Database, RefreshCw, X, Clock } from './Icons';
import { Language, SearchResult } from '../types';
import { TRANSLATIONS } from '../constants/locales';

interface CacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCache: () => void;
  onGenerateNew: () => void;
  cachedData: SearchResult | null;
  language: Language;
}

const CacheModal: React.FC<CacheModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoadCache, 
  onGenerateNew, 
  cachedData,
  language 
}) => {
  if (!isOpen || !cachedData) return null;

  const t = TRANSLATIONS[language];
  const isOffline = !navigator.onLine;

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    // Use BCP 47 tag for date formatting if simple, or fallback to en-US
    const localeMap: Record<Language, string> = {
      en: 'en-US', 
      zh: 'zh-TW', 
      'zh-CN': 'zh-CN',
      ja: 'ja-JP', 
      ko: 'ko-KR', 
      fr: 'fr-FR', 
      it: 'it-IT', 
      de: 'de-DE',
      hi: 'hi-IN',
      es: 'es-ES',
      pt: 'pt-BR',
    };
    return new Date(ts).toLocaleString(localeMap[language]);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-bible-200">
        <div className="bg-bible-50 p-4 border-b border-bible-100 flex justify-between items-center">
          <h3 className="font-bold text-bible-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-bible-600" />
            {t.cacheFound}
          </h3>
          <button onClick={onClose} className="text-bible-400 hover:text-bible-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-bible-700 mb-4 text-sm leading-relaxed">
            {t.cacheMsg}
          </p>

          <div className="bg-stone-50 rounded-lg p-3 mb-6 border border-bible-100">
            <div className="font-bold text-bible-900">{cachedData.passage.reference}</div>
            <div className="text-xs text-bible-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {formatDate(cachedData.timestamp)}
            </div>
            <div className="text-xs text-bible-600 mt-2 line-clamp-2 italic">
              "{cachedData.passage.text}"
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onLoadCache}
              className="flex items-center justify-center gap-2 bg-bible-600 text-white py-3 rounded-xl font-medium hover:bg-bible-700 transition-colors shadow-sm"
            >
              <Database className="w-4 h-4" />
              {t.loadSaved}
            </button>

            <button
              onClick={onGenerateNew}
              disabled={isOffline}
              className={`
                flex items-center justify-center gap-2 border border-bible-300 py-3 rounded-xl font-medium transition-colors
                ${isOffline ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-bible-700 hover:bg-bible-50 hover:text-bible-900'}
              `}
            >
              <RefreshCw className="w-4 h-4" />
              {t.generateNew}
            </button>
          </div>
          
          {isOffline && (
            <p className="text-xs text-red-500 text-center mt-3">
              * {t.offlineMode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheModal;
