import React from 'react';
import { GiftRecommendation } from '../types';
import { ExternalLink, ShoppingBag } from 'lucide-react';

interface GiftCardProps {
  gift: GiftRecommendation;
  index: number;
}

const GiftCard: React.FC<GiftCardProps> = ({ gift, index }) => {
  const handleSearch = () => {
    const query = encodeURIComponent(gift.name);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleShopSearch = () => {
    const query = encodeURIComponent(gift.name);
    window.open(`https://shopee.co.id/search?keyword=${query}`, '_blank');
  };

  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 transform translate-y-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Decorative gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="p-6 flex-1 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-100 leading-tight drop-shadow-sm">
            {gift.name}
          </h3>
        </div>
        
        <div className="mb-4">
           <span className="inline-block bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            {gift.price_range}
          </span>
        </div>
        
        <p className="text-slate-300 text-sm leading-relaxed font-light">
          {gift.reason}
        </p>
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5 flex gap-3 relative z-10 backdrop-blur-sm">
        <button
          onClick={handleSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white font-medium py-2 px-4 rounded-xl transition-all text-sm group/btn"
        >
          <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
          Google
        </button>
        <button
          onClick={handleShopSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-200 border border-orange-500/20 hover:border-orange-500/40 hover:from-orange-500/20 hover:to-red-500/20 font-medium py-2 px-4 rounded-xl transition-all text-sm group/btn"
        >
          <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
          Shopee
        </button>
      </div>
    </div>
  );
};

export default GiftCard;