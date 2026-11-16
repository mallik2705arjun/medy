import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`super-admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="super-admin-body">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="super-admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
