import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

const DashboardLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: '1 0 auto', width: '100%' }}>
        <div className="dashboard-layout">
          <Sidebar />
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
      <Toast />
    </div>
  );
};

export default DashboardLayout;
