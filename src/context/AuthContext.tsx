import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CurrencyCode } from '../types';
import { api, getToken, getStoredUser, removeToken } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency: CurrencyCode) => Promise<void>;
  googleLogin: (payload: { credential?: string; accessToken?: string } | string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, currency: CurrencyCode, dateFormat?: string, themePreference?: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function verifyUser() {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
        } catch {
          removeToken();
          setUser(null);
          setTokenState(null);
        }
      }
      setIsLoading(false);
    }

    verifyUser();

    const handleUnauthorized = () => {
      setUser(null);
      setTokenState(null);
      showToast('Your session has ended. Please log in again.', 'warning');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [showToast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setTokenState(res.token);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, currency: CurrencyCode) => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, password, currency);
      setUser(res.user);
      setTokenState(res.token);
      showToast('Account created successfully! Welcome to CloudSpend.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload: { credential?: string; accessToken?: string } | string) => {
    setIsLoading(true);
    try {
      const res = await api.googleLogin(payload);
      setUser(res.user);
      setTokenState(res.token);
      showToast(`Signed in with Google as ${res.user.name}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Google sign in failed.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
    showToast('You have been logged out securely.', 'info');
  };

  const updateProfile = async (name: string, currency: CurrencyCode, dateFormat?: string, themePreference?: string) => {
    try {
      const updated = await api.updateProfile(name, currency, dateFormat, themePreference);
      setUser(updated);
      showToast('Profile and currency preferences updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
      removeToken();
      setUser(null);
      setTokenState(null);
      showToast('Account successfully deleted.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
