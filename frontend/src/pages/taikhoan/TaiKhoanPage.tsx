import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Switch,
  Popconfirm,
  message,
  Avatar,
  Tabs,
  Tooltip,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { taiKhoanApi } from '@/api/taiKhoanApi';
import { TaiKhoanDto } from '@/types/taiKhoan';
import { useAuthStore } from '@/stores/authStore';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import { PageHeader } from '@/components/PageHeader';

import AccountKpiCards from './components/AccountKpiCards';
import CreateAccountModal from './components/CreateAccountModal';
import EditAccountModal from './components/EditAccountModal';
import ProfilePage from '@/pages/profile/ProfilePage';

export const TaiKhoanPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.vaiTro === 'Admin';

  const [accounts, setAccounts] = useState<TaiKhoanDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TaiKhoanDto | null>(null);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await taiKhoanApi.getAll();
      if (res && res.success && res.data) {
        setAccounts(res.data);
      } else {
        message.error(res?.message || 'Không thể tải danh sách tài khoản.');
      }
    } catch {
      message.error('Không thể kết nối đến máy chủ Quản lý tài khoản.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle Switch Status
  const handleToggleStatus = async (account: TaiKhoanDto, checked: boolean) => {
    try {
      const res: any = await taiKhoanApi.updateStatus(account.maTK, { trangThai: checked });
      if (res && res.success) {
        message.success(checked ? 'Đã kích hoạt tài khoản.' : 'Đã khóa tài khoản thành công.');
        setAccounts((prev) =>
          prev.map((a) => (a.maTK === account.maTK ? { ...a, trangThai: checked } : a))
        );
      } else {
        message.error(res?.message || 'Cập nhật trạng thái thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Lỗi khi cập nhật trạng thái tài khoản.');
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (id: number) => {
    try {
      const res: any = await taiKhoanApi.delete(id);
      if (res && res.success) {
        message.success('Đã xóa tài khoản khỏi hệ thống.');
        fetchAccounts();
      } else {
        message.error(res?.message || 'Xóa tài khoản thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Lỗi khi xóa tài khoản.');
    }
  };

  // Filtered List
  const filteredAccounts = accounts.filter((acc) => {
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      const matchUsername = acc.tenDangNhap.toLowerCase().includes(s);
      const matchMaNV = acc.maNV ? acc.maNV.toLowerCase().includes(s) : false;
      const matchHoTen = acc.hoTen ? acc.hoTen.toLowerCase().includes(s) : false;
      if (!matchUsername && !matchMaNV && !matchHoTen) return false;
    }

    if (filterRole && acc.vaiTro !== filterRole) {
      return false;
    }

    if (filterStatus !== undefined) {
      const isAct = filterStatus === 'active';
      if (acc.trangThai !== isAct) return false;
    }

    return true;
  });

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'Admin':
        return (
          <Tag
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              borderColor: '#FECACA',
              fontWeight: 650,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Quản trị viên (Admin)
          </Tag>
        );
      case 'HR':
        return (
          <Tag
            style={{
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              borderColor: '#BFDBFE',
              fontWeight: 650,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Nhân sự (HR)
          </Tag>
        );
      default:
        return (
          <Tag
            style={{
              backgroundColor: '#F3F4F6',
              color: '#4B5563',
              borderColor: '#E5E7EB',
              fontWeight: 500,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Nhân viên
          </Tag>
        );
    }
  };

  const columns = [
    {
      title: 'Nhân viên liên kết',
      key: 'nhanVien',
      width: 250,
      render: (_: any, record: TaiKhoanDto) => {
        const displayName = record.hoTen || (record.maNV ? `Mã: ${record.maNV}` : 'Tài khoản độc lập');
        const avatar = getAvatarStyle(displayName);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={34}
              style={{
                backgroundColor: avatar.bg,
                color: avatar.text,
                border: `1px solid ${avatar.border}`,
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {getInitials(displayName)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 650, fontSize: 13, color: '#0F172A' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>
                {record.maNV ? `Mã NV: ${record.maNV}` : 'Tài khoản ngoài công ty'}{' '}
                {record.tenPB && `• ${record.tenPB}`}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'tenDangNhap',
      key: 'tenDangNhap',
      width: 170,
      render: (val: string) => (
        <span
          style={{
            fontFamily: 'Consolas, monospace',
            fontWeight: 650,
            color: '#1E293B',
            fontSize: 13,
            backgroundColor: '#F1F5F9',
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: 170,
      render: (val: string) => getRoleTag(val),
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 160,
      render: (val: string) => (
        <span style={{ fontSize: 12.5, color: '#64748B' }}>
          {val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: boolean, record: TaiKhoanDto) => (
        <Space size={8}>
          <Switch
            checked={val}
            onChange={(checked) => handleToggleStatus(record, checked)}
            style={{
              backgroundColor: val ? '#10B981' : '#CBD5E1',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: val ? '#059669' : '#EF4444',
            }}
          >
            {val ? 'Hoạt động' : 'Bị khóa'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, record: TaiKhoanDto) => (
        <Space size={6}>
          <Tooltip title="Chỉnh sửa tài khoản & đổi mật khẩu tùy ý">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#0F766E', fontSize: 15 }} />}
              onClick={() => {
                setSelectedAccount(record);
                setEditModalOpen(true);
              }}
            />
          </Tooltip>

          {isAdmin && (
            <Popconfirm
              title="Xóa tài khoản người dùng"
              description={`Bạn có chắc chắn muốn xóa tài khoản '${record.tenDangNhap}' không?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, size: 'small' }}
              cancelButtonProps={{ size: 'small' }}
              onConfirm={() => handleDeleteAccount(record.maTK)}
            >
              <Tooltip title="Xóa tài khoản vĩnh viễn">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined style={{ color: '#EF4444', fontSize: 15 }} />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 24 }}>
      {/* Header Trang */}
      <PageHeader
        title="Quản Lý Tài Khoản Đăng Nhập"
        subtitle="Quản lý thông tin đăng nhập, vai trò và trạng thái hoạt động của nhân sự."
        icon={<SafetyCertificateOutlined />}
        extra={
          <>
            <Button
              icon={<ReloadOutlined />}
              shape="round"
              onClick={fetchAccounts}
              loading={loading}
              style={{ border: '1px solid #D1D5DB', fontSize: 13, height: 36 }}
            >
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              shape="round"
              onClick={() => setCreateModalOpen(true)}
              style={{
                backgroundColor: '#0F766E',
                borderColor: '#0F766E',
                fontWeight: 500,
                fontSize: 13,
                height: 36,
                padding: '0 18px',
                boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)',
              }}
            >
              Cấp Tài Khoản Mới
            </Button>
          </>
        }
      />

      {/* Tabs Phân Chia: Quản Lý & Cài Đặt Cá Nhân */}
      <Tabs
        defaultActiveKey="account-list"
        items={[
          {
            key: 'account-list',
            label: (
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                Danh Sách Tài Khoản ({accounts.length})
              </span>
            ),
            children: (
              <div>
                {/* 1. KPI Cards */}
                <AccountKpiCards accounts={accounts} loading={loading} />

                {/* 2. Thanh Công Cụ (Toolbar) */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 16,
                    padding: '12px 16px',
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Input
                      placeholder="Tìm theo Username, Mã NV, Họ tên..."
                      prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      style={{ width: 280, borderRadius: 8 }}
                    />

                    <Select
                      placeholder="Tất cả Vai trò"
                      allowClear
                      value={filterRole}
                      onChange={setFilterRole}
                      style={{ width: 170 }}
                      dropdownStyle={{ borderRadius: 8 }}
                      options={[
                        { value: 'Admin', label: 'Quản trị viên (Admin)' },
                        { value: 'HR', label: 'Nhân sự (HR)' },
                        { value: 'NhanVien', label: 'Nhân viên' },
                      ]}
                    />

                    <Select
                      placeholder="Trạng thái"
                      allowClear
                      value={filterStatus}
                      onChange={setFilterStatus}
                      style={{ width: 160 }}
                      dropdownStyle={{ borderRadius: 8 }}
                      options={[
                        { value: 'active', label: 'Đang hoạt động' },
                        { value: 'locked', label: 'Đang bị khóa' },
                      ]}
                    />
                  </div>

                  <span style={{ fontSize: 12.5, color: '#64748B' }}>
                    Hiển thị: <strong style={{ color: '#0F172A' }}>{filteredAccounts.length}</strong> / {accounts.length}
                  </span>
                </div>

                {/* 3. Bảng Dữ Liệu Chính */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #F1F5F9',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Table
                    columns={columns}
                    dataSource={filteredAccounts}
                    rowKey="maTK"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    sticky
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Chưa có tài khoản nào phù hợp."
                          style={{ padding: '36px 0' }}
                        />
                      ),
                    }}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: true,
                      pageSizeOptions: ['8', '15', '30'],
                      showTotal: (total) => `Tổng cộng ${total} tài khoản`,
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: 'my-profile',
            label: (
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                <SettingOutlined style={{ marginRight: 6 }} />
                Cài Đặt Cá Nhân & Đổi Mật Khẩu
              </span>
            ),
            children: <ProfilePage />,
          },
        ]}
      />

      {/* Modal Cấp Tài Khoản Mới */}
      <CreateAccountModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchAccounts();
        }}
        existingAccounts={accounts}
      />

      {/* Modal Chỉnh Sửa Tài Khoản & Mật Khẩu Tùy Ý */}
      <EditAccountModal
        account={selectedAccount}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAccount(null);
        }}
        onSuccess={fetchAccounts}
      />
    </div>
  );
};

export default TaiKhoanPage;
