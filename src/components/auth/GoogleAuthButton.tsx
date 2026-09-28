import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface GoogleAuthButtonProps {
  onSuccessRedirect?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccessRedirect,
  onError,
  disabled = false,
}) => {
  const { googleLogin } = useAuth();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(
    googleClientId &&
    googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' &&
    !googleClientId.includes('YOUR_')
  );

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const msg = 'No credential token received from Google.';
      setAuthError(msg);
      onError?.(msg);
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setAuthError(null);

    try {
      await googleLogin(credentialResponse.credential);
      onSuccessRedirect?.();
    } catch (err: any) {
      const msg = err?.message || 'Failed to authenticate with Google.';
      setAuthError(msg);
      onError?.(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = () => {
    const msg = 'Google sign-in was cancelled or encountered an error. Please try again.';
    setAuthError(msg);
    onError?.(msg);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Loading Overlay State */}
      {isProcessing && (
        <div className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 mb-3.5 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 border border-[#5145E5]/30 text-xs font-medium text-[#4338CA] dark:text-[#A5A0FF] shadow-xs backdrop-blur-xs animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-[#5145E5] dark:text-[#A5A0FF]" />
          <span>Verifying Google account & signing in...</span>
        </div>
      )}

      {/* Auth Error Banner if present */}
      {authError && !isProcessing && (
        <div className="w-full mb-3.5 p-3 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 shadow-xs transition-all animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{authError}</div>
        </div>
      )}

      {/* Google Login Component / Premium Styled Button */}
      <div
        className={`w-full relative group transition-all duration-200 ${
          disabled || isProcessing ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {isConfigured ? (
          <div className="w-full flex justify-center items-center overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#111A2E] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:border-[#CBD5E1] dark:hover:border-[#384868] transition-all duration-200 p-0.5 [&>div]:w-full [&>div]:flex [&>div]:justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              shape="rectangular"
              size="large"
              text="continue_with"
              width="384"
              logo_alignment="left"
              useOneTap={false}
              auto_select={false}
            />
          </div>
        ) : (
          /* Premium-grade Google Action Button */
          <button
            type="button"
            onClick={() => {
              const msg =
                'Google Client ID is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your .env file.';
              setAuthError(msg);
              onError?.(msg);
            }}
            className="w-full h-11 px-4 flex items-center justify-between rounded-xl border border-[#E2E8F0] dark:border-[#26334D] bg-gradient-to-b from-white via-white to-[#F8FAFC] dark:from-[#17223A] dark:via-[#141D32] dark:to-[#101728] text-[#1E293B] dark:text-[#F8FAFC] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:border-[#CBD5E1] dark:hover:border-[#384868] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5145E5]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111A2E] transition-all duration-200 cursor-pointer select-none group"
            title="Continue with your Google Account"
          >
            {/* Google Vector Icon */}
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            {/* Label */}
            <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#1E293B] dark:text-[#F1F5F9] group-hover:text-[#0F172A] dark:group-hover:text-white transition-colors">
              Continue with Google
            </span>

            {/* Trust badge indicator */}
            <div className="flex items-center text-[#94A3B8] dark:text-[#64748B] group-hover:text-[#5145E5] dark:group-hover:text-[#A5A0FF] transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
