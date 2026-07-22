import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-9.5 w-9.5',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`group flex items-center gap-3 cursor-pointer select-none ${className}`}>
      {/* Ultra-Modern Glowing Badge Emblem */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-slate-900 dark:bg-[#181922] text-white flex items-center justify-center font-extrabold shadow-md border border-slate-800 dark:border-[#2f3042] flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/20 overflow-hidden`}>
        {/* Subtle Background Radial Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Sleek Precision Apex Compass Emblem SVG */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="relative z-10 h-5 w-5 text-indigo-400 dark:text-indigo-300 group-hover:text-white transition-colors duration-200 stroke-current" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Angled Diamond Core */}
          <path d="M12 3L20 11L12 19L4 11L12 3Z" />
          {/* Inner Precision Cross Spark */}
          <path d="M12 7V15" strokeWidth="2" />
          <path d="M8 11H16" strokeWidth="2" />
          {/* Center Core Dot */}
          <circle cx="12" cy="11" r="1.5" className="fill-current text-white dark:text-indigo-200" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white leading-none ${textSizes[size]} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
          CareerCraft
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
            Career Workspace
          </span>
        )}
      </div>
    </div>
  );
};
