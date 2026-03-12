import { Outlet, Navigate, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { useEffect } from 'react';
import useUserStore from '../store/userStore';

function RootLayout() {
  const { userRecord, fetchUser, loading } = useUserStore();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // If token exists but store is empty, sync with backend
    if (token && !userRecord && !loading) {
      fetchUser(); 
    }
  }, [token, userRecord, loading, fetchUser]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="grow max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootLayout;