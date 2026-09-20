import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const MainLayout = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-900">
      <Header />
      <main className="flex-grow pt-24 md:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
