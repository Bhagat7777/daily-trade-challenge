import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, BarChart3, User, LogOut, Shield, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      const {
        data: profile
      } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsAdmin(profile?.role === 'admin');
    };
    checkAdminStatus();
  }, [user]);
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const isActive = (path: string) => location.pathname === path;
  return <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer min-w-0" onClick={() => navigate('/')}>
          <div className="p-1 sm:p-1.5 bg-gradient-primary rounded-lg flex-shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
            <span className="font-bold text-foreground hidden md:block text-base lg:text-lg">PropfirmKnowledge Trading Journal</span>
            <span className="font-bold text-foreground hidden sm:block md:hidden text-sm">PFK Journal</span>
            <span className="font-bold text-xs text-foreground sm:hidden truncate">Journal</span>
          </div>
        </div>

        {/* Navigation & User Menu */}
        <div className="flex items-center gap-4">
          {user ? <>
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant={isActive('/submit') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/submit')}>
                  Submit Trade
                </Button>
                <Button variant={isActive('/campaigns') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/campaigns')}>
                  Campaigns
                </Button>
                <Button variant={isActive('/leaderboard') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/leaderboard')}>
                  Leaderboard
                </Button>
                <Button variant={isActive('/hall-of-fame') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/hall-of-fame')} className="hidden lg:flex">
                  Hall of Fame
                </Button>
                <Button variant={isActive('/rules') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/rules')}>
                  Rules
                </Button>
                {isAdmin && <Button variant={isActive('/admin-dashboard') ? 'default' : 'ghost'} size="sm" onClick={() => navigate('/admin-dashboard')} className="text-orange-600 hover:text-orange-700">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Button>}
              </nav>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover/95 backdrop-blur" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.username || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/hall-of-fame')}>
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Hall of Fame</span>
                  </DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                      <Shield className="mr-2 h-4 w-4 text-orange-600" />
                      <span className="text-orange-600">Admin Dashboard</span>
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <Button onClick={() => navigate('/auth')} className="bg-gradient-primary hover:opacity-90">
              Login / Sign Up
            </Button>}
        </div>
      </div>
    </header>;
};
export default Header;