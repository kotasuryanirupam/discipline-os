'use client';

import Link from 'next/link';
import {
  Home,
  Zap,
  Dumbbell,
  BarChart2,
  BookOpen,
  Calendar,
  Settings,
  Sync,
  Moon,
} from 'lucide-react';

interface SidebarNavProps {
  collapsed: boolean;
}

export default function SidebarNav({ collapsed }: SidebarNavProps) {
  const navItems = [
    { name: 'Today', icon: Home, href: '/' },
    { name: 'Focus', icon: Zap, href: '/focus' },
    { name: 'Gym', icon: Dumbbell, href: '/gym' },
    { name: 'Stats', icon: BarChart2, href: '/stats' },
    { name: 'Journal', icon: BookOpen, href: '/journal' },
    { name: 'Calendar', icon: Calendar, href: '/calendar' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Sync', icon: Sync, href: '/sync' },
    { name: 'Theme', icon: Moon, href: '/theme' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/" className="flex items-center">
          <span className="sidebar-logo-text">Discipline OS</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="nav-item flex items-center gap-3 p-3 rounded-md"
          >
            {item.icon && (
              <span className="nav-item-icon h-4 w-4">
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <span className="nav-item-text">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="nav-item flex items-center gap-3 p-3 rounded-md"
          >
            {item.icon && (
              <span className="nav-item-icon h-4 w-4">
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <span className="nav-item-text">{item.name}</span>
            )}
          </Link>
        ))}
      </div>
    </aside>
  );
}