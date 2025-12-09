import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, History as HistoryIcon, Send, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
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
    if (confirm('Are you sure you want to clear your history?')) {
      setHistory([]);
      localStorage.removeItem('gift_genius_history');
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
            setLoadingState(LoadingState.IDLE);
            setDescription('');
            setRecommendations([]);
          }}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Gift size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Gift Genius</h1>
          </div>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-500'}`}
            aria-label="Toggle History"
          >
            <HistoryIcon size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${showHistory ? 'hidden md:block opacity-50 pointer-events-none' : 'opacity-100'}`}>
          
          {/* Hero / Input Section */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Find the perfect gift, <span className="text-indigo-600">every time.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Describe the person, their hobbies, age, and your relationship. Our AI will handle the brainstorming.
            </p>

            <form onSubmit={handleGenerate} className="relative shadow-xl rounded-2xl bg-white overflow-hidden ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., My dad, 60 years old. He loves gardening but has a bad back. Budget is around 500k IDR."
                className="w-full p-6 pb-20 text-lg outline-none min-h-[160px] resize-none placeholder:text-slate-400 bg-slate-50 text-slate-800 focus:bg-white transition-colors"
                disabled={loadingState === LoadingState.LOADING}
              />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {description.length > 0 && (
                   <button
                    type="button"
                    onClick={() => setDescription('')}
                    className="text-slate-400 hover:text-slate-600 p-2 text-sm font-medium"
                   >
                     Clear
                   </button>
                )}
                <button
                  type="submit"
                  disabled={!description.trim() || loadingState === LoadingState.LOADING}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {loadingState === LoadingState.LOADING ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Ideas
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {loadingState === LoadingState.ERROR && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 flex items-center gap-3 justify-center">
              <span className="font-semibold">Error:</span> {errorMsg}
              <button onClick={() => handleGenerate()} className="underline hover:text-red-800">Try Again</button>
            </div>
          )}

          {/* Results Grid */}
          {recommendations.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-500 fill-yellow-500" />
                  Top Picks For You
                </h3>
                <button 
                  onClick={() => handleGenerate()} 
                  className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  <RefreshCcw size={14} /> Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((gift, index) => (
                  <GiftCard key={index} gift={gift} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar / Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-40 md:static md:inset-auto md:z-auto">
            {/* Backdrop for mobile */}
            <div 
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm md:hidden" 
              onClick={() => setShowHistory(false)}
            ></div>
            
            {/* Sidebar content */}
            <div className="absolute right-0 top-16 bottom-0 w-full sm:w-96 bg-slate-50 md:bg-transparent p-4 overflow-y-auto border-l border-slate-200 md:border-none shadow-2xl md:shadow-none animate-slide-in-right md:animate-none md:fixed md:right-0 md:top-20 md:h-[calc(100vh-80px)]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-800">Saved Ideas</h3>
                 {history.length > 0 && (
                   <button 
                    onClick={handleClearHistory}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Clear History"
                   >
                     <Trash2 size={18} />
                   </button>
                 )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <HistoryIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No history yet.</p>
                  <p className="text-sm">Generate some gift ideas to save them here automatically.</p>
                </div>
              ) : (
                <div className="space-y-4 pb-20">
                  {history.map((item) => (
                    <HistoryItem 
                      key={item.id} 
                      item={item} 
                      onClick={handleLoadHistoryItem} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
      
      {/* Global styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out backwards; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;