import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Avatar,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { NhanVienDto, NhanVienFilterDto } from '@/types/nhanVien';
import { nhanVienApi } from '@/api/nhanVienApi';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/format';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import { PageHeader } from '@/components/PageHeader';
import NhanVienFormModal, { PHONG_BAN_OPTIONS, TRANG_THAI_OPTIONS } from './NhanVienFormModal';

export const NhanVienListPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.vaiTro === 'Admin';
  const [data, setData] = useState<NhanVienDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter params
  const [filters, setFilters] = useState<NhanVienFilterDto>({
    page: 1,
    pageSize: 10,
    search: '',
    maPB: undefined,
    trangThai: undefined,
  });

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanVienDto | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await nhanVienApi.getList(filters);
      if (res && res.success && res.data) {
        setData(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      } else {
        message.error(res?.message || 'Không thể tải danh sách nhân viên.');
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu nhân viên từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (maNV: string) => {
    try {
      const res: any = await nhanVienApi.delete(maNV);
      if (res && res.success) {
        message.success(`Đã xóa thành công nhân viên ${maNV}`);
        fetchData();
      } else {
        message.error(res?.message || 'Xóa nhân viên thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi xóa nhân viên.');
    }
  };

  const renderTrangThaiTag = (status: string) => {
    switch (status) {
      case 'Đang làm':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '2px 10px', borderRadius: 12, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span>
            Đang làm
          </span>
        );
      case 'Tạm nghỉ':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '2px 10px', borderRadius: 12, background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }}></span>
            Tạm nghỉ
          </span>
        );
      case 'Nghỉ việc':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '2px 10px', borderRadius: 12, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }}></span>
            Nghỉ việc
          </span>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<NhanVienDto> = [
    {
      title: 'Nhân viên',
      key: 'nhanVienInfo',
      width: 250,
      fixed: 'left',
      render: (_, record) => {
        const avatarStyle = getAvatarStyle(record.hoTen);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={36}
              style={{
                backgroundColor: avatarStyle.bg,
                color: avatarStyle.text,
                border: `1.5px solid ${avatarStyle.border}`,
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {getInitials(record.hoTen)}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>{record.hoTen}</div>
              <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', gap: 6 }}>
                <span>{record.maNV}</span>
                {record.email && <span>• {record.email}</span>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Giới tính',
      dataIndex: 'gioiTinh',
      key: 'gioiTinh',
      width: 90,
      render: (val: string) => <span style={{ color: '#475569' }}>{val}</span>,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'tenPB',
      key: 'tenPB',
      width: 190,
      render: (val: string) => <span style={{ fontWeight: 500, color: '#1e293b' }}>{val}</span>,
    },
    {
      title: 'Chức danh',
      dataIndex: 'tenCV',
      key: 'tenCV',
      width: 160,
      render: (val: string) => (
        <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'sdt',
      key: 'sdt',
      width: 130,
      render: (val?: string) => val ? <span style={{ fontFamily: 'monospace', color: '#475569' }}>{val}</span> : '-',
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'ngayVaoLam',
      key: 'ngayVaoLam',
      width: 120,
      render: (val: string) => <span style={{ color: '#64748b', fontSize: 12.5 }}>{formatDate(val)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (val: string) => renderTrangThaiTag(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#0F766E' }} />}
            onClick={() => {
              setEditingItem(record);
              setModalOpen(true);
            }}
          />
          {isAdmin && (
            <Popconfirm
              title={`Bạn có chắc muốn xóa nhân viên ${record.hoTen} (${record.maNV})?`}
              onConfirm={() => handleDelete(record.maNV)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 24 }}>
      <PageHeader
        title="Quản Lý Nhân Viên"
        subtitle="Danh sách, thông tin và trạng thái nhân sự toàn công ty."
        icon={<TeamOutlined />}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            shape="round"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
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
            Thêm Nhân Viên Mới
          </Button>
        }
      />

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
        <Space wrap size="middle">
          <Input
            placeholder="Tìm theo tên, CCCD, SĐT..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 260, borderRadius: 8 }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            allowClear
          />
          <Select
            placeholder="Lọc Phòng ban"
            style={{ width: 240 }}
            allowClear
            value={filters.maPB}
            onChange={(val) => setFilters({ ...filters, maPB: val, page: 1 })}
            options={PHONG_BAN_OPTIONS}
            dropdownStyle={{ borderRadius: 8 }}
          />
          <Select
            placeholder="Lọc Trạng thái"
            style={{ width: 160 }}
            allowClear
            value={filters.trangThai}
            onChange={(val) => setFilters({ ...filters, trangThai: val, page: 1 })}
            options={TRANG_THAI_OPTIONS}
            dropdownStyle={{ borderRadius: 8 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading}>
            Làm mới
          </Button>
        </Space>

        <span style={{ fontSize: 12.5, color: '#64748B' }}>
          Tổng số: <strong style={{ color: '#0F172A' }}>{totalCount}</strong> nhân sự
        </span>
      </div>

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid #F1F5F9',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
        styles={{ body: { padding: '8px 12px' } }}
      >
        <Table
          rowKey="maNV"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1100, y: 'calc(100vh - 390px)' }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có nhân viên nào phù hợp."
                style={{ padding: '36px 0' }}
              />
            ),
          }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng cộng: ${total} nhân sự`,
            onChange: (page, pageSize) => {
              setFilters({ ...filters, page, pageSize });
            },
          }}
        />
      </Card>

      <NhanVienFormModal
        open={modalOpen}
        editingItem={editingItem}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default NhanVienListPage;
