
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Loader2, Volume2, ImageIcon, Menu, ChevronLeft, ChevronRight, Info, Sparkles, Music, Copy, Check, History, WifiOff, Download, Share2, ClipboardCopy, ExternalLink, Settings } from './components/Icons';
import SearchBox from './components/SearchBox';
import VoiceSelector from './components/VoiceSelector';
import LanguageSelector from './components/LanguageSelector';
import LengthSelector from './components/LengthSelector';
import AudioPlayer from './components/AudioPlayer';
import BibleNavigation from './components/BibleNavigation';
import AboutModal from './components/AboutModal';
import CacheModal from './components/CacheModal';
import HistorySidebar from './components/HistorySidebar';
import SettingsModal from './components/SettingsModal';
import { SearchResult, VoiceName, Language, PlaylistItem } from './types';
import { searchVerseOnly, generateDevotional, generateSegmentSpeech, generateBibleImage, generateSongLyrics, checkCacheExistence, getCachedImage } from './services/geminiService';
import { splitTextIntoChunks } from './utils/audioUtils';
import { getAdjacentChapterQuery } from './utils/bibleNavigation';
import { TRANSLATIONS } from './constants/locales';

const App: React.FC = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(false);
  
  // --- Audio Streaming State ---
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentAudioTitle, setCurrentAudioTitle] = useState<string>("");
  
  const audioCache = useRef<Record<number, string>>({});
  const audioPromises = useRef<Record<number, Promise<string>>>({});

  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Fenrir);
  const [podcastLength, setPodcastLength] = useState<number>(1); 
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // --- Song/Lyrics State ---
  const [songLyrics, setSongLyrics] = useState<string | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);

  // --- PDF/Share State ---
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>('en');
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Cache Logic State ---
  const [pendingCacheData, setPendingCacheData] = useState<SearchResult | null>(null);
  const [pendingQuery, setPendingQuery] = useState<string>('');

  const CLIENT_VERSION = "5.8.0";
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetAudioState = () => {
    setAudioUrl(undefined);
    setPlaylist([]);
    setCurrentChunkIndex(0);
    audioCache.current = {};
    audioPromises.current = {};
    setIsGeneratingAudio(false);
    setIsBuffering(false);
    setCurrentAudioTitle("");
  };

  const resetContentState = () => {
    setSearchResult(null);
    resetAudioState();
    setGeneratedImageUrl(null);
    setSongLyrics(null);
    setIsLoadingDevotional(false);
    setIsGeneratingImage(false);
    setIsGeneratingLyrics(false);
    setError(null);
    setIsShareMenuOpen(false);
    setIsMusicMenuOpen(false);
  };

  // Helper to determine the opposite gender voice for contrast
  const getComplementaryVoice = (mainVoice: VoiceName): VoiceName => {
    // If main is Kore (Female), use Fenrir (Male)
    if (mainVoice === VoiceName.Kore) return VoiceName.Fenrir;
    // If main is any Male/Androgynous voice, use Kore (Female)
    return VoiceName.Kore;
  };

  // The initial entry point for any search
  const handleSearchRequest = (query: string) => {
    const cached = checkCacheExistence(query, language);
    
    if (cached) {
      // Cache hit! Ask user what to do
      setPendingQuery(query);
      setPendingCacheData(cached);
      return;
    }

    // No cache, proceed to search normally
    executeSearch(query, false);
  };

  // Actually run the search/generation logic
  const executeSearch = async (query: string, forceRefresh: boolean = false) => {
    setIsSearching(true);
    resetContentState();
    setPendingCacheData(null); // Close modal if open

    try {
      // Step 1: Fast Verse Lookup (Cache-aware)
      const initialResult = await searchVerseOnly(query, language, forceRefresh);
      setSearchResult(initialResult);
      setIsSearching(false); // Stop main loader immediately

      // Try to load cached image if available
      const cachedImg = getCachedImage(initialResult.passage.text);
      if (cachedImg) setGeneratedImageUrl(cachedImg);

      // Step 2: Start Background Devotional Task
      setIsLoadingDevotional(true);

      // Launch devotional promise (Cache-aware)
      const contextPromise = generateDevotional(
        initialResult.passage.reference, 
        initialResult.passage.text, 
        language, 
        podcastLength,
        forceRefresh
      );
      
      // Wait for devotional
      const context = await contextPromise;
      
      // Update result with context
      setSearchResult(prev => {
        if (!prev) return null;
        return {
          ...prev,
          passage: {
            ...prev.passage,
            context: context
          }
        };
      });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsSearching(false);
    } finally {
      setIsLoadingDevotional(false);
    }
  };

  const handleLoadFromCache = () => {
    if (pendingCacheData && pendingQuery) {
      executeSearch(pendingQuery, false); // false = use cache
    }
  };

  const handleGenerateNew = () => {
    if (pendingQuery) {
      executeSearch(pendingQuery, true); // true = force refresh
    }
  };

  const handleGenerateImage = async () => {
    if (!searchResult || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    try {
      const url = await generateBibleImage(searchResult.passage.text);
      setGeneratedImageUrl(url);
    } catch (e: any) {
      console.error("Image generation failed", e);
      setError(e.message || "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateLyrics = async () => {
    if (!searchResult || isGeneratingLyrics) return;

    setIsGeneratingLyrics(true);
    setSongLyrics(null);
    setIsCopied(false);
    try {
      const lyrics = await generateSongLyrics(searchResult.passage.reference, searchResult.passage.text, language);
      setSongLyrics(lyrics);
    } catch (e: any) {
      console.error("Lyrics generation failed", e);
      setError(e.message || "Failed to generate lyrics");
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleCopyLyrics = () => {
    if (songLyrics) {
      navigator.clipboard.writeText(songLyrics);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleExternalMusicGen = (platform: 'suno' | 'udio') => {
    handleCopyLyrics();
    const url = platform === 'suno' ? 'https://suno.com/create' : 'https://www.udio.com/create';
    
    setShareMessage(`${t.copied} ${platform === 'suno' ? 'Suno' : 'Udio'}...`);
    
    setTimeout(() => {
        window.open(url, '_blank');
        setShareMessage(null);
        setIsMusicMenuOpen(false);
    }, 1500);
  };

  const handleCopyToClipboard = async () => {
    if (!searchResult) return;
    
    const title = searchResult.passage.reference;
    const text = searchResult.passage.text;
    const devotional = searchResult.passage.context || '';
    const lyricsText = songLyrics ? `\n\nSong Lyrics:\n${songLyrics}` : '';
    
    // 1. Prepare Plain Text Version
    const plainText = `${title}\n\n"${text}"\n\n${devotional}${lyricsText}`;

    // 2. Prepare HTML Version (Rich Text with Image)
    let htmlContent = `
      <h1 style="font-family: serif; color: #2c2c2c;">${title}</h1>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555; font-style: italic;">
        "${text}"
      </blockquote>
    `;

    // Include Image if it exists
    if (generatedImageUrl) {
      htmlContent += `
        <div style="margin: 20px 0;">
          <img src="${generatedImageUrl}" alt="Biblical Illustration" style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>
      `;
    }

    htmlContent += `
      <h3 style="color: #444;">${t.devotionalLabel}</h3>
      <p style="line-height: 1.6; color: #333;">${devotional.replace(/\n/g, '<br/>')}</p>
    `;

    if (songLyrics) {
      htmlContent += `
        <div style="margin: 20px 0;">
          <h4 style="margin-top: 0;">${t.songTranscript}</h4>
          <pre style="font-family: monospace; white-space: pre-wrap;">${songLyrics}</pre>
        </div>
      `;
    }

    try {
      // We need to write a ClipboardItem containing both text/plain and text/html
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        }),
      ]);

      setShareMessage(t.copied + ' (Rich Text)');
    } catch (err) {
      console.error('Rich copy failed, falling back to text', err);
      await navigator.clipboard.writeText(plainText);
      setShareMessage(t.copied);
    }
    
    setTimeout(() => setShareMessage(null), 3000);
    setIsShareMenuOpen(false);
  };
  
  const handleOpenGoogleDocs = () => {
    handleCopyToClipboard();
    // Give the clipboard write a moment to finish before opening tabs
    setTimeout(() => {
        window.open('https://docs.new', '_blank');
    }, 800);
  };

  const handleNativeShare = async () => {
    if (!searchResult) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: searchResult.passage.reference,
          text: `Check out this scripture: ${searchResult.passage.reference}\n"${searchResult.passage.text}"`,
          url: window.location.href
        });
        setIsShareMenuOpen(false);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
        handleCopyToClipboard();
    }
  };

  const handleDownloadPdf = async () => {
    if (!searchResult) return;
    setIsPdfLoading(true);
    setIsShareMenuOpen(false);
    
    try {
      // Dynamic import to avoid loading heavy libraries until needed
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('printable-content');
      if (!element) throw new Error("Content not found");

      // Capture the content container
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true, // Allow images (if any)
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => {
            return el.hasAttribute('data-html2canvas-ignore');
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Handle multi-page content (basic support)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${searchResult.passage.reference.replace(/\s|:/g, '_')}.pdf`;
      pdf.save(fileName);

    } catch (err: any) {
      console.error("PDF Generation Error:", err);
      setError("Failed to generate PDF");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!searchResult) return;
    
    const nextQuery = getAdjacentChapterQuery(searchResult.passage.reference, direction, language);
    
    if (nextQuery) {
      handleSearchRequest(nextQuery);
    } else {
      const suffix = direction === 'next' ? 'next chapter' : 'previous chapter';
      const fallbackQuery = `${searchResult.passage.reference} ${suffix}`;
      handleSearchRequest(fallbackQuery);
    }
  };

  const fetchAudioChunk = async (index: number, item: PlaylistItem): Promise<string> => {
    if (audioCache.current[index]) return audioCache.current[index];
    if (audioPromises.current[index]) return audioPromises.current[index];

    const promise = generateSegmentSpeech(item.text, item.voice)
      .then(url => {
        audioCache.current[index] = url;
        return url;
      })
      .catch(err => {
        console.error(`Failed to fetch chunk ${index}`, err);
        throw err;
      });
    
    audioPromises.current[index] = promise;
    return promise;
  };

  const startAudioPlayback = async (items: PlaylistItem[], title: string) => {
    resetAudioState();
    setIsGeneratingAudio(true);
    setError(null);
    setCurrentAudioTitle(title);

    setPlaylist(items);

    if (items.length === 0) {
      setIsGeneratingAudio(false);
      return;
    }

    try {
      const firstChunkUrl = await fetchAudioChunk(0, items[0]);
      setAudioUrl(firstChunkUrl);
      setCurrentChunkIndex(0);
      
      for (let i = 1; i < Math.min(items.length, 3); i++) {
        fetchAudioChunk(i, items[i]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start audio streaming.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlay = () => {
    if (!searchResult) return;
    if (playlist.length > 0 && currentAudioTitle === searchResult.passage.reference) return;

    // 1. Prepare Verse (Primary Voice)
    const verseText = `${searchResult.passage.reference}. ${searchResult.passage.text}.`;
    const verseChunks = splitTextIntoChunks(verseText).map(chunk => ({
      text: chunk,
      voice: selectedVoice // User choice
    }));

    // 2. Prepare Context (Complementary Voice)
    const currentContext = searchResult.passage.context || "";
    const secondaryVoice = getComplementaryVoice(selectedVoice);
    
    let contextChunks: PlaylistItem[] = [];
    if (currentContext) {
      const contextIntro = t.devotionalLabel + ":";
      const contextFull = `${contextIntro} ${currentContext}`;
      contextChunks = splitTextIntoChunks(contextFull).map(chunk => ({
        text: chunk,
        voice: secondaryVoice // Switched voice
      }));
    }

    // 3. Combine
    const fullPlaylist = [...verseChunks, ...contextChunks];
    
    startAudioPlayback(fullPlaylist, searchResult.passage.reference);
  };

  const handlePlayLyrics = () => {
    if (!songLyrics) return;
    const title = t.songTranscript;
    // For lyrics, we just use the primary selected voice for consistency
    const chunks = splitTextIntoChunks(songLyrics).map(chunk => ({
      text: chunk,
      voice: selectedVoice
    }));
    startAudioPlayback(chunks, title);
  };

  const handleAudioEnded = async () => {
    const nextIndex = currentChunkIndex + 1;
    
    if (nextIndex < playlist.length) {
      setCurrentChunkIndex(nextIndex);
      
      if (audioCache.current[nextIndex]) {
        setAudioUrl(audioCache.current[nextIndex]);
      } else {
        setIsBuffering(true);
        try {
          const url = await fetchAudioChunk(nextIndex, playlist[nextIndex]);
          setAudioUrl(url);
        } catch (e) {
          console.error("Buffering failed", e);
        } finally {
          setIsBuffering(false);
        }
      }

      const lookAheadIndex = nextIndex + 1;
      if (lookAheadIndex < playlist.length) {
        fetchAudioChunk(lookAheadIndex, playlist[lookAheadIndex]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      <BibleNavigation 
        language={language} 
        onSelectPassage={handleSearchRequest} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={handleSearchRequest}
        language={language}
      />

      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
        language={language}
      />

      <CacheModal
        isOpen={!!pendingCacheData}
        onClose={() => setPendingCacheData(null)}
        onLoadCache={handleLoadFromCache}
        onGenerateNew={handleGenerateNew}
        cachedData={pendingCacheData}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
      />

      <div className="flex-1 relative flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#725548_1px,transparent_1px)] [background-size:16px_16px] h-full pointer-events-none"></div>
        
        {/* Increased Z-Index from z-10 to z-30 to ensure dropdowns appear above content */}
        <header className="relative z-30 bg-white border-b border-bible-100 shadow-sm sticky top-0 shrink-0">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-bible-600 hover:bg-bible-50 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-bible-800 rounded-lg flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-display font-bold text-bible-900 tracking-tight leading-none">{t.appName}</h1>
                {!isOnline && (
                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                     <WifiOff className="w-3 h-3" /> {t.offlineMode}
                   </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-bible-500 hover:bg-bible-50 rounded-lg transition-colors"
                  title="API Settings"
               >
                 <Settings className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2 text-bible-500 hover:bg-bible-50 rounded-lg transition-colors"
                  title={t.savedHistory}
               >
                 <History className="w-5 h-5" />
               </button>
               <div className="flex-shrink-0">
                <LanguageSelector language={language} onChange={(lang) => {
                  setLanguage(lang);
                  resetAudioState();
                }} />
               </div>
               <div className="w-28 flex-shrink-0">
                 <LengthSelector 
                   length={podcastLength}
                   onChange={setPodcastLength}
                   language={language}
                   disabled={isSearching || isGeneratingAudio}
                 />
               </div>
               <div className="w-32 md:w-40 flex-shrink-0">
                  <VoiceSelector 
                    selectedVoice={selectedVoice} 
                    onChange={setSelectedVoice}
                    disabled={isGeneratingAudio || playlist.length > 0}
                  />
               </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-8 pb-24 flex-grow">
          
          {!searchResult && !isSearching && (
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-bible-900 mb-3">
                {t.welcomeTitle}
              </h2>
            </div>
          )}

          <div className="mb-6">
            <SearchBox onSearch={handleSearchRequest} isSearching={isSearching} language={language} />
          </div>
          
          {isSearching && (
             <div className="text-center mb-8 text-bible-500 text-sm animate-pulse flex items-center justify-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" />
               {t.finding}
             </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 text-center animate-fade-in">
              <p>{error}</p>
            </div>
          )}

          {/* Share Toast */}
          {shareMessage && (
             <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-bible-900 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in flex items-center gap-2">
               <Check className="w-4 h-4 text-green-400" />
               {shareMessage}
             </div>
          )}

          {searchResult && (
            <div className="animate-fade-in-up space-y-6">
              
              {/* Content Card Container - This is what we print */}
              <div id="printable-content" className="bg-white rounded-2xl shadow-xl border border-bible-100 overflow-hidden relative">
                
                {/* Verse Header - Responsive Layout */}
                <div className="bg-bible-50 px-4 py-4 border-b border-bible-100 flex flex-col md:flex-row items-center justify-between gap-4 print:bg-white print:border-b-2 print:border-black">
                  
                  {/* Navigation Group */}
                  <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-2 md:gap-4 flex-1">
                    <button 
                      onClick={() => handleNavigate('prev')}
                      disabled={isSearching || isLoadingDevotional}
                      className="p-2 text-bible-400 hover:text-bible-700 hover:bg-bible-100 rounded-full transition-colors print:hidden"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-bible-900">
                        {searchResult.passage.reference}
                      </h3>
                      <span className="text-xs font-bold tracking-wider text-bible-500 uppercase">
                        {searchResult.passage.version}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleNavigate('next')}
                      disabled={isSearching || isLoadingDevotional}
                      className="p-2 text-bible-400 hover:text-bible-700 hover:bg-bible-100 rounded-full transition-colors print:hidden"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Action Buttons Group (Play + Share) */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0 print:hidden">
                     {/* Play Button */}
                     {playlist.length === 0 && (
                      <button
                        onClick={handlePlay}
                        disabled={isGeneratingAudio || !isOnline}
                        className="flex items-center gap-2 bg-bible-800 text-white px-5 py-2.5 rounded-full font-medium hover:bg-bible-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
                        title={!isOnline ? "Offline" : "Play"}
                      >
                        {isGeneratingAudio ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            <span>{t.play}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Compose Song Button (Small in header) */}
                    <button
                      onClick={handleGenerateLyrics}
                      disabled={!isOnline || isGeneratingLyrics}
                      className={`p-2.5 bg-white text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full shadow-sm border border-purple-100 transition-colors disabled:opacity-50 ${songLyrics ? 'bg-purple-100 border-purple-300' : ''}`}
                      title={t.composeSong}
                    >
                      {isGeneratingLyrics ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                    </button>

                    {/* Share & Download Menu */}
                    <div className="relative" data-html2canvas-ignore>
                      <button
                        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                        className="p-2.5 bg-white text-bible-500 hover:text-bible-800 hover:bg-bible-50 rounded-full shadow-sm border border-bible-200 transition-colors"
                        title={t.share}
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      
                      {isShareMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-bible-100 overflow-hidden z-30 animate-slide-up">
                           <button
                             onClick={handleOpenGoogleDocs}
                             className="w-full text-left px-4 py-3 text-sm text-bible-700 hover:bg-bible-50 flex items-center gap-2"
                           >
                             <ExternalLink className="w-4 h-4 text-blue-500" />
                             {t.copyDoc}
                           </button>
                           <button
                             onClick={handleCopyToClipboard}
                             className="w-full text-left px-4 py-3 text-sm text-bible-700 hover:bg-bible-50 flex items-center gap-2 border-t border-bible-50"
                           >
                             <ClipboardCopy className="w-4 h-4 text-bible-500" />
                             {t.copyAll}
                           </button>
                           <button
                             onClick={handleNativeShare}
                             className="w-full text-left px-4 py-3 text-sm text-bible-700 hover:bg-bible-50 flex items-center gap-2 border-t border-bible-50 md:hidden"
                           >
                             <Share2 className="w-4 h-4 text-bible-500" />
                             {t.shareLink}
                           </button>
                           <button
                             onClick={handleDownloadPdf}
                             disabled={isPdfLoading}
                             className="w-full text-left px-4 py-3 text-sm text-bible-700 hover:bg-bible-50 flex items-center gap-2 border-t border-bible-50"
                           >
                             {isPdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-red-500" />}
                             {t.downloadPdf}
                           </button>
                        </div>
                      )}
                      
                      {isShareMenuOpen && (
                        <div className="fixed inset-0 z-10" onClick={() => setIsShareMenuOpen(false)} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Creative Area - Image and Song */}
                <div className="w-full bg-stone-100 border-b border-bible-50 relative print:bg-white">
                  
                  {/* Image Generation Section */}
                  <div className="min-h-[200px] bg-stone-100 relative overflow-hidden group print:bg-white">
                    {isGeneratingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-100 animate-pulse h-56">
                        <div className="text-center text-bible-400">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <span className="text-sm font-medium">{t.generatingImage}</span>
                        </div>
                      </div>
                    ) : generatedImageUrl ? (
                      <div className="relative h-auto md:h-80 print:h-auto print:max-h-[400px]">
                        <img 
                          src={generatedImageUrl} 
                          alt="Biblical Visualization" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 animate-fade-in print:object-contain"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded flex items-center gap-1 print:hidden">
                          <ImageIcon className="w-3 h-3" />
                          <span>{isOnline ? 'AI Generated' : 'Saved Image'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 flex items-center justify-center bg-[radial-gradient(#d2bab0_1px,transparent_1px)] [background-size:24px_24px] print:hidden">
                        <div className="flex gap-4">
                          <button 
                            onClick={handleGenerateImage}
                            disabled={!isOnline}
                            className="flex items-center gap-2 bg-white/90 backdrop-blur text-bible-700 px-5 py-3 rounded-xl border border-bible-200 shadow-md hover:shadow-lg hover:bg-white hover:text-bible-900 transition-all transform hover:-translate-y-0.5 group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-5 h-5 text-yellow-500 group-hover:animate-pulse" />
                            <span className="font-medium">
                              {t.visualize}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Song Lyrics Section */}
                  {(isGeneratingLyrics || songLyrics) && (
                    <div className="border-t border-bible-200 bg-white p-6 animate-slide-up print:p-4">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-lg font-display font-bold text-bible-800 flex items-center gap-2">
                           <Music className="w-5 h-5 text-bible-500" />
                           {t.songTranscript}
                         </h4>
                         
                         {songLyrics && (
                            <div className="flex items-center gap-2">
                               <button
                                  onClick={handlePlayLyrics}
                                  disabled={isGeneratingAudio || !isOnline}
                                  className="flex items-center gap-1 text-xs font-medium text-bible-500 hover:text-bible-800 bg-bible-50 hover:bg-bible-100 px-3 py-1.5 rounded-full transition-colors print:hidden"
                                  title={t.readLyrics}
                               >
                                  {isGeneratingAudio && currentAudioTitle !== searchResult.passage.reference ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Volume2 className="w-3 h-3" />
                                  )}
                                  {language === 'zh' ? '朗讀' : 'Read'}
                               </button>
                               
                               {/* Create Real Music Menu */}
                               <div className="relative">
                                <button 
                                  onClick={() => setIsMusicMenuOpen(!isMusicMenuOpen)}
                                  className="flex items-center gap-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-full transition-colors print:hidden"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {t.createAudio}
                                </button>

                                {isMusicMenuOpen && (
                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-bible-100 overflow-hidden z-30 animate-slide-up text-left">
                                    <div className="p-2 text-[10px] text-bible-400 bg-bible-50 border-b border-bible-100">
                                      {t.copyLyricsOpen}
                                    </div>
                                    <button
                                      onClick={() => handleExternalMusicGen('suno')}
                                      className="w-full text-left px-4 py-2.5 text-sm text-bible-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                    >
                                      <span className="font-bold">Suno AI</span>
                                    </button>
                                    <button
                                      onClick={() => handleExternalMusicGen('udio')}
                                      className="w-full text-left px-4 py-2.5 text-sm text-bible-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 border-t border-bible-50"
                                    >
                                      <span className="font-bold">Udio</span>
                                    </button>
                                  </div>
                                )}
                                {isMusicMenuOpen && (
                                  <div className="fixed inset-0 z-20" onClick={() => setIsMusicMenuOpen(false)} />
                                )}
                               </div>

                               <button 
                                 onClick={handleCopyLyrics}
                                 className="flex items-center gap-1 text-xs font-medium text-bible-500 hover:text-bible-800 bg-bible-50 hover:bg-bible-100 px-3 py-1.5 rounded-full transition-colors print:hidden"
                               >
                                 {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                 {isCopied ? t.copied : t.copyLyrics}
                               </button>
                            </div>
                         )}
                      </div>
                      
                      {isGeneratingLyrics ? (
                        <div className="py-8 flex items-center justify-center text-bible-400 gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t.composingLyrics}</span>
                        </div>
                      ) : (
                        <div className="prose prose-stone prose-sm max-w-none font-serif text-center whitespace-pre-wrap bg-stone-50 p-6 rounded-xl border border-bible-100 shadow-inner print:bg-white print:border-none print:p-0 print:shadow-none">
                          {songLyrics}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Verse Text */}
                <div className="p-8 md:p-10 print:p-4">
                   <blockquote className="relative">
                      <span className="absolute -top-4 -left-4 text-6xl text-bible-100 font-serif opacity-50 print:hidden">“</span>
                      <p className="text-xl md:text-2xl leading-relaxed font-serif text-bible-800 text-center italic">
                        {searchResult.passage.text}
                      </p>
                      <span className="absolute -bottom-8 -right-4 text-6xl text-bible-100 font-serif opacity-50 print:hidden">”</span>
                   </blockquote>
                </div>

                {/* Context / Devotional */}
                <div className="bg-stone-100 px-6 py-6 text-bible-600 border-t border-bible-100 min-h-[120px] print:bg-white">
                  {isLoadingDevotional ? (
                    <div className="animate-pulse space-y-3 p-2">
                      <div className="flex items-center gap-2 text-bible-400 text-sm mb-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{t.writingDevotional}</span>
                      </div>
                      <div className="h-3 bg-bible-200 rounded w-3/4"></div>
                      <div className="h-3 bg-bible-200 rounded w-5/6"></div>
                      <div className="h-3 bg-bible-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex items-baseline gap-2 mb-3">
                         <span className="text-sm font-bold uppercase tracking-wider text-bible-800 bg-bible-200 px-2 py-0.5 rounded">
                           {t.devotionalLabel}
                         </span>
                      </div>
                      <div className="prose prose-stone prose-sm max-w-none leading-relaxed whitespace-pre-wrap text-justify font-serif text-black">
                        {searchResult.passage.context}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!searchResult && !isSearching && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
               {t.suggestions.map((suggestion) => (
                 <button 
                   key={suggestion}
                   onClick={() => handleSearchRequest(suggestion)}
                   className="p-4 bg-white rounded-xl border border-bible-200 text-bible-600 hover:border-bible-400 hover:text-bible-900 transition-colors shadow-sm text-sm font-medium"
                 >
                   "{suggestion}"
                 </button>
               ))}
            </div>
          )}
        </main>
      </div>

      {playlist.length > 0 && (
        <AudioPlayer 
          src={audioUrl} 
          isLoading={isBuffering}
          title={currentAudioTitle || searchResult?.passage.reference || "Scripture Podcast"}
          subtitle={`${language === 'zh' ? '正在播放片段' : 'Playing part'} ${currentChunkIndex + 1} / ${playlist.length}`}
          onClose={resetAudioState}
          onEnded={handleAudioEnded}
        />
      )}
      
      <footer className="fixed bottom-2 right-4 z-50 text-[11px] text-bible-400 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-bible-200 flex items-center gap-3 print:hidden">
        <span className="font-mono opacity-80">v{CLIENT_VERSION}</span>
        <div className="w-px h-3 bg-bible-300"></div>
        <button 
          onClick={() => setIsAboutOpen(true)}
          className="flex items-center gap-1 hover:text-bible-800 transition-colors cursor-pointer font-medium"
        >
          <Info className="w-3 h-3" />
          {t.howItWorks}
        </button>
      </footer>
    </div>
  );
};

export default App;
