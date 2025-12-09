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
    // Open Google Search in a new tab
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleShopSearch = () => {
    const query = encodeURIComponent(gift.name);
    // Open Shopee (Indonesia context) search
    window.open(`https://shopee.co.id/search?keyword=${query}`, '_blank');
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300 transform translate-y-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-slate-800 leading-tight">
            {gift.name}
          </h3>
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {gift.price_range}
          </span>
        </div>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {gift.reason}
        </p>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button
          onClick={handleSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
        >
          <ExternalLink size={16} />
          Google
        </button>
        <button
          onClick={handleShopSearch}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
        >
          <ShoppingBag size={16} />
          Shopee
        </button>
      </div>
    </div>
  );
};

export default GiftCard;