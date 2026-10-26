import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Tabs,
  Typography,
  Avatar,
  Tooltip,
  Popconfirm,
  message,
  Empty,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/components/PageHeader';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAuthStore } from '@/stores/authStore';
import { nghiPhepApi } from '@/api/nghiPhepApi';
import { NghiPhepDto } from '@/types/nghiPhep';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

import LeaveDetailDrawer from './components/LeaveDetailDrawer';
import NghiPhepFormModal from './NghiPhepFormModal';

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const NghiPhepPage: React.FC = () => {
  const { user } = useAuthStore();
  const isApprover = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  const [leaves, setLeaves] = useState<NghiPhepDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>(isApprover ? 'pending' : 'my-leaves');

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Drawer & Modal
  const [selectedLeave, setSelectedLeave] = useState<NghiPhepDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Quick Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Fetch Leaves
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      let res: any;
      if (isApprover) {
        // Admin & HR lấy toàn bộ đơn
        res = await nghiPhepApi.getAllLeaves();
      } else {
        // Nhân viên chỉ lấy đơn cá nhân
        res = await nghiPhepApi.getMyLeaves();
      }

      if (res && res.success && res.data) {
        setLeaves(res.data);
      } else {
        message.error(res?.message || 'Không thể tải danh sách đơn nghỉ phép.');
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [isApprover]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Quick Approve inline
  const handleQuickApprove = async (record: NghiPhepDto) => {
    setActionLoadingId(record.maNP);
    try {
      const res: any = await nghiPhepApi.duyet(record.maNP, { trangThai: 'Đã duyệt' });
      if (res && res.success) {
        message.success(`Đã phê duyệt đơn nghỉ của ${record.hoTen || record.maNV}!`);
        fetchLeaves();
      } else {
        message.error(res?.message || 'Phê duyệt thất bại.');
      }
    } catch {
      message.error('Lỗi khi duyệt đơn.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Reject inline
  const handleQuickReject = async (record: NghiPhepDto) => {
    setActionLoadingId(record.maNP);
    try {
      const res: any = await nghiPhepApi.duyet(record.maNP, {
        trangThai: 'Từ chối',
        lyDoTuChoi: 'Không đáp ứng điều kiện nghỉ phép',
      });
      if (res && res.success) {
        message.success(`Đã từ chối đơn nghỉ của ${record.hoTen || record.maNV}.`);
        fetchLeaves();
      } else {
        message.error(res?.message || 'Từ chối đơn thất bại.');
      }
    } catch {
      message.error('Lỗi khi từ chối đơn.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper render Tag loại phép
  const renderLeaveTypeTag = (type: string) => {
    switch (type) {
      case 'Phép năm':
        return (
          <Tag style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', fontWeight: 600, borderRadius: 6 }}>
            Phép năm
          </Tag>
        );
      case 'Bệnh':
        return (
          <Tag style={{ backgroundColor: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA', fontWeight: 600, borderRadius: 6 }}>
            Nghỉ bệnh / Ốm
          </Tag>
        );
      case 'Thai sản':
        return (
          <Tag style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', borderColor: '#E9D5FF', fontWeight: 600, borderRadius: 6 }}>
            Thai sản
          </Tag>
        );
      case 'Không lương':
        return (
          <Tag style={{ backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0', fontWeight: 600, borderRadius: 6 }}>
            Không lương
          </Tag>
        );
      default:
        return <Tag style={{ borderRadius: 6 }}>{type}</Tag>;
    }
  };

  // Helper render Tag trạng thái
  const renderStatusTag = (st: string) => {
    switch (st) {
      case 'Chờ duyệt':
        return (
          <Tag style={{ backgroundColor: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A', fontWeight: 650, borderRadius: 6 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} /> Chờ duyệt
          </Tag>
        );
      case 'Đã duyệt':
        return (
          <Tag style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderColor: '#BBF7D0', fontWeight: 650, borderRadius: 6 }}>
            <CheckCircleOutlined style={{ marginRight: 4 }} /> Đã duyệt
          </Tag>
        );
      case 'Từ chối':
        return (
          <Tag style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA', fontWeight: 650, borderRadius: 6 }}>
            <CloseCircleOutlined style={{ marginRight: 4 }} /> Từ chối
          </Tag>
        );
      default:
        return <Tag style={{ borderRadius: 6 }}>{st}</Tag>;
    }
  };

  // Filtered List theo Tab và Toolbar
  const getFilteredData = (targetTab: string) => {
    return leaves.filter((item) => {
      // 1. Phân chia theo Tab logic
      if (isApprover) {
        if (targetTab === 'pending' && item.trangThai !== 'Chờ duyệt') return false;
        if (targetTab === 'history' && item.trangThai === 'Chờ duyệt') return false;
      }

      // 2. Toolbar: Search
      if (searchText.trim()) {
        const s = searchText.toLowerCase();
        const matchName = item.hoTen?.toLowerCase().includes(s);
        const matchMaNV = item.maNV?.toLowerCase().includes(s);
        const matchId = String(item.maNP).includes(s);
        const matchLyDo = item.lyDo?.toLowerCase().includes(s);
        if (!matchName && !matchMaNV && !matchId && !matchLyDo) return false;
      }

      // 3. Toolbar: Loại phép
      if (filterType && item.loaiPhep !== filterType) return false;

      // 4. Toolbar: Trạng thái (khi ở Tab Lịch sử)
      if (targetTab === 'history' && filterStatus && item.trangThai !== filterStatus) return false;

      // 5. Toolbar: RangePicker
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        const itemStart = dayjs(item.tuNgay);
        const itemEnd = dayjs(item.denNgay);
        // Kiểm tra xem khoảng nghỉ có giao thoa với dateRange không
        if (itemEnd.isBefore(start) || itemStart.isAfter(end)) return false;
      }

      return true;
    });
  };

  // Danh sách đơn chờ duyệt để tính badge
  const pendingCount = leaves.filter((l) => l.trangThai === 'Chờ duyệt').length;

  // Columns Configuration
  const buildColumns = (currentTab: string) => [
    {
      title: 'Mã',
      dataIndex: 'maNP',
      key: 'maNP',
      width: 75,
      render: (val: number) => <span style={{ fontWeight: 700, color: '#64748B', fontSize: 12 }}>#{val}</span>,
    },
    {
      title: 'Nhân viên',
      key: 'nhanVien',
      width: 220,
      render: (_: any, record: NghiPhepDto) => {
        const displayName = record.hoTen || record.maNV;
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
              <div style={{ fontWeight: 650, fontSize: 13, color: '#0F172A' }}>{displayName}</div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Mã NV: {record.maNV}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Loại phép',
      dataIndex: 'loaiPhep',
      key: 'loaiPhep',
      width: 150,
      render: (val: string) => renderLeaveTypeTag(val),
    },
    {
      title: 'Thời gian nghỉ',
      key: 'thoiGian',
      width: 220,
      render: (_: any, record: NghiPhepDto) => {
        const dStart = dayjs(record.tuNgay);
        const dEnd = dayjs(record.denNgay);
        const totalDays = dEnd.diff(dStart, 'day') + 1;
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
              {dStart.format('DD/MM/YYYY')} → {dEnd.format('DD/MM/YYYY')}
            </div>
            <div style={{ fontSize: 11.5, color: '#0F766E', fontWeight: 600, marginTop: 2 }}>
              Tổng cộng {totalDays} ngày nghỉ
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (val: string) => renderStatusTag(val),
    },
    ...(currentTab === 'history'
      ? [
          {
            title: 'Ngày duyệt / Người duyệt',
            key: 'ngayDuyet',
            width: 230,
            render: (_: any, record: NghiPhepDto) => {
              if (!record.ngayDuyet) return <span style={{ color: '#94A3B8' }}>—</span>;
              return (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1E293B' }}>
                    {dayjs(record.ngayDuyet).format('HH:mm:ss - DD/MM/YYYY')}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Bởi: {record.tenNV_Duyet || record.maNV_Duyet || 'Quản lý'}
                  </div>
                </div>
              );
            },
          },
        ]
      : []),
    {
      title: 'Thao tác',
      key: 'actions',
      width: currentTab === 'pending' ? 160 : 100,
      fixed: 'right' as const,
      render: (_: any, record: NghiPhepDto) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết đơn nghỉ phép">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#0F766E', fontSize: 14 }} />}
              onClick={() => {
                setSelectedLeave(record);
                setDrawerOpen(true);
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>

          {/* Nếu ở Tab Chờ duyệt và là Admin/HR: Hiện 2 nút Duyệt & Từ chối nhanh */}
          {isApprover && record.trangThai === 'Chờ duyệt' && (
            <>
              <Tooltip title="Phê duyệt nhanh">
                <Button
                  type="text"
                  size="small"
                  loading={actionLoadingId === record.maNP}
                  icon={<CheckOutlined style={{ color: '#10B981', fontSize: 14 }} />}
                  onClick={() => handleQuickApprove(record)}
                />
              </Tooltip>

              <Popconfirm
                title="Từ chối đơn xin nghỉ"
                description={`Bạn có chắc muốn từ chối đơn #${record.maNP}?`}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true, size: 'small' }}
                cancelButtonProps={{ size: 'small' }}
                onConfirm={() => handleQuickReject(record)}
              >
                <Tooltip title="Từ chối nhanh">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined style={{ color: '#EF4444', fontSize: 14 }} />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 24 }}>
      {/* 1. Header Trang Chuẩn SaaS */}
      <PageHeader
        title="Trung Tâm Phê Duyệt Nghỉ Phép"
        subtitle="Quản lý và theo dõi lịch sử nghỉ phép của nhân sự."
        icon={<CalendarOutlined />}
        extra={
          <>
            <Button
              icon={<ReloadOutlined />}
              shape="round"
              onClick={fetchLeaves}
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
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)',
              }}
            >
              Tạo đơn nghỉ phép
            </Button>
          </>
        }
      />

      {/* 2. Tabs Logic Theo Role */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={
          isApprover
            ? [
                {
                  key: 'pending',
                  label: (
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      <ClockCircleOutlined style={{ marginRight: 6, color: '#F59E0B' }} />
                      Chờ duyệt
                      {pendingCount > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            padding: '1px 8px',
                            borderRadius: 10,
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </span>
                  ),
                  children: renderTabContent('pending'),
                },
                {
                  key: 'history',
                  label: (
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      <CalendarOutlined style={{ marginRight: 6, color: '#10B981' }} />
                      Lịch sử xét duyệt
                    </span>
                  ),
                  children: renderTabContent('history'),
                },
              ]
            : [
                {
                  key: 'my-leaves',
                  label: (
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      <CalendarOutlined style={{ marginRight: 6 }} />
                      Đơn của tôi ({leaves.length})
                    </span>
                  ),
                  children: renderTabContent('my-leaves'),
                },
              ]
        }
      />

      {/* 3. Drawer Chi Tiết */}
      <LeaveDetailDrawer
        leave={selectedLeave}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLeave(null);
        }}
        onUpdated={fetchLeaves}
        isApprover={isApprover}
      />

      {/* 4. Modal Tạo Đơn Mới */}
      <NghiPhepFormModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchLeaves();
        }}
      />
    </div>
  );

  // Helper render Toolbar và Table cho từng Tab
  function renderTabContent(tabKey: string) {
    const data = getFilteredData(tabKey);
    const columns = buildColumns(tabKey);

    return (
      <div>
        {/* Toolbar */}
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
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, flex: 1 }}>
            {/* Search */}
            <Input
              placeholder="Tìm theo tên NV, mã đơn, lý do..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 260, borderRadius: 8 }}
            />

            {/* RangePicker */}
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
              format="DD/MM/YYYY"
              style={{ width: 250, borderRadius: 8 }}
            />

            {/* Loại phép */}
            <Select
              placeholder="Tất cả Loại phép"
              allowClear
              value={filterType}
              onChange={setFilterType}
              style={{ width: 160 }}
              dropdownStyle={{ borderRadius: 8 }}
              options={[
                { value: 'Phép năm', label: 'Phép năm' },
                { value: 'Bệnh', label: 'Nghỉ bệnh / Ốm' },
                { value: 'Thai sản', label: 'Thai sản' },
                { value: 'Không lương', label: 'Không lương' },
              ]}
            />

            {/* Trạng thái (chỉ hiện ở Tab Lịch sử xét duyệt) */}
            {tabKey === 'history' && (
              <Select
                placeholder="Trạng thái duyệt"
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                dropdownStyle={{ borderRadius: 8 }}
                options={[
                  { value: 'Đã duyệt', label: 'Đã duyệt' },
                  { value: 'Từ chối', label: 'Từ chối' },
                ]}
              />
            )}
          </div>

          <span style={{ fontSize: 12.5, color: '#64748B' }}>
            Tổng số: <strong style={{ color: '#0F172A' }}>{data.length}</strong> đơn
          </span>
        </div>

        {/* Table Area */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)',
          }}
        >
          {loading ? (
            <div style={{ padding: 24 }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              rowKey="maNP"
              scroll={{ x: 'max-content' }}
              sticky
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có đơn nghỉ phép nào trong mục này."
                    style={{ padding: '36px 0' }}
                  />
                ),
              }}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                pageSizeOptions: ['8', '15', '30'],
                showTotal: (total) => `Tổng cộng ${total} đơn`,
              }}
            />
          )}
        </div>
      </div>
    );
  }
};

export default NghiPhepPage;
