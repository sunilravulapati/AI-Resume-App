import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { useEffect } from 'react';
import useUserStore from '../store/userStore';

function RootLayout() {
  const { fetchUser } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, []);

  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className={isHome ? 'grow w-full' : 'grow max-w-7xl mx-auto w-full px-6 py-8'}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default RootLayout;