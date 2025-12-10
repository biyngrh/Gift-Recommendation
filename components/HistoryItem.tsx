import React from 'react';
import { GiftHistoryItem } from '../types';
import { Clock, Trash2, ChevronRight } from 'lucide-react';

interface HistoryItemProps {
  item: GiftHistoryItem;
  onClick: (item: GiftHistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onClick, onDelete }) => {
  return (
    <div className="group relative flex bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300 mb-3 overflow-hidden shadow-lg shadow-black/20">
      <button 
        onClick={() => onClick(item)}
        className="flex-1 text-left p-4 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <Clock size={12} className="text-purple-400" />
          {new Date(item.timestamp).toLocaleDateString()}
        </div>
        <p className="text-slate-200 font-medium line-clamp-1 text-sm mb-2.5 pr-2 group-hover:text-white transition-colors">
          {item.description}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {item.recommendations.slice(0, 2).map((rec, i) => (
            <span key={i} className="text-[10px] bg-black/40 text-slate-400 px-2 py-1 rounded-full border border-white/5">
              {rec.name}
            </span>
          ))}
          {item.recommendations.length > 2 && (
            <span className="text-[10px] bg-black/40 text-slate-500 px-2 py-1 rounded-full border border-white/5">
              +{item.recommendations.length - 2}
            </span>
          )}
        </div>
      </button>
      
      <div className="flex flex-col border-l border-white/5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="flex-1 w-10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Remove from history"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {/* Decorative highlight */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default HistoryItem;