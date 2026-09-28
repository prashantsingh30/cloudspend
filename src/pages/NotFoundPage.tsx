import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#151A2D] dark:text-[#F4F6FF] flex flex-col items-center justify-center p-4 text-center transition-colors">
      <div className="mb-4">
        <BrandLogo variant="icon-only" size="lg" />
      </div>
      <h1 className="text-3xl font-heading font-extrabold tracking-tight">404 — Page Not Found</h1>
      <p className="mt-2 text-xs sm:text-sm text-[#64748B] dark:text-[#A3AEC7] max-w-sm">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to CloudSpend</span>
      </Link>
    </div>
  );
};
