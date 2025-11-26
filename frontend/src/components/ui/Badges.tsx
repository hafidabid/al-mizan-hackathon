import React from 'react';
import { CheckCircle, Heart, BookOpen, UserCheck, Coins, Leaf } from 'lucide-react';
import { MAQASID } from '../../data/mockData';

// Helper to get icon component
export const getMaqasidIconComponent = (id: string, size = 14) => {
    switch(id) {
        case 'din': return <CheckCircle size={size} />;
        case 'nafs': return <Heart size={size} />;
        case 'aql': return <BookOpen size={size} />;
        case 'nasl': return <UserCheck size={size} />;
        case 'mal': return <Coins size={size} />;
        case 'biah': return <Leaf size={size} />;
        default: return <CheckCircle size={size} />;
    }
};

export const MaqasidIcon = ({ type }: { type: string }) => {
  const m = MAQASID[type];
  if (!m) return null;
  return (
    <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-100" title={m.label}>
      {getMaqasidIconComponent(m.id)}
      <span>{type}</span>
    </div>
  );
};

export const SdgBadge = ({ number }: { number: number }) => {
  const colors: Record<number, string> = {
    1: 'bg-red-500', 2: 'bg-yellow-500', 4: 'bg-red-700',
    7: 'bg-yellow-400', 9: 'bg-orange-500', 13: 'bg-green-700'
  };
  return (
    <div className={`${colors[number] || 'bg-gray-500'} w-6 h-6 rounded flex items-center justify-center mr-1 shadow-sm text-white text-[10px] font-bold`} title={`SDG ${number}`}>
      {number}
    </div>
  );
};

