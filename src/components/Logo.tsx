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
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`group flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      {/* Bear-red emblem — abstract upward arrow through a target ring */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer rounded square bg */}
          <rect width="36" height="36" rx="10" fill="#D7494C"/>
          
          {/* Abstract "CC" / craft mark — two overlapping arcs forming a dynamic target + upward motion */}
          {/* Outer arc — open circle (3/4) */}
          <path
            d="M25 18C25 21.866 21.866 25 18 25C14.134 25 11 21.866 11 18C11 14.134 14.134 11 18 11"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Inner accent arc */}
          <path
            d="M22 18C22 20.209 20.209 22 18 22C15.791 22 14 20.209 14 18C14 15.791 15.791 14 18 14"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
          {/* Upward arrow shaft */}
          <line x1="18" y1="18" x2="18" y2="9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          {/* Arrow head */}
          <polyline points="15,12 18,9 21,12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Center dot */}
          <circle cx="18" cy="18" r="1.5" fill="white"/>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight text-gray-900 dark:text-[#e8e3d9] ${textSizes[size]} group-hover:text-[#D7494C] dark:group-hover:text-[#e05c5f] transition-colors duration-150`}>
          CareerCraft
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-semibold text-gray-400 dark:text-[#6b6560] uppercase tracking-widest mt-0.5">
            Career Workspace
          </span>
        )}
      </div>
    </div>
  );
};
