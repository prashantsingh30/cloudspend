import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  BudgetTrackingSection,
  PdfFeatureSection,
  SecuritySection,
  FaqSection,
  Footer,
} from '../components/landing/LandingSections';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { ScrollToTopButton } from '../components/common/ScrollToTopButton';

export const LandingPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC] dark:bg-[#0B1020] text-[#151A2D] dark:text-[#F4F6FF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <BudgetTrackingSection />
        <PdfFeatureSection />
        <SecuritySection />
        <FaqSection />

        {/* Final CTA Banner */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-indigo-950/40 via-[#070B14] to-[#070B14] text-white text-center border-t border-indigo-500/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/15 blur-[140px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex justify-center mb-5">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-xl shadow-lg">
                <BrandLogo variant="icon-only" size="lg" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
              Start Managing Your Expenses with Absolute Clarity
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              No clutter. No third-party data tracking. Just clear financial insights and real-time monthly budget confidence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium text-slate-200 hover:text-white glass-card hover:bg-white/10 border border-white/15 rounded-full transition-all duration-200 active:scale-[0.98]"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
