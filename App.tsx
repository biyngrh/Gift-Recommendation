import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, History as HistoryIcon, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import { generateGiftIdeas } from './services/geminiService';
import { GiftRecommendation, LoadingState, GiftHistoryItem } from './types';
import GiftCard from './components/GiftCard';
import HistoryItem from './components/HistoryItem';

const App: React.FC = () => {
  const [description, setDescription] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [history, setHistory] = useState<GiftHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load history on mount
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

  const saveToHistory = (desc: string, recs: GiftRecommendation[]) => {
    const newItem: GiftHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      description: desc,
      recommendations: recs
    };
    const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem('gift_genius_history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire history?')) {
      setHistory([]);
      localStorage.removeItem('gift_genius_history');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('gift_genius_history', JSON.stringify(updatedHistory));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setShowHistory(false);

    try {
      const results = await generateGiftIdeas(description);
      setRecommendations(results);
      setLoadingState(LoadingState.SUCCESS);
      saveToHistory(description, results);
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
      setErrorMsg("Oops! Something went wrong while thinking. Please try again.");
    }
  };

  const handleLoadHistoryItem = (item: GiftHistoryItem) => {
    setDescription(item.description);
    setRecommendations(item.recommendations);
    setLoadingState(LoadingState.SUCCESS);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Background Glowing Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
            setLoadingState(LoadingState.IDLE);
            setDescription('');
            setRecommendations([]);
          }}>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow duration-300">
              <Gift size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-white/70 bg-clip-text text-transparent">
              Gift Genius
            </h1>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-3 rounded-xl transition-all relative border ${showHistory ? 'bg-purple-500/20 border-purple-500/30 text-purple-200' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'}`}
            aria-label="Toggle History"
          >
            <div className="relative">
              <HistoryIcon size={20} />
              {history.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
                  {history.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-12 pb-24">
        
        {/* Main Content Area */}
        <div className={`transition-all duration-500 ${showHistory ? 'opacity-30 blur-sm pointer-events-none transform scale-95' : 'opacity-100 transform scale-100'}`}>
          
          {/* Hero / Input Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Gift giving, <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">reimagined by AI.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
              Describe the person, their quirks, hobbies, and your budget. <br className="hidden md:block"/>
              We'll conjure up the perfect recommendations in seconds.
            </p>

            <form onSubmit={handleGenerate} className="relative group">
              {/* Glowing ring effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-focus-within:opacity-70 blur transition duration-500"></div>
              
              <div className="relative rounded-2xl bg-slate-950 overflow-hidden">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: My younger sister, turning 24. She's into astrology, loves cozy aesthetic, and drinks too much iced coffee. Budget under 300k IDR."
                  className="w-full p-6 pb-24 text-lg outline-none min-h-[180px] resize-none placeholder:text-slate-600 bg-slate-900/50 text-slate-100 focus:bg-slate-900/80 transition-colors backdrop-blur-sm"
                  disabled={loadingState === LoadingState.LOADING}
                />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  {description.length > 0 && (
                     <button
                      type="button"
                      onClick={() => setDescription('')}
                      className="text-slate-500 hover:text-slate-300 px-3 py-2 text-sm font-medium transition-colors"
                     >
                       Clear
                     </button>
                  )}
                  <button
                    type="submit"
                    disabled={!description.trim() || loadingState === LoadingState.LOADING}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/20 border border-white/10"
                  >
                    {loadingState === LoadingState.LOADING ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="animate-pulse">Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="text-yellow-200" />
                        Generate Magic
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {loadingState === LoadingState.ERROR && (
            <div className="bg-red-500/10 text-red-200 p-4 rounded-xl border border-red-500/20 mb-10 flex items-center gap-3 justify-center backdrop-blur-md animate-fade-in">
              <span className="font-semibold text-red-400">Error:</span> {errorMsg}
              <button onClick={() => handleGenerate()} className="underline hover:text-white transition-colors">Try Again</button>
            </div>
          )}

          {/* Results Grid */}
          {recommendations.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <div className="bg-yellow-500/20 p-1.5 rounded-lg">
                    <Sparkles size={16} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  Curated For You
                </h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleGenerate()} 
                    className="text-purple-400 text-sm font-medium flex items-center gap-1.5 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <RefreshCcw size={14} /> Regenerate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
                {recommendations.map((gift, index) => (
                  <GiftCard key={index} gift={gift} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[60] transform transition-transform duration-300 ease-in-out ${
            showHistory ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sidebar Content */}
          <div className="h-full bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
               <div className="flex items-center gap-3">
                 <HistoryIcon size={20} className="text-purple-400" />
                 <h3 className="text-lg font-bold text-slate-100">Time Capsule</h3>
               </div>
               <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white p-2"
               >
                 Close
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <HistoryIcon size={24} className="opacity-40" />
                  </div>
                  <p>No history yet.</p>
                  <p className="text-xs mt-2 text-slate-600">Your magical discoveries will appear here.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {history.map((item) => (
                    <HistoryItem 
                      key={item.id} 
                      item={item} 
                      onClick={handleLoadHistoryItem} 
                      onDelete={handleDeleteHistoryItem}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {history.length > 0 && (
              <div className="p-4 border-t border-white/5 bg-slate-900/50">
                 <button 
                  onClick={handleClearHistory}
                  className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                 >
                   <Trash2 size={16} />
                   Clear All History
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop for mobile history */}
        {showHistory && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
            onClick={() => setShowHistory(false)}
          ></div>
        )}

      </main>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;