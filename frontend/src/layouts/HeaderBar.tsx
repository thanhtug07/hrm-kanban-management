import React from 'react';
import { Layout, Button, Dropdown, Space, Avatar, Typography, MenuProps, Tag, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Header } = Layout;
const { Text } = Typography;

const ROUTE_NAMES: Record<string, string> = {
  dashboard: 'Tổng quan (Dashboard)',
  kanban: 'Bảng việc Kanban',
  nhanvien: 'Quản lý Nhân viên',
  taikhoan: 'Quản lý tài khoản đăng nhập',
  chamcong: 'Điểm danh & Chấm công',
  nghiphep: 'Quản lý Nghỉ phép',
  bangluong: 'Bảng lương & Chi trả',
};

export const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleTag = (role?: string) => {
    switch (role) {
      case 'Admin':
        return (
          <Tag color="#fef2f2" style={{ color: '#dc2626', borderColor: '#fecaca', fontWeight: 600 }}>
            Quản trị viên
          </Tag>
        );
      case 'HR':
        return (
          <Tag color="#eff6ff" style={{ color: '#2563eb', borderColor: '#bfdbfe', fontWeight: 600 }}>
            Nhân sự (HR)
          </Tag>
        );
      case 'NhanVien':
        return (
          <Tag color="#f0fdf4" style={{ color: '#16a34a', borderColor: '#bbf7d0', fontWeight: 600 }}>
            Nhân viên
          </Tag>
        );
      default:
        return null;
    }
  };

  const currentPathKey = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = ROUTE_NAMES[currentPathKey] || 'Trang chủ';
  const avatarStyle = getAvatarStyle(user?.hoTen);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '6px 4px' }}>
          <Text strong style={{ display: 'block', color: '#0f172a' }}>{user?.hoTen || 'Người dùng'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email || user?.tenDangNhap} • {user?.tenPB || 'Cán bộ nhân viên'}
          </Text>
        </div>
      ),
    },
    { type: 'divider' },
    ...(user?.vaiTro === 'Admin' || user?.vaiTro === 'HR'
      ? [
          {
            key: 'taikhoan',
            icon: <KeyOutlined />,
            label: 'Quản lý tài khoản đăng nhập',
            onClick: () => navigate('/taikhoan'),
          },
        ]
      : [
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Trang cá nhân & Đổi mật khẩu',
            onClick: () => navigate('/profile'),
          },
        ]),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Space size="middle">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: 16, width: 38, height: 38, color: '#475569' }}
        />
        <Breadcrumb
          items={[
            { title: 'Hệ thống' },
            { title: <span style={{ fontWeight: 600, color: '#0f172a' }}>{pageTitle}</span> },
          ]}
        />
      </Space>

      <Space size="middle">
        {getRoleTag(user?.vaiTro)}

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space
            style={{
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              transition: 'background 0.2s',
            }}
          >
            <Avatar
              size="small"
              style={{
                backgroundColor: avatarStyle.bg,
                color: avatarStyle.text,
                border: `1px solid ${avatarStyle.border}`,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {getInitials(user?.hoTen)}
            </Avatar>
            <Text strong style={{ fontSize: 13, color: '#1e293b', maxWidth: 140 }} ellipsis>
              {user?.hoTen || user?.tenDangNhap}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
