'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import SidebarNav from '@/components/SidebarNav';
import Header from '@/components/Header';
import { AppStateProvider } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Handle sidebar collapse on mobile
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppStateProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <SidebarNav collapsed={sidebarCollapsed} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </div>
    </AppStateProvider>
  );
}