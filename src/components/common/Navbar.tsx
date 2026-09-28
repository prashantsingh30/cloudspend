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
    <header className="sticky top-0 z-40 w-full border-b border-[#E7EAF2] dark:border-[#26334D] bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone: Navigates to / */}
        <Link
          to="/"
          className="flex items-center group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5145E5] rounded-xl"
          title="CloudSpend Home"
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop & Tablet Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'features'
                ? 'text-[#5145E5] dark:text-[#A5A0FF] font-semibold bg-[#5145E5]/10 dark:bg-[#5145E5]/20'
                : 'text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF]'
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'how-it-works'
                ? 'text-[#5145E5] dark:text-[#A5A0FF] font-semibold bg-[#5145E5]/10 dark:bg-[#5145E5]/20'
                : 'text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF]'
            }`}
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'benefits'
                ? 'text-[#5145E5] dark:text-[#A5A0FF] font-semibold bg-[#5145E5]/10 dark:bg-[#5145E5]/20'
                : 'text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF]'
            }`}
          >
            Benefits
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'faq'
                ? 'text-[#5145E5] dark:text-[#A5A0FF] font-semibold bg-[#5145E5]/10 dark:bg-[#5145E5]/20'
                : 'text-[#64748B] dark:text-[#A3AEC7] hover:text-[#5145E5] dark:hover:text-[#A5A0FF]'
            }`}
          >
            FAQ
          </button>
        </nav>

        {/* Actions Zone: Clean & Balanced */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#17223A] transition-colors border border-transparent hover:border-[#E7EAF2] dark:hover:border-[#26334D]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#5145E5]" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5145E5] rounded-xl hover:bg-[#4338CA] shadow-xs transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] hover:text-[#5145E5] dark:hover:text-[#A5A0FF] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all whitespace-nowrap"
              >
                Get Started Free
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
