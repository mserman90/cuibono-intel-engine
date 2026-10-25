import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export const Tooltip = ({ content, children, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-normal min-w-[200px] max-w-[280px] p-2.5 bg-[#111827] text-gray-200 text-xs rounded-md shadow-2xl border border-[#06b6d4]/40 font-sans leading-relaxed backdrop-blur-md transition-opacity duration-200 animate-fadeIn ${getPositionClasses()}`}
        >
          <div className="text-[11px] text-gray-300 font-normal">{content}</div>
        </div>
      )}
    </div>
  );
};

export const InfoTooltip = ({ text, size = 13, className = 'text-gray-400 hover:text-cyber-accent ml-1' }) => {
  return (
    <Tooltip content={text} position="top">
      <span className={`cursor-help inline-flex items-center transition-colors ${className}`}>
        <HelpCircle size={size} />
      </span>
    </Tooltip>
  );
};
