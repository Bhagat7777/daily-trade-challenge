import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Trophy, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/campaigns', icon: BarChart3, label: 'Campaigns' },
  { href: '/submit', icon: PlusCircle, label: 'Submit' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaders' },
  { href: '/hall-of-fame', icon: Users, label: 'Fame' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full text-xs gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;