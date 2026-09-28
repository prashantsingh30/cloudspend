import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll back to top of page"
        title="Scroll to top"
        className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/90 dark:bg-[#111A2E]/90 backdrop-blur-md border border-slate-200/90 dark:border-[#26334D] text-slate-600 dark:text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(81,69,229,0.35)] hover:border-[#5145E5]/60 dark:hover:border-[#5145E5]/60 hover:text-[#5145E5] dark:hover:text-[#A5A0FF] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5145E5] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B1020]"
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-slate-200/40 dark:stroke-slate-800/60"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            className="stroke-[#5145E5] dark:stroke-[#818CF8] transition-all duration-150"
            strokeWidth="2.5"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - scrollProgress / 100)}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Arrow Icon with micro-bounce animation on hover */}
        <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />

        {/* Premium subtle glow overlay */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#5145E5]/0 to-[#5145E5]/10 dark:to-[#5145E5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </button>
    </div>
  );
};
