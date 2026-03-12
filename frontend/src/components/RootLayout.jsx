import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { useEffect } from 'react';
import useUserStore from '../store/userStore';

function RootLayout() {
  const { userRecord, fetchUser, loading } = useUserStore();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If token exists but store is empty, sync with backend
  useEffect(() => {
    if (token && !userRecord && !loading) {
      fetchUser();
    }
  }, [token, userRecord, loading, fetchUser]);

  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Home gets full-bleed; every other page gets the standard container */}
      <main className={isHome ? 'grow w-full' : 'grow max-w-7xl mx-auto w-full px-6 py-8'}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default RootLayout;