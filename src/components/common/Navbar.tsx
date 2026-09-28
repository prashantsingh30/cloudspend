import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Workflow, 
  ShieldCheck, 
  HelpCircle,
  Receipt
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight active section on scroll when on homepage and track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      const sectionIds = ['features', 'how-it-works', 'benefits', 'faq'];
      const scrollPos = window.scrollY + 140; // 140px offset
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

  const navItems = [
    { id: 'features', label: 'Capabilities', icon: Receipt },
    { id: 'how-it-works', label: 'Workflow', icon: Workflow },
    { id: 'benefits', label: 'Benefits', icon: Sliders },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#070B14]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/40 py-2.5 sm:py-3'
          : 'bg-white/60 dark:bg-[#070B14]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 py-3 sm:py-4'
      }`}
    >
      {/* Top subtle luxury edge glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Zone */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
          title="CloudSpend Home"
        >
          <BrandLogo size="md" />
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
            <span>v2.0 · Live</span>
          </div>
        </Link>

        {/* Center Desktop Navigation Capsule */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-inner text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-indigo-600 dark:text-white bg-white dark:bg-white/10 font-semibold shadow-xs border border-slate-200/60 dark:border-white/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Action Zone */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/60 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all duration-200 border border-slate-200/70 dark:border-white/10"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/30" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative inline-flex items-center justify-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group overflow-hidden"
              >
                {/* Subtle shine sheen effect on hover */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-900 dark:text-white bg-slate-100/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-3 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-indigo-500/70 dark:text-indigo-400/70" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
