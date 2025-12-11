import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles, History as HistoryIcon, Loader2, RefreshCcw, Moon, Sun, Camera, X, ChevronDown, ArrowRight, Home, Music, Star, FlaskConical, Zap, LayoutGrid, ChevronLeft, ChevronRight, Globe, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { generateGiftIdeas, generateAlchemyIdeas } from './services/geminiService';
import { GiftRecommendation, LoadingState, GiftHistoryItem, Language } from './types';
import GiftCard from './components/GiftCard';
import HistoryItem from './components/HistoryItem';
import { translations } from './utils/translations';

const App: React.FC = () => {
  // --- State Management ---
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'oracle' | 'alchemy'>('oracle');

  // Oracle Mode States
  const [description, setDescription] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  
  // Alchemy Mode States
  const [elementA, setElementA] = useState('');
  const [elementB, setElementB] = useState('');
  const [alchemyResults, setAlchemyResults] = useState<GiftRecommendation[]>([]);
  const [alchemyLoading, setAlchemyLoading] = useState<LoadingState>(LoadingState.IDLE);

  // Shared States
  const [history, setHistory] = useState<GiftHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('id');
  
  // New States for Major Update
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [occasionKey, setOccasionKey] = useState<string>('justBecause');
  const [budgetIndex, setBudgetIndex] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep Dive States
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [zodiac, setZodiac] = useState('');
  const [music, setMusic] = useState('');

  // Landing Page State
  const [showLanding, setShowLanding] = useState(true);
  const [isExitingLanding, setIsExitingLanding] = useState(false);

  // The Constellation of Vibes Data
  const vibes = [
    "Creative", "Minimalist", "Gamer", "Cozy", 
    "Luxury", "Vintage", "Tech Lover", "Plant Parent"
  ];

  const zodiacOptions = [
    "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋",
    "Leo ♌", "Virgo ♍", "Libra ♎", "Scorpio ♏",
    "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓"
  ];

  // --- Derived Data based on Language ---
  const t = translations[language];

  // Map keys to keys in translations
  const occasionKeys = Object.keys(t.occasions);
  const budgetKeys = Object.keys(t.budgets);

  // --- Effects ---

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Initialize Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem('gift_genius_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // --- Handlers ---

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const newLang = language === 'id' ? 'en' : 'id';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const saveToHistory = (desc: string, recs: GiftRecommendation[]) => {
    const currentOccasion = (t.occasions as any)[occasionKey];
    
    const newItem: GiftHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      description: desc,
      recommendations: recs
    };
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('gift_genius_history', JSON.stringify(updatedHistory));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim() && !selectedImage) return;

    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setShowHistory(false);

    try {
      const currentOccasion = (t.occasions as any)[occasionKey];
      const currentBudget = (t.budgets as any)[budgetKeys[budgetIndex]];

      const results = await generateGiftIdeas({
        description,
        imageBase64: selectedImage || undefined,
        occasion: currentOccasion,
        budget: currentBudget,
        language,
        zodiac: showDeepDive ? zodiac : undefined,
        music: showDeepDive ? music : undefined
      });
      setRecommendations(results);
      setLoadingState(LoadingState.SUCCESS);
      saveToHistory(`${currentOccasion} - ${description.substring(0, 30)}...`, results);
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
      setErrorMsg(t.errorGeneric);
    }
  };

  const handleAlchemyFuse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!elementA.trim() || !elementB.trim()) return;

    setAlchemyLoading(LoadingState.LOADING);
    setErrorMsg(null);

    try {
      const results = await generateAlchemyIdeas({
        elementA,
        elementB,
        language
      });
      setAlchemyResults(results);
      setAlchemyLoading(LoadingState.SUCCESS);
      // Optional: Save Alchemy to history with a special prefix
      saveToHistory(`⚗️ ${elementA} + ${elementB}`, results);
    } catch (error) {
      setAlchemyLoading(LoadingState.ERROR);
      setErrorMsg(t.errorGeneric);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // --- Landing Page Handlers ---

  const handleEnterApp = () => {
    setIsExitingLanding(true);
    setTimeout(() => {
      setShowLanding(false);
    }, 800);
  };

  const handleBackToHome = () => {
    setIsExitingLanding(false);
    setShowLanding(true);
    // Reset tabs
    setActiveTab('oracle');
  };

  const handleVibeClick = (vibe: string) => {
    const template = language === 'id' 
      ? `Mencari kado untuk seseorang yang suka suasana ${vibe}...`
      : `Looking for a gift for someone who is ${vibe}...`;
    setDescription(template);
    handleEnterApp();
  };

  // --- Sub-Components ---

  const NavButton = ({ id, icon: Icon, label, active, onClick }: { id?: string, icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex items-center justify-start px-4 py-3 rounded-xl w-full transition-all duration-300 group relative ${
        active 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'
      }`}
    >
      <Icon size={20} className={`${active ? 'animate-pulse-slow' : 'group-hover:scale-110 transition-transform'} mr-3`} />
      <span className="font-medium text-sm md:text-base whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  // --- UI Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-purple-500/30 transition-colors duration-500 font-sans">
      
      {/* Background Glowing Orbs (Persistent) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* --- LANDING PAGE --- */}
      {showLanding && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl transition-all duration-1000 ${
            isExitingLanding ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Landing Page Controls */}
          <div className="absolute top-6 right-6 flex gap-3 z-50 animate-fade-in">
             <button onClick={toggleLanguage} className="p-3 rounded-xl transition-all bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-2xl leading-none" title="Switch Language">
                {language === 'id' ? '🇮🇩' : '🇺🇸'}
             </button>
             <button onClick={toggleTheme} className="p-3 rounded-xl transition-all bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>

          <div className="max-w-4xl w-full flex flex-col items-center text-center relative">
            {/* Hero Text */}
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter animate-fade-in-up relative z-20">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                Gift Genius
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light tracking-wide mb-16 animate-fade-in-up relative z-20" style={{ animationDelay: '0.2s' }}>
              {t.landingHeroSubtitle}
            </p>

            {/* The Constellation of Vibes */}
            <div className="w-full max-w-3xl flex flex-wrap justify-center gap-4 mb-20 relative z-10 px-4">
               {vibes.map((vibe, index) => (
                 <button
                   key={vibe}
                   onClick={() => handleVibeClick(vibe)}
                   className="animate-float animate-fade-in-up px-6 py-3 rounded-full bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-purple-500 hover:border-purple-400 hover:text-white dark:hover:bg-purple-500 dark:hover:border-purple-400 transition-all duration-300 transform hover:scale-110 active:scale-95 text-sm md:text-base"
                   style={{ 
                     animationDelay: `${index * 0.1}s`,
                     animationDuration: `${4 + (index % 3)}s` // vary the float speed slightly
                   }}
                 >
                   ✨ {vibe}
                 </button>
               ))}
            </div>

            {/* Standard Entry Button */}
            <button 
              onClick={handleEnterApp}
              className="group relative px-10 py-5 bg-white dark:bg-white text-slate-900 rounded-full font-bold text-lg tracking-wide hover:bg-purple-50 transition-all duration-300 animate-fade-in-up hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] border border-slate-200 dark:border-transparent z-20"
              style={{ animationDelay: '0.8s' }}
            >
              <span className="flex items-center gap-2">
                {t.enterOracle} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN APP LAYOUT --- */}
      {!showLanding && (
        <div className="animate-fade-in flex flex-col md:flex-row min-h-screen">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden md:flex flex-col fixed h-full w-64 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 p-6">
             {/* Logo */}
             <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={handleBackToHome}>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg text-white shadow-lg shadow-purple-500/20">
                  <Gift size={24} />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">Gift Genius</h1>
             </div>

             {/* Utility Buttons (Home, Language, Theme) - Moved to top */}
             <div className="space-y-1 mb-6 pb-6 border-b border-slate-200 dark:border-white/5">
                <NavButton 
                  onClick={handleBackToHome} 
                  icon={Home} 
                  label="Home" 
                  active={false} 
               />
                <NavButton 
                  onClick={toggleLanguage} 
                  icon={Globe} 
                  label={language === 'id' ? 'Bahasa' : 'English'} 
                  active={false} 
               />
                <NavButton 
                  onClick={toggleTheme} 
                  icon={theme === 'dark' ? Sun : Moon} 
                  label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} 
                  active={false} 
               />
             </div>

             {/* Main Navigation (Oracle & Alchemy) */}
             <nav className="flex-1 space-y-2">
               <NavButton 
                  onClick={() => setActiveTab('oracle')} 
                  icon={Sparkles} 
                  label={t.menuOracle} 
                  active={activeTab === 'oracle'} 
               />
               <NavButton 
                  onClick={() => setActiveTab('alchemy')} 
                  icon={FlaskConical} 
                  label={t.menuAlchemy} 
                  active={activeTab === 'alchemy'} 
               />
             </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 pb-24 md:pb-12 pt-6 px-4 md:px-12 max-w-7xl mx-auto w-full md:ml-64">
            
            {/* Header Mobile Only */}
            <div className="md:hidden flex items-center justify-between mb-8">
               <div className="flex items-center gap-2" onClick={handleBackToHome}>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg text-white">
                    <Gift size={20} />
                  </div>
                  <h1 className="text-xl font-extrabold tracking-tight">Gift Genius</h1>
               </div>
               <div className="flex gap-2">
                 <button onClick={toggleTheme} className="p-2 bg-white/50 dark:bg-white/5 rounded-full"><Sun size={20} /></button>
                 <button onClick={() => setShowHistory(!showHistory)} className="p-2 bg-white/50 dark:bg-white/5 rounded-full relative">
                    <HistoryIcon size={20} />
                    {history.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"/>}
                 </button>
               </div>
            </div>

            {/* Desktop History Button (Absolute Top Right) */}
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="hidden md:flex absolute top-6 right-6 p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 transition-all z-30"
            >
               <HistoryIcon size={20} />
               {history.length > 0 && (
                 <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-[10px] font-bold text-white">
                   {history.length}
                 </span>
               )}
            </button>

            {/* Content Switcher */}
            {activeTab === 'oracle' ? (
               // --- ORACLE MODE ---
               <div className="animate-fade-in">
                  <div className="text-center mb-10 max-w-3xl mx-auto pt-4 md:pt-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight text-slate-800 dark:text-slate-100">
                      {t.heroTitle} <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">{t.heroTitleHighlight}</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed font-light">
                      {t.heroDesc}
                    </p>
                  </div>

                  {/* Oracle Input Form */}
                  <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group mb-16">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <form onSubmit={handleGenerate} className="relative z-10 flex flex-col gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Occasion */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t.occasionLabel}</label>
                          <div className="relative">
                            <select 
                              value={occasionKey}
                              onChange={(e) => setOccasionKey(e.target.value)}
                              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {occasionKeys.map(key => (
                                <option key={key} value={key}>{(t.occasions as any)[key]}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex justify-between">
                            <span>{t.budgetLabel}</span>
                            <span className="text-purple-600 dark:text-purple-400">{(t.budgets as any)[budgetKeys[budgetIndex]]}</span>
                          </label>
                          <div className="h-[46px] flex items-center px-2">
                            <input 
                              type="range" 
                              min="0" 
                              max="3" 
                              step="1"
                              value={budgetIndex}
                              onChange={(e) => setBudgetIndex(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-pink-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Main Inputs */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Upload */}
                        <div className="w-full md:w-1/3 shrink-0">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`h-full min-h-[160px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 relative overflow-hidden group/image
                              ${selectedImage 
                                ? 'border-purple-500/50 bg-slate-900/50' 
                                : isDragging
                                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 scale-[1.02]'
                                  : 'border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-500/5'
                              }`}
                          >
                            {selectedImage ? (
                              <>
                                <img src={selectedImage} alt="Aura" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/image:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                  <span className="text-white font-medium flex items-center gap-2"><RefreshCcw size={14}/> {t.changeImage}</span>
                                </div>
                                <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">{t.auraActive}</div>
                              </>
                            ) : (
                              <>
                                <div className={`bg-white dark:bg-white/10 p-3 rounded-full mb-3 shadow-sm transition-transform ${isDragging ? 'scale-125' : 'group-hover/image:scale-110'}`}>
                                  <Camera size={24} className="text-purple-500 dark:text-purple-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.readAura}</p>
                                <p className="text-xs text-slate-400 text-center mt-1">{t.uploadHint}</p>
                              </>
                            )}
                          </div>
                          {selectedImage && (
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                              className="text-xs text-red-500 hover:text-red-600 mt-2 flex items-center justify-center gap-1 w-full"
                            >
                              <X size={12} /> {t.removeImage}
                            </button>
                          )}
                        </div>

                        {/* Description & Deep Dive */}
                        <div className="flex-1 flex flex-col gap-3">
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.descPlaceholder}
                            className="w-full h-full min-h-[120px] p-4 text-base outline-none resize-none rounded-2xl bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 border border-transparent focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/50 transition-all"
                          />
                          
                          <button 
                            type="button"
                            onClick={() => setShowDeepDive(!showDeepDive)}
                            className="self-start text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
                          >
                            {showDeepDive ? t.hideCosmicDetails : t.addCosmicDetails}
                          </button>

                          {showDeepDive && (
                            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-500/20">
                               <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                   <Star size={10} /> {t.zodiacLabel}
                                 </label>
                                 <div className="relative">
                                   <select 
                                      value={zodiac}
                                      onChange={(e) => setZodiac(e.target.value)}
                                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-purple-500 outline-none appearance-none"
                                   >
                                     <option value="">{t.zodiacPlaceholder}</option>
                                     {zodiacOptions.map(z => (
                                       <option key={z} value={z}>{z}</option>
                                     ))}
                                   </select>
                                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                 </div>
                               </div>

                               <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                   <Music size={10} /> {t.musicLabel}
                                 </label>
                                 <input 
                                   type="text"
                                   value={music}
                                   onChange={(e) => setMusic(e.target.value)}
                                   placeholder={t.musicPlaceholder}
                                   className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-purple-500 outline-none"
                                 />
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-4 w-full">
                          <p className="hidden md:block text-xs text-slate-400 italic flex-1">
                            {t.disclaimer}
                          </p>
                          <button
                            type="submit"
                            disabled={(!description.trim() && !selectedImage) || loadingState === LoadingState.LOADING}
                            className="w-full md:w-auto relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/25"
                          >
                            {loadingState === LoadingState.LOADING ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                <span className="animate-pulse">
                                  {selectedImage ? t.btnLoadingReading : t.btnLoadingConsulting}
                                </span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={18} className="text-yellow-200 fill-yellow-200" />
                                {t.btnGenerate}
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </form>
                  </div>
                  
                  {/* Oracle Error */}
                  {loadingState === LoadingState.ERROR && (
                    <div className="bg-red-500/10 text-red-600 dark:text-red-200 p-4 rounded-xl border border-red-500/20 mb-10 flex items-center gap-3 justify-center backdrop-blur-md animate-fade-in text-sm">
                      <span className="font-bold">Error:</span> {errorMsg}
                    </div>
                  )}

                  {/* Oracle Results */}
                  {recommendations.length > 0 && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <div className="bg-yellow-500/20 p-1.5 rounded-lg">
                            <Sparkles size={16} className="text-yellow-600 dark:text-yellow-400 fill-yellow-400" />
                          </div>
                          {t.resultsTitle}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
                        {recommendations.map((gift, index) => (
                          <GiftCard 
                            key={index} 
                            gift={gift} 
                            index={index} 
                            language={language}
                            recipientDescription={description}
                            occasion={(t.occasions as any)[occasionKey]}
                          />
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            ) : (
               // --- ALCHEMY LAB MODE ---
               <div className="animate-fade-in">
                  <div className="text-center mb-10 max-w-3xl mx-auto pt-4 md:pt-12">
                     <div className="flex justify-center mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                           <FlaskConical size={32} className="text-amber-500" />
                        </div>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight text-slate-800 dark:text-slate-100">
                        {t.alchemyTitle} <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{t.alchemyHighlight}</span>
                     </h2>
                     <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed font-light">
                        {t.alchemyDesc}
                     </p>
                  </div>

                  <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-amber-200 dark:border-amber-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden mb-16">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
                     
                     <form onSubmit={handleAlchemyFuse} className="flex flex-col items-center gap-8">
                        
                        <div className="flex flex-col md:flex-row gap-6 w-full items-stretch">
                           {/* Element A */}
                           <div className="flex-1 relative group">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.elementALabel}</label>
                              <div className="relative h-20 w-full">
                                 <input 
                                    type="text" 
                                    value={elementA}
                                    onChange={(e) => setElementA(e.target.value)}
                                    placeholder={t.elementAPlaceholder}
                                    className="w-full h-full text-lg font-medium text-center bg-slate-50 dark:bg-black/20 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-200 dark:text-purple-900 pointer-events-none">
                                    <LayoutGrid size={24} />
                                 </div>
                              </div>
                           </div>

                           {/* Fusion Icon */}
                           <div className="flex items-end pb-6 justify-center">
                              <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
                                 <Zap size={24} />
                              </div>
                           </div>

                           {/* Element B */}
                           <div className="flex-1 relative group">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t.elementBLabel}</label>
                              <div className="relative h-20 w-full">
                                 <input 
                                    type="text" 
                                    value={elementB}
                                    onChange={(e) => setElementB(e.target.value)}
                                    placeholder={t.elementBPlaceholder}
                                    className="w-full h-full text-lg font-medium text-center bg-slate-50 dark:bg-black/20 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-amber-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-200 dark:text-amber-900 pointer-events-none">
                                    <Sparkles size={24} />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <button 
                           type="submit"
                           disabled={alchemyLoading === LoadingState.LOADING || !elementA || !elementB}
                           className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-lg rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {alchemyLoading === LoadingState.LOADING ? (
                              <>
                                 <Loader2 size={20} className="animate-spin" />
                                 {t.btnLoadingFusing}
                              </>
                           ) : (
                              <>
                                 <FlaskConical size={20} className="fill-white/20" />
                                 {t.fuseButton}
                              </>
                           )}
                        </button>

                     </form>
                  </div>

                  {/* Alchemy Error */}
                  {alchemyLoading === LoadingState.ERROR && (
                    <div className="bg-red-500/10 text-red-600 dark:text-red-200 p-4 rounded-xl border border-red-500/20 mb-10 flex items-center gap-3 justify-center backdrop-blur-md animate-fade-in text-sm">
                      <span className="font-bold">Error:</span> {errorMsg}
                    </div>
                  )}

                  {/* Alchemy Results */}
                  {alchemyResults.length > 0 && (
                     <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8 px-2">
                           <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <div className="bg-amber-500/20 p-1.5 rounded-lg">
                                 <FlaskConical size={16} className="text-amber-600 dark:text-amber-400" />
                              </div>
                              {t.alchemyResults}
                           </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
                           {alchemyResults.map((gift, index) => (
                              <div key={index} className="relative group">
                                 {/* Gold Border Effect Wrapper */}
                                 <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-500"></div>
                                 <div className="relative h-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                                    <GiftCard 
                                       gift={gift} 
                                       index={index} 
                                       language={language}
                                       recipientDescription={`Fusion of ${elementA} and ${elementB}`}
                                       occasion="Alchemy Experiment"
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* History Sidebar (Shared) */}
            <div 
              className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[60] transform transition-transform duration-300 ease-in-out ${
                showHistory ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
                   <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                     <HistoryIcon size={18} /> {t.historyTitle}
                   </h3>
                   <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><X size={20} className="dark:text-slate-400"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {history.map((item) => (
                    <HistoryItem 
                      key={item.id} 
                      item={item} 
                      language={language}
                      onClick={(item) => {
                        // Restore state based on simple heuristic (description starting with emoji is likely alchemy)
                        if (item.description.startsWith('⚗️')) {
                            // It's alchemy history, just show results. 
                            // Restoring inputs is harder without storing structured metadata, 
                            // so we just switch tab and show results.
                            setActiveTab('alchemy');
                            setAlchemyResults(item.recommendations);
                        } else {
                            setActiveTab('oracle');
                            setDescription(item.description);
                            setRecommendations(item.recommendations);
                        }
                        setShowHistory(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      onDelete={(id) => {
                        const updated = history.filter(h => h.id !== id);
                        setHistory(updated);
                        localStorage.setItem('gift_genius_history', JSON.stringify(updated));
                      }}
                    />
                  ))}
                  {history.length === 0 && <p className="text-center text-slate-400 mt-10 text-sm">{t.historyEmpty}</p>}
                </div>
              </div>
            </div>
            
            {showHistory && <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />}
          </main>

          {/* MOBILE BOTTOM NAV */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 z-40 px-6 py-3 flex justify-between items-center">
             <button onClick={() => setActiveTab('oracle')} className={`flex flex-col items-center gap-1 ${activeTab === 'oracle' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                <Sparkles size={24} />
                <span className="text-[10px] font-bold">{t.menuOracle}</span>
             </button>
             
             <div className="relative -top-6">
                <button onClick={handleBackToHome} className="bg-gradient-to-tr from-purple-500 to-pink-500 p-4 rounded-full text-white shadow-lg shadow-purple-500/30">
                   <Home size={24} />
                </button>
             </div>

             <button onClick={() => setActiveTab('alchemy')} className={`flex flex-col items-center gap-1 ${activeTab === 'alchemy' ? 'text-amber-500' : 'text-slate-400'}`}>
                <FlaskConical size={24} />
                <span className="text-[10px] font-bold">{t.menuAlchemy}</span>
             </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.7s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.7s ease-out backwards; }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: transparent;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default App;