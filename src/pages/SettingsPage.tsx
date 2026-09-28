import React, { useState } from 'react';
import { AppSidebar } from '../components/common/AppSidebar';
import { AppHeader } from '../components/common/AppHeader';
import { AccountSettings } from '../components/settings/AccountSettings';

export const SettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#151A2D] dark:text-[#F4F6FF] flex transition-colors">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AppHeader
          title="Account Settings"
          subtitle="Manage your profile information, password, and preferences."
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AccountSettings />
        </main>
      </div>
    </div>
  );
};
