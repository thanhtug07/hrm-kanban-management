import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  DollarOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Sider } = Layout;

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const ROLE_LABEL: Record<string, string> = {
  Admin: 'Quản trị viên',
  HR: 'Nhân sự (HR)',
  NhanVien: 'Nhân viên',
};

const ROLE_CLASS: Record<string, string> = {
  Admin: 'is-admin',
  HR: 'is-hr',
  NhanVien: 'is-nv',
};

export const SiderMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarCollapsed } = useUiStore();

  const vaiTro = user?.vaiTro;
  const isAdminOrHr = vaiTro === 'Admin' || vaiTro === 'HR';

  const sections = useMemo<NavSection[]>(() => {
    const sections: NavSection[] = [
      {
        label: 'Tổng quan',
        items: [
          { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
          { key: '/kanban', icon: <ProjectOutlined />, label: 'Bảng việc Kanban' },
        ],
      },
      {
        label: 'Nghiệp vụ',
        items: [
          { key: '/chamcong', icon: <CalendarOutlined />, label: 'Điểm danh & Chấm công' },
          { key: '/nghiphep', icon: <ScheduleOutlined />, label: 'Quản lý Nghỉ phép' },
          { key: '/bangluong', icon: <DollarOutlined />, label: 'Bảng lương & Chi trả' },
          ...(isAdminOrHr
            ? [{ key: '/nhanvien', icon: <TeamOutlined />, label: 'Quản lý Nhân viên' }]
            : []),
        ],
      },
    ];

    sections.push({
      label: 'Quản trị',
      items: isAdminOrHr
        ? [{ key: '/taikhoan', icon: <SafetyCertificateOutlined />, label: 'Quản lý tài khoản' }]
        : [{ key: '/profile', icon: <UserOutlined />, label: 'Trang cá nhân' }],
    });

    return sections;
  }, [isAdminOrHr]);

  const selectedKey = '/' + location.pathname.split('/')[1];
  const avatarStyle = getAvatarStyle(user?.hoTen);
  const roleLabel = user?.vaiTro ? ROLE_LABEL[user.vaiTro] : 'Người dùng';
  const roleClass = user?.vaiTro ? ROLE_CLASS[user.vaiTro] : 'is-nv';

  const renderMenu = (section: NavSection) => {
    const menuItems = section.items.map((it) => ({
      key: it.key,
      icon: it.icon,
      label: sidebarCollapsed ? null : it.label,
    }));

    const menu = (
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    );

    return (
      <div key={section.label}>
        {!sidebarCollapsed && <div className="hrm-section-label">{section.label}</div>}
        {menu}
      </div>
    );
  };

  const userCard = (
    <div className="hrm-user-card" onClick={() => navigate(isAdminOrHr ? '/taikhoan' : '/profile')}>
      <Avatar
        size={34}
        style={{
          backgroundColor: avatarStyle.bg,
          color: avatarStyle.text,
          border: `1px solid ${avatarStyle.border}`,
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {getInitials(user?.hoTen)}
      </Avatar>
      {!sidebarCollapsed && (
        <div className="hrm-user-meta">
          <span className="hrm-user-name">{user?.hoTen || user?.tenDangNhap}</span>
          <span className={`hrm-user-role ${roleClass}`}>{roleLabel}</span>
        </div>
      )}
    </div>
  );

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      width={256}
      breakpoint="lg"
      collapsedWidth={0}
      theme="light"
      className={`hrm-sider${sidebarCollapsed ? ' hrm-sider-collapsed' : ''}`}
    >
      {/* Brand */}
      <div className="hrm-brand">
        <div className="hrm-brand-logo">H</div>
        {!sidebarCollapsed && (
          <div className="hrm-brand-text">
            <span className="hrm-brand-title">HRM Portal</span>
            <span className="hrm-brand-sub">
              Enterprise
              <span className="hrm-pro-badge">PRO</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="hrm-nav">
        {sections.map(renderMenu)}
      </div>

      {/* Footer */}
      <div className="hrm-footer">
        {sidebarCollapsed ? (
          <Tooltip title={user?.hoTen || 'Người dùng'} placement="right">
            {userCard}
          </Tooltip>
        ) : (
          <>
            {userCard}
            <div className="hrm-status-row">
              <span className="hrm-status-text">
                <DatabaseOutlined style={{ color: '#0d9488' }} />
                QUANLYNHANSU
              </span>
              <span className="hrm-status-text">
                <span className="hrm-status-dot" />
                Online
              </span>
            </div>
          </>
        )}
      </div>
    </Sider>
  );
};

export default SiderMenu;
