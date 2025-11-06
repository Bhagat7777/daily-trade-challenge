import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import Fab from '../ui/Fab';
import { useAuth } from '@/contexts/AuthContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      {user && (
        <>
          <Fab />
          <MobileNav />
        </>
      )}
    </div>
  );
};

export default Layout;