import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: '1 0 auto' }}>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default MainLayout;
