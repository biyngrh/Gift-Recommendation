import React from 'react';
import { GiftHistoryItem } from '../types';
import { Clock, ChevronRight } from 'lucide-react';

interface HistoryItemProps {
  item: GiftHistoryItem;
  onClick: (item: GiftHistoryItem) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onClick }) => {
  return (
    <button 
      onClick={() => onClick(item)}
      className="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock size={12} />
          {new Date(item.timestamp).toLocaleDateString()}
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
      </div>
      <p className="text-slate-700 font-medium line-clamp-2 text-sm">
        "{item.description}"
      </p>
      <div className="mt-2 flex gap-1 flex-wrap">
        {item.recommendations.slice(0, 2).map((rec, i) => (
          <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {rec.name}
          </span>
        ))}
        {item.recommendations.length > 2 && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            +{item.recommendations.length - 2}
          </span>
        )}
      </div>
    </button>
  );
};

export default HistoryItem;