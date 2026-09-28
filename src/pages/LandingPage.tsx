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
        <section className="py-20 bg-linear-to-br from-[#5145E5] to-[#3730A3] text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-4">
              <BrandLogo variant="icon-only" size="lg" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
              Start Managing Your Expenses with Clarity
            </h2>
            <p className="mt-4 text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
              No clutter. No third-party data tracking. Just clear financial insights and monthly budget confidence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#5145E5] bg-white hover:bg-slate-50 rounded-xl shadow-lg transition-all"
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white hover:bg-white/10 border border-white/20 rounded-xl transition-all"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
