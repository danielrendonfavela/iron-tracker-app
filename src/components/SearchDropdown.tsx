import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';

interface SearchDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  onAddNew: (name: string) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  options,
  value,
  onChange,
  onAddNew
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex bg-black border-2 border-zinc-800 focus-within:border-red-600 transition-colors">
        <div className="pl-3 flex items-center text-zinc-600">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={isOpen ? search : value || search}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (value) setSearch(value);
          }}
          placeholder="BUSCAR EJERCICIO..."
          className="w-full bg-transparent p-3 text-sm font-bold text-white uppercase outline-none placeholder:text-zinc-600"
        />
        {value && !isOpen && (
          <button
            onClick={() => {
              onChange('');
              setSearch('');
            }}
            className="pr-4 text-zinc-600 hover:text-white p-2"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-zinc-900 border-2 border-zinc-800 shadow-2xl z-50 max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <div
              key={i}
              onMouseDown={() => {
                onChange(opt);
                setSearch(opt);
                setIsOpen(false);
              }}
              className="p-3 border-b border-zinc-800 text-xs font-bold text-zinc-300 hover:bg-red-600 hover:text-white cursor-pointer uppercase transition-colors"
            >
              {opt}
            </div>
          ))}
          {search.trim() && !options.some(o => o.toLowerCase() === search.trim().toLowerCase()) && (
            <div
              onMouseDown={() => {
                onAddNew(search.trim());
                onChange(search.trim());
                setIsOpen(false);
              }}
              className="p-3 bg-black text-red-500 text-xs font-black cursor-pointer flex items-center gap-2 border-t-2 border-red-900/50 sticky bottom-0 hover:bg-red-950/40 uppercase"
            >
              <Plus className="w-4 h-4" /> CREAR: "{search.toUpperCase()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
