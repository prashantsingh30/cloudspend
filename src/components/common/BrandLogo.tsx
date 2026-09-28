import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
  iconClassName?: string;
  textClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  iconClassName = '',
  textClassName = '',
}) => {
  // Dimensions based on size prop
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon */}
      <div
        className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]} ${iconClassName}`}
        aria-hidden="true"
      >
        <img
          src="/cloudspend_logo.svg"
          alt="CloudSpend Logo"
          className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]"
          loading="eager"
        />
      </div>

      {/* Brand Wordmark */}
      {variant === 'full' && (
        <span
          className={`font-heading font-bold tracking-tight text-slate-900 dark:text-white flex items-center leading-none ${textSizes[size]} ${textClassName}`}
        >
          <span>Cloud</span>
          <span className="text-[#5145E5] dark:text-[#818CF8]">Spend</span>
        </span>
      )}
    </div>
  );
};
