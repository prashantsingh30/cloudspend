import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight active section on scroll when on homepage
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['features', 'how-it-works', 'benefits', 'faq'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120; // 120px offset for navbar
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur-xl transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone: Navigates to / */}
        <Link
          to="/"
          className="flex items-center group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
          title="CloudSpend Home"
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop & Tablet Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 rounded-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md text-xs font-semibold">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeSection === 'features'
                ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeSection === 'how-it-works'
                ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeSection === 'benefits'
                ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Benefits
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              activeSection === 'faq'
                ? 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            FAQ
          </button>
        </nav>

        {/* Actions Zone: Clean & Balanced */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 border border-slate-200/60 dark:border-slate-800/60"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" /> : <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 whitespace-nowrap"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#5145E5]" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#151A2D] dark:text-[#F4F6FF] hover:bg-slate-100 dark:hover:bg-[#17223A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7EAF2] dark:border-[#26334D] bg-white dark:bg-[#111A2E] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col gap-1 py-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className={`text-left py-2.5 px-3 rounded-lg transition-colors ${
                activeSection === 'features'
                  ? 'bg-[#5145E5]/10 text-[#5145E5] dark:text-[#A5A0FF] font-semibold'
                  : 'text-[#151A2D] dark:text-[#F4F6FF] hover:bg-[#F7F8FC] dark:hover:bg-[#17223A]'
              }`}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className={`text-left py-2.5 px-3 rounded-lg transition-colors ${
                activeSection === 'how-it-works'
                  ? 'bg-[#5145E5]/10 text-[#5145E5] dark:text-[#A5A0FF] font-semibold'
                  : 'text-[#151A2D] dark:text-[#F4F6FF] hover:bg-[#F7F8FC] dark:hover:bg-[#17223A]'
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className={`text-left py-2.5 px-3 rounded-lg transition-colors ${
                activeSection === 'benefits'
                  ? 'bg-[#5145E5]/10 text-[#5145E5] dark:text-[#A5A0FF] font-semibold'
                  : 'text-[#151A2D] dark:text-[#F4F6FF] hover:bg-[#F7F8FC] dark:hover:bg-[#17223A]'
              }`}
            >
              Benefits
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className={`text-left py-2.5 px-3 rounded-lg transition-colors ${
                activeSection === 'faq'
                  ? 'bg-[#5145E5]/10 text-[#5145E5] dark:text-[#A5A0FF] font-semibold'
                  : 'text-[#151A2D] dark:text-[#F4F6FF] hover:bg-[#F7F8FC] dark:hover:bg-[#17223A]'
              }`}
            >
              FAQ
            </button>
          </nav>

          <div className="pt-3 border-t border-[#E7EAF2] dark:border-[#26334D] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-[#5145E5] rounded-xl shadow-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] bg-[#F7F8FC] dark:bg-[#17223A] rounded-xl border border-[#E7EAF2] dark:border-[#26334D]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-[#5145E5] rounded-xl shadow-xs"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
