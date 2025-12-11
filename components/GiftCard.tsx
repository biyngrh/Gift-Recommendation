import React, { useState, useEffect, useRef } from 'react';
import { GiftRecommendation, Language } from '../types';
import { ExternalLink, ShoppingBag, Bookmark, Check, Share2, Download, Feather, Copy, Loader2, RefreshCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { translations } from '../utils/translations';
import { GoogleGenAI } from "@google/genai";

interface GiftCardProps {
  gift: GiftRecommendation;
  index: number;
  language: Language;
  recipientDescription: string;
  occasion: string;
}

const GiftCard: React.FC<GiftCardProps> = ({ gift, index, language, recipientDescription, occasion }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Greeting Scroll States
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    try {
      const savedGiftsRaw = localStorage.getItem('gift_genius_saved');
      if (savedGiftsRaw) {
        const savedGifts: GiftRecommendation[] = JSON.parse(savedGiftsRaw);
        const exists = savedGifts.some(
          (g) => g.name === gift.name && g.reason === gift.reason
        );
        setIsSaved(exists);
      }
    } catch (error) {
      console.error("Error reading saved gifts:", error);
    }
  }, [gift]);

  const handleToggleSave = () => {
    try {
      const savedGiftsRaw = localStorage.getItem('gift_genius_saved');
      let savedGifts: GiftRecommendation[] = savedGiftsRaw ? JSON.parse(savedGiftsRaw) : [];

      if (isSaved) {
        savedGifts = savedGifts.filter(
          (g) => !(g.name === gift.name && g.reason === gift.reason)
        );
      } else {
        savedGifts.push(gift);
      }

      localStorage.setItem('gift_genius_saved', JSON.stringify(savedGifts));
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error updating saved gifts:", error);
    }
  };

  const handleSearch = () => {
    const query = encodeURIComponent(gift.name);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleShopSearch = () => {
    const query = encodeURIComponent(gift.name);
    // Use Amazon for EN, Shopee for ID
    const url = language === 'id' 
      ? `https://shopee.co.id/search?keyword=${query}`
      : `https://www.amazon.com/s?k=${query}`;
    window.open(url, '_blank');
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    
    try {
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e1b4b', // Dark purple/slate background for the image
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `gift-genius-${gift.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to capture image", err);
      alert(language === 'id' ? "Gagal membuat gambar." : "Failed to generate image.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGenerateGreeting = async () => {
    if (greetingText) {
      setShowGreeting(!showGreeting);
      return;
    }

    setIsGeneratingGreeting(true);
    setShowGreeting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Bertindaklah sebagai penulis kartu ucapan profesional.
        Tugas: Buatkan pesan kartu ucapan pendek (maksimal 3 kalimat) untuk kado: "${gift.name}".
        
        Konteks:
        - Penerima: "${recipientDescription}"
        - Acara: "${occasion}"
        - Bahasa: ${language === 'id' ? 'Indonesia' : 'English'}
        - Gaya: Personal, hangat, menyentuh hati atau sedikit lucu (witty).

        PENTING: 
        - Langsung berikan isi pesannya saja. 
        - JANGAN ada kata pengantar seperti "Tentu", "Berikut adalah pilihan", "Opsi 1", dll.
        - JANGAN gunakan tanda kutip di awal atau akhir pesan.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response.text) {
        let cleanText = response.text.trim();
        // Remove quotes if they exist at start/end
        cleanText = cleanText.replace(/^["']|["']$/g, '');
        setGreetingText(cleanText);
      }
    } catch (error) {
      console.error("Error generating greeting:", error);
      setGreetingText(language === 'id' ? "Maaf, tinta ajaib sedang habis." : "Sorry, out of magic ink.");
    } finally {
      setIsGeneratingGreeting(false);
    }
  };

  const handleCopyGreeting = () => {
    navigator.clipboard.writeText(greetingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      ref={cardRef}
      className="group relative bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full hover:bg-white dark:hover:bg-slate-900/60 hover:border-purple-200 dark:hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 transform translate-y-0 animate-fade-in-up shadow-sm"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Decorative gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleDownloadImage}
          disabled={isCapturing}
          className="p-2 rounded-full bg-white/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-500 dark:hover:text-purple-400 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
          title={t.downloadImage}
        >
          {isCapturing ? <Download size={16} className="animate-bounce"/> : <Share2 size={16} />}
        </button>
        <button
          onClick={handleToggleSave}
          className={`p-2 rounded-full transition-all duration-300 border ${
            isSaved 
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
              : 'bg-white/50 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-transparent hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-500 dark:hover:text-purple-400'
          }`}
          title={isSaved ? t.removeFromSaved : t.saveForLater}
        >
          {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <div className="p-6 pt-12 flex-1 relative z-10 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight drop-shadow-sm mb-3 pr-8">
          {gift.name}
        </h3>
        
        <div className="mb-4">
           <span className="inline-block bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            {gift.price_range}
          </span>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-light flex-1">
          {gift.reason}
        </p>

        {/* Greeting Scroll Area */}
        {showGreeting && (
          <div className="mt-4 animate-fade-in relative z-20">
            {/* Paper Container */}
            <div className="relative bg-[#fffdf5] dark:bg-[#1e1b2e] border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-none rotate-1 transform hover:rotate-0 transition-transform duration-300">
               {/* Paper texture/folds overlay hint */}
               <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-100/50 to-transparent pointer-events-none rounded-tr-lg"></div>
               
               {isGeneratingGreeting ? (
                 <div className="flex flex-col items-center justify-center py-6 text-amber-800 dark:text-amber-500/80 gap-3">
                   <Loader2 size={24} className="animate-spin text-amber-600" />
                   <span className="text-sm font-handwriting text-xl">{language === 'id' ? 'Sedang menulis surat...' : 'Writing a letter...'}</span>
                 </div>
               ) : (
                 <>
                   <div className="font-handwriting text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed tracking-wide selection:bg-amber-200 dark:selection:bg-amber-900/50 pb-2">
                     "{greetingText}"
                   </div>
                   <div className="mt-2 flex justify-end gap-2 border-t-2 border-dotted border-amber-200/50 dark:border-amber-900/30 pt-3">
                     <button 
                       onClick={handleGenerateGreeting}
                       className="p-1.5 text-amber-700/60 dark:text-amber-500/60 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                       title={language === 'id' ? 'Buat ulang' : 'Regenerate'}
                     >
                       <RefreshCcw size={16} />
                     </button>
                     <button 
                       onClick={handleCopyGreeting}
                       className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
                     >
                       {copied ? <Check size={16} /> : <Copy size={16} />}
                       {copied ? (language === 'id' ? 'Tersalin' : 'Copied') : (language === 'id' ? 'Salin' : 'Copy')}
                     </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Buttons - Hidden during image capture to keep it clean */}
      <div 
        data-html2canvas-ignore="true" 
        className="p-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 flex gap-2 relative z-10 backdrop-blur-sm"
      >
        <button
          onClick={handleGenerateGreeting}
          className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 group/btn ${
            showGreeting 
              ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/30' 
              : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-800/30'
          }`}
          title={language === 'id' ? "Buat Kartu Ucapan" : "Generate Greeting Card"}
        >
          <Feather size={18} className={`${showGreeting || isGeneratingGreeting ? 'fill-amber-500/20' : ''}`} />
        </button>

        <button
          onClick={handleSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-medium py-2 px-3 rounded-xl transition-all text-xs sm:text-sm group/btn"
        >
          <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
          {t.btnSearchGoogle}
        </button>
        <button
          onClick={handleShopSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 text-orange-600 dark:text-orange-200 border border-orange-200 dark:border-orange-500/20 hover:border-orange-400 dark:hover:border-orange-500/40 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-500/20 dark:hover:to-red-500/20 font-medium py-2 px-3 rounded-xl transition-all text-xs sm:text-sm group/btn"
        >
          <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
          {t.btnSearchShop}
        </button>
      </div>
    </div>
  );
};

export default GiftCard;