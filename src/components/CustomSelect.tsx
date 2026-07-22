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
    <div ref={containerRef} className={`relative inline-block ${isOpen ? 'z-50' : 'z-10'} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl font-semibold transition-all border ${
          size === 'sm'
            ? 'px-3 py-2 text-xs'
            : 'px-3.5 py-2 text-xs sm:text-sm'
        } bg-white dark:bg-[#2e2b28] text-gray-700 dark:text-[#d4cfc6] border-gray-200 dark:border-[#3a3733] hover:bg-gray-50 dark:hover:bg-[#302d2a] focus:outline-none shadow-sm`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption?.icon && <selectedOption.icon className="h-3.5 w-3.5 text-gray-400" />}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-50 mt-1 min-w-[180px] max-h-64 overflow-y-auto rounded-xl p-1.5 bg-white dark:bg-[#242120] border border-gray-100 dark:border-[#3a3733] shadow-xl space-y-0.5`}
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FEF2F2] dark:bg-[#D7494C]/12 text-[#C43538] dark:text-[#e05c5f]'
                      : 'text-gray-700 dark:text-[#b8b3aa] hover:bg-gray-50 dark:hover:bg-[#302d2a]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && <opt.icon className="h-3.5 w-3.5 text-gray-400" />}
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D7494C] dark:text-[#e05c5f] ml-2 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
