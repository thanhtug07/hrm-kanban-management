import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import SiderMenu from './SiderMenu';

const { Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <SiderMenu />
      <Layout style={{ background: '#f1f5f9', minHeight: '100vh' }}>
        <HeaderBar />
        <Content
          style={{
            margin: '20px 24px 0',
            flex: 1,
          }}
        >
          <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 12,
            padding: '18px 24px 22px',
            background: 'transparent',
          }}
        >
          <span style={{ fontWeight: 600, color: '#64748b' }}>HRM Portal</span> — Hệ thống Quản trị Nhân sự &amp; Điều phối Kanban
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
          © 2026 · ASP.NET Core 8 &amp; React 19 · BTL Cơ sở Dữ liệu
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
