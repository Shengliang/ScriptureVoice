
export interface BiblePassage {
  reference: string;
  text: string;
  version: string;
  context?: string;
}

export interface SearchResult {
  passage: BiblePassage;
  summary: string;
  timestamp?: number;
}

export interface HistoryItem {
  key: string;
  query: string;
  reference: string;
  timestamp: number;
  language: Language;
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface AudioState {
  blobUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PlaylistItem {
  text: string;
  voice: VoiceName;
}

// Supported Languages for Gemini TTS
export type Language = 
  | 'en' // English
  | 'zh' // Mandarin Chinese (Traditional)
  | 'zh-CN' // Mandarin Chinese (Simplified)
  | 'hi' // Hindi
  | 'es' // Spanish
  | 'fr' // French
  | 'pt' // Portuguese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'it' // Italian
  | 'de'; // German
