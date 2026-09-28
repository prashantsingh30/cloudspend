import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText,
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfModal?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  onOpenPdfModal,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#10172A]/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#111A2E] border-r border-[#E7EAF2] dark:border-[#26334D] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header: clicking logo navigates to public homepage */}
        <div className="h-16 px-5 border-b border-[#E7EAF2] dark:border-[#26334D] flex items-center justify-between">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5145E5] rounded-xl"
            title="CloudSpend Homepage"
          >
            <BrandLogo size="md" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#151A2D] dark:text-[#A3AEC7] dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] uppercase tracking-wider mb-2">
            Overview
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#5145E5]/10 text-[#5145E5] dark:bg-[#5145E5]/20 dark:text-[#A5A0FF] font-semibold border-l-2 border-[#5145E5]'
                      : 'text-[#64748B] hover:text-[#151A2D] hover:bg-[#F1F4F9] dark:text-[#A3AEC7] dark:hover:text-white dark:hover:bg-[#17223A]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 mt-2 border-t border-[#E7EAF2] dark:border-[#26334D]">
            <p className="px-3 text-[11px] font-semibold text-[#64748B] dark:text-[#A3AEC7] uppercase tracking-wider mb-2">
              Exports & Tools
            </p>
            {onOpenPdfModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPdfModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg text-[#64748B] hover:text-[#151A2D] hover:bg-[#F1F4F9] dark:text-[#A3AEC7] dark:hover:text-white dark:hover:bg-[#17223A] transition-colors text-left"
              >
                <FileText className="w-4 h-4 shrink-0 text-[#5145E5] dark:text-[#A5A0FF]" />
                <span>Download PDF Report</span>
              </button>
            )}
          </div>
        </div>

        {/* User Profile Bar & Logout */}
        <div className="p-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#5145E5]/15 text-[#5145E5] dark:bg-[#5145E5]/30 dark:text-[#A5A0FF] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CS'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] truncate">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#A3AEC7] truncate font-mono">
                  {user?.currency || 'USD'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-[#64748B] hover:text-rose-600 dark:text-[#A3AEC7] dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
