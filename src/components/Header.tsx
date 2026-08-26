'use client';

import Link from 'next/link';
import { Search, Bell, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Determine current page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/') return "Today";
    if (pathname === '/focus') return "Focus";
    if (pathname === '/gym') return "Gym";
    if (pathname === '/stats') return "Stats";
    if (pathname === '/journal') return "Journal";
    if (pathname === '/settings') return "Settings";
    return "Discipline OS";
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link href="/" className="flex items-center">
          <span className="header-logo">D</span>
          <span className="header-title">{getPageTitle()}</span>
        </Link>
      </div>
      
      <div className="header-center">
        <div className="relative header-search">
          <input 
            type="text" 
            placeholder="Search or command (⌘K)" 
            className="input w-full"
          />
          <Search className="header-search-icon" />
        </div>
      </div>
      
      <div className="header-right">
        <div className="streak-counter">
          <span className="streak-number">23</span>
          <span>days</span>
        </div>
        <ButtonIcon>
          <Bell className="h-4 w-4" />
        </ButtonIcon>
        <ButtonIcon>
          <UserCircle className="h-4 w-4" />
        </ButtonIcon>
      </div>
    </header>
  );
}

const ButtonIcon = ({ children }: { children: React.ReactNode }) => (
  <button 
    className="button-ghost flex items-center justify-center"
    aria-label="Notification"
  >
    {children}
  </button>
);