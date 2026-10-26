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
  Typography,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { NhanVienDto, NhanVienFilterDto } from '@/types/nhanVien';
import { nhanVienApi } from '@/api/nhanVienApi';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/format';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import NhanVienFormModal, { PHONG_BAN_OPTIONS, TRANG_THAI_OPTIONS } from './NhanVienFormModal';

const { Title, Text } = Typography;

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
            icon={<EditOutlined style={{ color: '#2563eb' }} />}
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
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Quản Lý Nhân Viên
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          Thêm Nhân Viên Mới
        </Button>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <Space wrap size="middle">
          <Input
            placeholder="Tìm theo tên, CCCD, SĐT..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 260 }}
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
          />
          <Select
            placeholder="Lọc Trạng thái"
            style={{ width: 160 }}
            allowClear
            value={filters.trangThai}
            onChange={(val) => setFilters({ ...filters, trangThai: val, page: 1 })}
            options={TRANG_THAI_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '8px 12px' } }}>
        <Table
          rowKey="maNV"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1100, y: 'calc(100vh - 390px)' }}
          locale={{ emptyText: 'Không có dữ liệu nhân viên nào phù hợp.' }}
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
