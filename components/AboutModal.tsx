import React from 'react';
import { X, Cpu, Layers, Database, Share2, FileText, ImageIcon, Volume2 } from './Icons';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/locales';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-bible-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-bible-900">
            <FileText className="w-5 h-5 text-bible-600" />
            <h2 className="text-lg font-bold font-display">
              {t.howItWorks}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-bible-400 hover:bg-bible-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 text-bible-800">
          
          {/* Intro */}
          <section>
            <p className="leading-relaxed text-bible-700">
              {t.aboutIntro}
            </p>
          </section>

          {/* Architecture */}
          <section>
            <h3 className="flex items-center gap-2 font-bold text-bible-900 mb-4 text-lg">
              <Layers className="w-5 h-5 text-bible-500" />
              {t.systemArch}
            </h3>
            <div className="bg-bible-50 rounded-xl p-5 border border-bible-100 space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-bible-600 font-bold">1</div>
                <div>
                  <strong className="block text-bible-900 mb-1">Intelligent Search (Gemini 2.5)</strong>
                  <p className="text-bible-600">
                    Uses Google Gemini 2.5 Flash to understand your voice or text query, locate the most relevant scripture, and author a deep devotional context.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-bible-600 font-bold">2</div>
                <div>
                  <strong className="block text-bible-900 mb-1">Text-to-Speech (TTS)</strong>
                  <p className="text-bible-600">
                    Splits the generated text into segments and calls the Gemini TTS engine in parallel to generate a natural, gapless audio stream (PCM to WAV conversion).
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-bible-600 font-bold">3</div>
                <div>
                  <strong className="block text-bible-900 mb-1">Visual Generation (Imagen 4)</strong>
                  <p className="text-bible-600">
                     Simultaneously invokes the Imagen 4.0 model to generate a biblical-style oil painting based on the verse context.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h3 className="flex items-center gap-2 font-bold text-bible-900 mb-4 text-lg">
              <Cpu className="w-5 h-5 text-bible-500" />
              {t.techCore}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border border-bible-200 rounded-lg flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-bold text-bible-900">Gemini 2.5 Flash</div>
                  <div className="text-xs text-bible-500">Logic & Reasoning</div>
                </div>
              </div>
              <div className="p-3 border border-bible-200 rounded-lg flex items-center gap-3">
                <Volume2 className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="font-bold text-bible-900">Gemini TTS</div>
                  <div className="text-xs text-bible-500">Voice Generation</div>
                </div>
              </div>
              <div className="p-3 border border-bible-200 rounded-lg flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-pink-500" />
                <div>
                  <div className="font-bold text-bible-900">Imagen 4.0</div>
                  <div className="text-xs text-bible-500">Image Generation</div>
                </div>
              </div>
              <div className="p-3 border border-bible-200 rounded-lg flex items-center gap-3">
                <Layers className="w-8 h-8 text-teal-500" />
                <div>
                  <div className="font-bold text-bible-900">React + Vite</div>
                  <div className="text-xs text-bible-500">Frontend Framework</div>
                </div>
              </div>
            </div>
          </section>

          {/* Inspiration */}
          <section className="bg-gradient-to-br from-stone-100 to-bible-100 rounded-2xl p-6 border border-bible-200">
            <h3 className="flex items-center gap-2 font-bold text-bible-900 mb-3 text-lg">
              <Share2 className="w-5 h-5 text-bible-600" />
              {t.createOwn}
            </h3>
            <p className="text-sm text-bible-700 mb-4 leading-relaxed">
              {t.inspirationIntro}
            </p>
            <ul className="space-y-2 text-sm text-bible-800 list-disc pl-5 mb-4">
              <li>
                <strong>History AI:</strong> Type a year, get an immersive radio drama of historical events.
              </li>
              <li>
                <strong>Science Tutor:</strong> Explain complex concepts (like Quantum Mechanics) with diagrams and voice.
              </li>
              <li>
                <strong>News Brief:</strong> Aggregate news on specific topics to generate a personalized morning briefing.
              </li>
            </ul>
            <p className="text-xs text-bible-500 italic">
              You are welcome to base your own projects on this architecture. Unleash your talent and share it with the world!
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutModal;