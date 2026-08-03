import React from 'react';
import { Dumbbell, Brain, LineChart, Table, Target, LucideIcon } from 'lucide-react';
import { TabType } from '../types/gym';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const items: NavItem[] = [
    { id: 'session', label: 'SESIÓN', icon: Dumbbell },
    { id: 'coach', label: 'COACH', icon: Brain, highlight: true },
    { id: 'charts', label: 'PROGRESO', icon: LineChart },
    { id: 'history', label: 'MARCAS', icon: Table },
    { id: 'tools', label: 'TOOLS', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950 border-t-2 border-zinc-900 pb-safe z-40">
      <div className="max-w-md mx-auto flex justify-between">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center py-3 px-1 gap-1 border-t-2 transition-all ${
                isActive
                  ? 'border-red-600 text-white bg-zinc-900/80 font-bold'
                  : item.highlight
                  ? 'border-transparent text-red-500/80 hover:text-red-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-red-600 scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[9px] font-black tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
