import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import SiderMenu from './SiderMenu';

const { Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <SiderMenu />
      <Layout style={{ background: '#f8fafc' }}>
        <HeaderBar />
        <Content
          style={{
            margin: '24px 24px 0',
            minHeight: 'calc(100vh - 144px)',
          }}
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 12,
            padding: '20px 24px',
            background: 'transparent',
          }}
        >
          Hệ thống Quản trị Nhân sự & Điều phối Kanban © 2026 • ASP.NET Core 8 & React 19 • BTL Cơ sở Dữ liệu
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
