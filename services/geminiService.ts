
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { SearchResult, VoiceName, Language, HistoryItem } from "../types";
import { decodeBase64, pcmToWav } from "../utils/audioUtils";

// --- Rate Limiting Queue ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple queue to space out requests to avoid 429 errors
let requestQueue = Promise.resolve();

const queueRequest = <T>(task: () => Promise<T>, spacingMs: number = 1000): Promise<T> => {
  const next = requestQueue.then(async () => {
    const result = await task();
    await delay(spacingMs);
    return result;
  });
  // @ts-ignore
  requestQueue = next.catch(() => {}); // catch errors so queue continues
  return next;
};

// --- API Key Management ---
let serverApiKey: string | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;
let initError: string | null = null;

// Initialize: Fetch key from server if available
const initApiKey = async (retries = 2) => {
  if (isInitialized && serverApiKey) return;
  
  try {
    // Add timestamp to prevent caching on mobile devices
    const response = await fetch(`/api/config?t=${Date.now()}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.apiKey) {
        serverApiKey = data.apiKey;
        initError = null;
      } else {
        console.warn("Server is online but API_KEY is not set.");
        initError = "Server Online (No Key Configured)";
      }
    } else {
      console.warn("Server config endpoint returned status:", response.status);
      if (response.status === 404 && retries > 0) {
         await delay(1000);
         return initApiKey(retries - 1);
      }
      initError = `Server Status: ${response.status}`;
    }
  } catch (e: any) {
    console.warn("Could not fetch API config (Network error or Offline).");
    if (retries > 0) {
        await delay(1000);
        return initApiKey(retries - 1);
    }
    initError = "Network Error / Offline";
  } finally {
    isInitialized = true;
  }
};

// Helper to ensure we wait for the key before searching
const ensureInit = async () => {
  if (!initPromise) {
    initPromise = initApiKey();
  }
  await initPromise;
  
  // If failed, try one more time if it's been a while or logic flow demands it
  if (!serverApiKey && initError === "Network Error / Offline") {
      await initApiKey(0);
  }
};

// Helper to parse API errors
const handleApiError = (error: any, context: string) => {
  const msg = error?.message || error?.toString() || '';
  console.error(`${context} error:`, error);
  
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
    throw new Error(`⚠️ AI Quota Exceeded. The free tier limit has been reached for ${context}. Please wait a minute.`);
  }
  if (msg.includes('503') || msg.includes('Overloaded')) {
    throw new Error(`⚠️ AI Service Overloaded. Please try again in a few seconds.`);
  }
  if (msg.includes('403') || msg.includes('API key not valid')) {
    throw new Error(`❌ Invalid API Key. Please check your Settings.`);
  }
  throw error;
};

// Helper to get AI instance
const getAI = () => {
  // 1. Check LocalStorage (User Override) - Allows bypassing 429 on shared key
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('user_api_key') : null;
  
  // 2. Check Server-Provided Key
  // 3. Check Build-Time Env Var (Fallback)
  const apiKey = localKey || serverApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("No API Key found. Please configure it in Settings or Server Env Vars.");
  }
  
  // @ts-ignore
  return new GoogleGenAI({ apiKey: apiKey, headers: { 'x-client-version': '5.7.0' } });
};

// --- Diagnostics API (For Settings Modal) ---
export const getDiagnostics = async () => {
  await initApiKey(0);
  const localKey = localStorage.getItem('user_api_key');
  return {
    serverReachable: !initError || initError === "Server Online (No Key Configured)",
    serverHasKey: !!serverApiKey,
    usingLocalKey: !!localKey,
    activeKeySource: localKey ? 'Local Override' : (serverApiKey ? 'Server Default' : 'None'),
    lastInitError: initError
  };
};

export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await ensureInit();
    const ai = getAI();
    const result = await ai.models.countTokens({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: "Ping" }] }]
    });
    return { success: true, message: `Connected! Tokens: ${result.totalTokens}` };
  } catch (e: any) {
    let msg = e.message || "Unknown Error";
    if (msg.includes('429')) msg = "Quota Exceeded (429)";
    if (msg.includes('403')) msg = "Invalid Key (403)";
    if (msg.includes('No API Key')) msg = "Missing API Key";
    return { success: false, message: msg };
  }
};

const STORAGE_KEY = 'scripture_voice_cache_v3';

// Load cache from LocalStorage
const loadCache = (): Map<string, any> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Map(JSON.parse(stored));
    }
  } catch (e) {
    console.warn("Failed to load cache from local storage", e);
  }
  return new Map();
};

const searchCache = loadCache();

const persistCache = () => {
  try {
    if (searchCache.size > 100) {
      const keys = Array.from(searchCache.keys());
      for (let i = 0; i < 20; i++) {
        searchCache.delete(keys[i]);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(searchCache.entries())));
  } catch (e) {
    console.warn("LocalStorage quota exceeded. Cleaning up old entries...");
    try {
      const keys = Array.from(searchCache.keys());
      for (let i = 0; i < Math.floor(keys.length / 2); i++) {
        searchCache.delete(keys[i]);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(searchCache.entries())));
    } catch (e2) {
      console.error("Failed to save cache even after cleanup", e2);
    }
  }
};

// --- Cache Management API ---

export const checkCacheExistence = (query: string, language: Language): SearchResult | null => {
  const cacheKey = `verse_v1_${language}_${query.trim().toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as SearchResult;
  }
  return null;
};

export const getSavedHistory = (language: Language): HistoryItem[] => {
  const history: HistoryItem[] = [];
  
  searchCache.forEach((value, key) => {
    if (key.startsWith(`verse_v1_${language}_`)) {
      const result = value as SearchResult;
      history.push({
        key: key,
        query: key.split('_').pop() || 'Unknown',
        reference: result.passage.reference,
        timestamp: result.timestamp || Date.now(),
        language: language
      });
    }
  });

  return history.sort((a, b) => b.timestamp - a.timestamp);
};

// --- API Functions ---

const getLanguagePrompt = (language: Language): string => {
  switch (language) {
    case 'zh': return "Return result in Traditional Chinese (Chinese Union Version).";
    case 'zh-CN': return "Return result in Simplified Chinese (Chinese Union Version Simplified).";
    case 'ja': return "Return result in Japanese (Interconfessional translation).";
    case 'ko': return "Return result in Korean (Korean Revised Version).";
    case 'fr': return "Return result in French (Louis Segond).";
    case 'it': return "Return result in Italian (Nuova Riveduta).";
    case 'de': return "Return result in German (Lutherbibel).";
    case 'hi': return "Return result in Hindi (Hindi Bible BSI).";
    case 'es': return "Return result in Spanish (Reina-Valera 1960).";
    case 'pt': return "Return result in Portuguese (João Ferreira de Almeida).";
    default: return "Return result in English (NIV/ESV).";
  }
};

const getDevotionalLangPrompt = (language: Language): string => {
  switch (language) {
    case 'zh': return "Write in Traditional Chinese.";
    case 'zh-CN': return "Write in Simplified Chinese.";
    case 'ja': return "Write in Japanese.";
    case 'ko': return "Write in Korean.";
    case 'fr': return "Write in French.";
    case 'it': return "Write in Italian.";
    case 'de': return "Write in German.";
    case 'hi': return "Write in Hindi.";
    case 'es': return "Write in Spanish.";
    case 'pt': return "Write in Portuguese.";
    default: return "Write in English.";
  }
};

export const searchVerseOnly = async (
  query: string,
  language: Language = 'en',
  forceRefresh: boolean = false
): Promise<SearchResult> => {
  // Critical: Wait for server config
  await ensureInit();

  const cacheKey = `verse_v1_${language}_${query.trim().toLowerCase()}`;
  
  if (!forceRefresh && searchCache.has(cacheKey)) {
    console.debug("Cache hit for verse:", query);
    return searchCache.get(cacheKey) as SearchResult;
  }

  try {
    if (!navigator.onLine) {
      const errorMsg = language === 'en' ? "You are offline and this verse is not cached." : "Offline mode: Verse not cached.";
      throw new Error(errorMsg);
    }

    const langPrompt = getLanguagePrompt(language);
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the single most relevant Bible passage for: "${query}".
      ${langPrompt}
      Return ONLY the bible text in JSON format. No devotional context yet.
      Fields: 'reference', 'text', 'version', 'summary' (1 sentence).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passage: {
              type: Type.OBJECT,
              properties: {
                reference: { type: Type.STRING },
                text: { type: Type.STRING },
                version: { type: Type.STRING },
              },
              required: ["reference", "text", "version"],
            },
            summary: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini.");
    const result = JSON.parse(text) as SearchResult;
    
    result.timestamp = Date.now();
    
    searchCache.set(cacheKey, result);
    persistCache();
    
    return result;
  } catch (error) {
    handleApiError(error, "Verse Search");
    throw error;
  }
};

export const generateDevotional = async (
  reference: string,
  bibleText: string,
  language: Language,
  lengthMinutes: number,
  forceRefresh: boolean = false
): Promise<string> => {
  await ensureInit();

  const cacheKey = `context_v1_${language}_${lengthMinutes}_${reference.replace(/\s+/g, '_')}`;
  
  if (!forceRefresh && searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as string;
  }
  
  try {
    if (!navigator.onLine) return "";

    const targetWordCount = Math.max(100, lengthMinutes * 160);
    const langPrompt = getDevotionalLangPrompt(language);
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a deep, inspiring devotional for this Bible passage:
      Reference: ${reference}
      Text: "${bibleText}"
      
      ${langPrompt}
      Requirements:
      - Historical background
      - Theological depth
      - Practical application
      - Length: Approximately ${targetWordCount} words (for ${lengthMinutes} minutes reading).
      - Tone: Warm, pastoral, encouraging.`,
      config: {
        responseMimeType: "text/plain", 
      },
    });

    const text = response.text || "";
    
    if (text) {
      searchCache.set(cacheKey, text);
      persistCache();
    }

    return text;
  } catch (error) {
    console.error("Devotional generation error:", error);
    return "Could not generate devotional context (Quota exceeded or Network error).";
  }
};

export const generateSongLyrics = async (
  reference: string,
  bibleText: string,
  language: Language
): Promise<string> => {
  await ensureInit();

  const cacheKey = `song_v2_${language}_${reference.replace(/\s+/g, '_')}`;
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as string;
  }

  try {
    if (!navigator.onLine) throw new Error("Offline");

    const langPrompt = getDevotionalLangPrompt(language).replace("Write in", "Write lyrics in");
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a Creative Song Transcript (Lyrics) based on this scripture:
      Reference: ${reference}
      Text: "${bibleText}"
      ${langPrompt}
      Include Title, Verses, Chorus, Bridge.`,
      config: {
        responseMimeType: "text/plain",
      },
    });

    const text = response.text || "";
    if (text) {
      searchCache.set(cacheKey, text);
      persistCache();
    }
    return text;
  } catch (error) {
    handleApiError(error, "Song Generation");
    throw error;
  }
};

export const generateSegmentSpeech = async (
  text: string,
  voice: VoiceName
): Promise<string> => {
  await ensureInit();

  if (!text || !text.trim()) {
    throw new Error("TTS text is empty");
  }

  // Wrap the actual AI call in the queue function
  return queueRequest(async () => {
    const ai = getAI();
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: text }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });

        if (!response.candidates || response.candidates.length === 0) {
           throw new Error("Gemini API returned no candidates (Safety Block?)");
        }

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          if (attempt === 3) throw new Error("No audio data returned.");
          continue; 
        }

        const pcmData = decodeBase64(base64Audio);
        const wavBlob = pcmToWav(pcmData, 24000);
        
        return URL.createObjectURL(wavBlob);
      } catch (error: any) {
        lastError = error;
        // Don't retry on fatal errors
        if (error.message && (error.message.includes("Safety") || error.message.includes("429") || error.message.includes("403"))) {
          throw error; 
        }
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        }
      }
    }
    
    handleApiError(lastError, "Speech Generation");
    throw lastError;
  }, 1000);
};

// Helper for image cache key hashing
const getTextHash = (text: string) => {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return hash;
};

export const getCachedImage = (text: string): string | null => {
  const cacheKey = `image_v1_${getTextHash(text)}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as string;
  }
  return null;
};

export const generateBibleImage = async (
  bibleText: string
): Promise<string> => {
  await ensureInit();

  const cacheKey = `image_v1_${getTextHash(bibleText)}`;
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) as string;
  }

  try {
    if (!navigator.onLine) throw new Error("Offline");

    const ai = getAI();

    // Use gemini-2.5-flash-image for image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a dignified, classical oil painting depicting the themes in this bible verse: "${bibleText.substring(0, 300)}..."` }
        ]
      },
    });

    let imageUrl = "";
    
    // Parse response for inline image data
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    if (imageUrl) {
      searchCache.set(cacheKey, imageUrl);
      persistCache();
      return imageUrl;
    }
    
    throw new Error("No image data in response");

  } catch (error) {
    handleApiError(error, "Image Generation");
    throw error;
  }
};
