import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/formatters';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields marked * are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, currency);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Homepage Button */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] hover:bg-[#F1F4F9] dark:hover:bg-[#17223A] shadow-2xs transition-all"
            title="Return to CloudSpend Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="inline-flex items-center group focus-visible:outline-hidden">
            <BrandLogo size="sm" />
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold tracking-tight text-[#151A2D] dark:text-[#F4F6FF]">
            Create your account
          </h2>
          <p className="mt-1.5 text-xs text-[#64748B] dark:text-[#A3AEC7]">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#5145E5] dark:text-[#A5A0FF] hover:underline"
            >
              Sign in to existing account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#111A2E] py-8 px-6 sm:px-10 border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Google Sign-Up Integration */}
          <div>
            <GoogleAuthButton
              onSuccessRedirect={() => navigate('/dashboard')}
              onError={(msg) => setError(msg)}
              disabled={isSubmitting}
            />

            {/* Subtle Divider labeled OR */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E2E8F0] dark:via-[#26334D] to-transparent" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-[#111A2E] px-3.5 text-[#8A96AC] dark:text-[#7A88A4] font-semibold text-[11px] tracking-widest uppercase select-none">
                  OR
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3AEC7] pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3AEC7] pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3AEC7] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3AEC7] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Registering...' : 'Create CloudSpend Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
