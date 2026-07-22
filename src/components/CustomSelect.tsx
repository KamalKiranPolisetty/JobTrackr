import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  size = 'md',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-xl font-bold transition-all border shadow-sm ${
          size === 'sm'
            ? 'px-2.5 py-1 text-xs'
            : 'px-3.5 py-2 text-xs sm:text-sm'
        } bg-white/90 dark:bg-[#1f202a] text-slate-800 dark:text-zinc-100 border-slate-200/90 dark:border-[#2f303d] hover:bg-slate-100 dark:hover:bg-[#282936] focus:outline-none`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption?.icon && <selectedOption.icon className="h-3.5 w-3.5 text-slate-400" />}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} z-50 mt-1 min-w-[160px] max-h-64 overflow-y-auto rounded-xl p-1.5 bg-white dark:bg-[#16171d] border border-slate-200 dark:border-[#2f303d] shadow-2xl backdrop-blur-2xl space-y-0.5`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-[#252634] dark:text-white font-extrabold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1f202a]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && <opt.icon className="h-3.5 w-3.5 text-slate-400" />}
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
