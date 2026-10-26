import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Row,
  Col,
  message,
  Avatar,
  Input,
  Tag,
  Tooltip,
  Empty,
} from 'antd';
import {
  CalculatorOutlined,
  ReloadOutlined,
  TeamOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  PlusOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { bangLuongApi } from '@/api/bangLuongApi';
import { BangLuongDto } from '@/types/bangLuong';
import { formatCurrency } from '@/utils/format';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import { PHONG_BAN_OPTIONS } from '../nhanvien/NhanVienFormModal';
import TinhLuongModal from './TinhLuongModal';
import PhatSinhModal from './components/PhatSinhModal';
import PayrollDetailDrawer from './components/PayrollDetailDrawer';

export const BangLuongPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.vaiTro === 'Admin';
  const isHrOrAdmin = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [filterMaPB, setFilterMaPB] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // My payroll history (NhanVien)
  const [myPayrolls, setMyPayrolls] = useState<BangLuongDto[]>([]);
  const [loadingMyPayrolls, setLoadingMyPayrolls] = useState(false);

  // Company payroll (Admin/HR)
  const [companyPayrolls, setCompanyPayrolls] = useState<BangLuongDto[]>([]);
  const [loadingCompanyPayrolls, setLoadingCompanyPayrolls] = useState(false);

  // Modals & Drawer
  const [tinhLuongModalOpen, setTinhLuongModalOpen] = useState(false);
  const [phatSinhModalOpen, setPhatSinhModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BangLuongDto | null>(null);

  // Active Tab
  const [activeTabKey, setActiveTabKey] = useState<string>(isHrOrAdmin ? 'company' : 'my');

  // Fetch My Payrolls
  const fetchMyPayrolls = useCallback(async () => {
    setLoadingMyPayrolls(true);
    try {
      const res: any = await bangLuongApi.getMyPayroll({ nam: selectedMonth.year() });
      if (res && res.success && res.data) {
        setMyPayrolls(res.data || []);
      }
    } catch {
      message.error('Không thể tải phiếu lương cá nhân.');
    } finally {
      setLoadingMyPayrolls(false);
    }
  }, [selectedMonth]);

  // Fetch Company Payrolls
  const fetchCompanyPayrolls = useCallback(async () => {
    if (!isHrOrAdmin) return;
    setLoadingCompanyPayrolls(true);
    try {
      const res: any = await bangLuongApi.getList({
        thang: selectedMonth.month() + 1,
        nam: selectedMonth.year(),
        maPB: filterMaPB,
      });
      if (res && res.success && res.data) {
        setCompanyPayrolls(res.data || []);
      }
    } catch {
      message.error('Không thể tải bảng lương toàn công ty.');
    } finally {
      setLoadingCompanyPayrolls(false);
    }
  }, [isHrOrAdmin, selectedMonth, filterMaPB]);

  useEffect(() => {
    if (isHrOrAdmin) {
      fetchCompanyPayrolls();
    } else {
      fetchMyPayrolls();
    }
  }, [fetchMyPayrolls, fetchCompanyPayrolls, isHrOrAdmin]);

  // Bộ lọc tìm kiếm theo họ tên hoặc mã NV
  const filteredCompanyPayrolls = useMemo(() => {
    return companyPayrolls.filter((item) => {
      if (!searchKeyword.trim()) return true;
      const kw = searchKeyword.trim().toLowerCase();
      const matchName = item.hoTen?.toLowerCase().includes(kw);
      const matchMa = item.maNV?.toLowerCase().includes(kw);
      return matchName || matchMa;
    });
  }, [companyPayrolls, searchKeyword]);

  // Tính 4 chỉ số KPI tổng quan
  const metrics = useMemo(() => {
    const totalThucLinh = companyPayrolls.reduce((sum, item) => sum + (Number(item.thucLinh) || 0), 0);
    const totalPhuCapThuong = companyPayrolls.reduce(
      (sum, item) => sum + (Number(item.phuCap) || 0),
      0
    );
    const totalKhauTru = companyPayrolls.reduce((sum, item) => sum + (Number(item.khauTru) || 0), 0);
    const countPersonnel = companyPayrolls.length;

    return {
      totalThucLinh,
      totalPhuCapThuong,
      totalKhauTru,
      countPersonnel,
    };
  }, [companyPayrolls]);

  // Hàm Xuất Excel / CSV (Hỗ trợ UTF-8 BOM hiển thị chuẩn tiếng Việt)
  const handleExportExcel = () => {
    if (filteredCompanyPayrolls.length === 0) {
      message.warning('Không có dữ liệu bảng lương để xuất.');
      return;
    }

    const headers = [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Phòng ban',
      'Chức vụ',
      'Kỳ lương',
      'Số ngày công',
      'Lương cơ bản',
      'Phụ cấp',
      'Thưởng phát sinh',
      'Khấu trừ',
      'Thực lĩnh',
    ];

    const rows = filteredCompanyPayrolls.map((item, idx) => [
      idx + 1,
      item.maNV,
      `"${item.hoTen}"`,
      `"${item.tenPB}"`,
      `"${item.tenCV}"`,
      `"Tháng ${item.thang}/${item.nam}"`,
      item.soNgayCong,
      item.luongCoBan,
      item.phuCap,
      item.thuongPhatSinh || 0,
      item.khauTru,
      item.thucLinh,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `BangLuong_Thang_${selectedMonth.format('MM_YYYY')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất file bảng lương Excel/CSV thành công!');
  };

  // Cột bảng cá nhân (NhanVien)
  const columnsMy: ColumnsType<BangLuongDto> = [
    {
      title: 'Kỳ lương',
      key: 'kyLuong',
      width: 130,
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: '#0F172A' }}>
          Tháng {record.thang}/{record.nam}
        </span>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'tenPB',
      key: 'tenPB',
      width: 180,
      render: (val: string) => (
        <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: 'tenCV',
      key: 'tenCV',
      width: 150,
    },
    {
      title: 'Ngày công',
      dataIndex: 'soNgayCong',
      key: 'soNgayCong',
      width: 110,
      align: 'right',
      render: (val: number) => <strong style={{ color: '#0F172A' }}>{val} công</strong>,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'luongCoBan',
      key: 'luongCoBan',
      width: 140,
      align: 'right',
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Phụ cấp & Thưởng',
      dataIndex: 'phuCap',
      key: 'phuCap',
      width: 150,
      align: 'right',
      render: (val: number) => (
        <span style={{ color: '#059669', fontWeight: 600 }}>+{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Khấu trừ',
      dataIndex: 'khauTru',
      key: 'khauTru',
      width: 130,
      align: 'right',
      render: (val: number) => (
        <span style={{ color: val > 0 ? '#DC2626' : '#64748B', fontWeight: val > 0 ? 600 : 400 }}>
          {val > 0 ? `-${formatCurrency(val)}` : '0 ₫'}
        </span>
      ),
    },
    {
      title: 'Thực lĩnh',
      dataIndex: 'thucLinh',
      key: 'thucLinh',
      width: 160,
      align: 'right',
      fixed: 'right',
      render: (val: number) => (
        <span style={{ color: '#047857', fontWeight: 800, fontSize: 15 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          shape="circle"
          icon={<EyeOutlined style={{ color: '#0F766E', fontSize: 16 }} />}
          onClick={() => {
            setSelectedRecord(record);
            setDetailDrawerOpen(true);
          }}
        />
      ),
    },
  ];

  // Cột bảng công ty (Admin/HR)
  const columnsCompany: ColumnsType<BangLuongDto> = [
    {
      title: 'Nhân viên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      width: 200,
      fixed: 'left',
      render: (_, record) => {
        const avatarStyle = getAvatarStyle(record.hoTen);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={36} style={{ ...avatarStyle, fontWeight: 700, fontSize: 13 }}>
              {getInitials(record.hoTen)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
                {record.hoTen}
              </div>
              <div style={{ color: '#64748B', fontSize: 11, fontFamily: 'monospace' }}>
                {record.maNV}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phòng ban',
      dataIndex: 'tenPB',
      key: 'tenPB',
      width: 170,
      render: (val: string) => (
        <Tag
          color="blue"
          style={{
            borderRadius: 6,
            fontWeight: 500,
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            color: '#1D4ED8',
          }}
        >
          {val || 'Chưa phân bổ'}
        </Tag>
      ),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'tenCV',
      key: 'tenCV',
      width: 120,
      render: (val: string) => (
        <span style={{ fontSize: 12.5, color: '#475569' }}>{val || '--'}</span>
      ),
    },
    {
      title: 'Ngày công',
      dataIndex: 'soNgayCong',
      key: 'soNgayCong',
      width: 95,
      align: 'right',
      render: (val: number) => <strong style={{ color: '#0F172A' }}>{val} công</strong>,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'luongCoBan',
      key: 'luongCoBan',
      width: 125,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#334155' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Phụ cấp',
      dataIndex: 'phuCap',
      key: 'phuCap',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#0F172A' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Thưởng / Phát sinh',
      dataIndex: 'thuongPhatSinh',
      key: 'thuongPhatSinh',
      width: 135,
      align: 'right',
      render: (val?: number) => {
        const amt = val || 0;
        return (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: amt > 0 ? 600 : 400,
              color: amt > 0 ? '#059669' : '#64748B',
            }}
          >
            {amt > 0 ? `+${formatCurrency(amt)}` : '0 ₫'}
          </span>
        );
      },
    },
    {
      title: 'Khấu trừ',
      dataIndex: 'khauTru',
      key: 'khauTru',
      width: 115,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: val > 0 ? 600 : 400,
            color: val > 0 ? '#DC2626' : '#64748B',
          }}
        >
          {val > 0 ? `-${formatCurrency(val)}` : '0 ₫'}
        </span>
      ),
    },
    {
      title: 'Thực lĩnh',
      dataIndex: 'thucLinh',
      key: 'thucLinh',
      width: 145,
      align: 'right',
      fixed: 'right',
      render: (val: number) => (
        <strong
          style={{
            fontFamily: 'monospace',
            color: '#047857',
            fontSize: 14.5,
            fontWeight: 800,
          }}
        >
          {formatCurrency(val)}
        </strong>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 75,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết phiếu lương">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined style={{ fontSize: 17, color: '#0F766E' }} />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRecord(record);
              setDetailDrawerOpen(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100%', paddingBottom: 32 }}>
      {/* ===================== KHU VỰC HEADER TRANG ===================== */}
      <PageHeader
        title={isHrOrAdmin ? 'Bảng Lương & Chi Trả Doanh Nghiệp' : 'Phiếu Lương Cá Nhân'}
        subtitle={
          isHrOrAdmin
            ? 'Quản lý tính lương tự động, phụ cấp, chi phí phát sinh và kiểm soát quỹ lương toàn công ty.'
            : 'Theo dõi chi tiết thu nhập, tiền công theo ngày và các khoản khấu trừ từng kỳ.'
        }
        icon={<DollarOutlined />}
        extra={
          <>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(val) => val && setSelectedMonth(val)}
              format="MM/YYYY"
              allowClear={false}
              style={{ borderRadius: 8, height: 38 }}
            />

            <Button
              icon={<ReloadOutlined />}
              style={{ borderRadius: 8, height: 38 }}
              onClick={() => {
                if (isHrOrAdmin) fetchCompanyPayrolls();
                else fetchMyPayrolls();
              }}
            >
              Làm mới
            </Button>

            {isHrOrAdmin && (
              <>
                {/* Nút Xuất Excel */}
                <Button
                  icon={<DownloadOutlined />}
                  style={{ borderRadius: 8, height: 38 }}
                  onClick={handleExportExcel}
                >
                  Xuất Excel
                </Button>

                {/* Nút Thêm chi phí phát sinh */}
                <Button
                  icon={<DollarOutlined />}
                  style={{
                    borderRadius: 8,
                    height: 38,
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    fontWeight: 500,
                  }}
                  onClick={() => setPhatSinhModalOpen(true)}
                >
                  Thêm chi phí phát sinh
                </Button>

                {/* Nút Tính Lương (SP) — chỉ Admin */}
                {isAdmin && (
                  <Button
                    type="primary"
                    icon={<CalculatorOutlined />}
                    style={{
                      borderRadius: 8,
                      height: 38,
                      backgroundColor: '#0F766E',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                    }}
                    onClick={() => setTinhLuongModalOpen(true)}
                  >
                    Tính Lương (SP)
                  </Button>
                )}
              </>
            )}
          </>
        }
      />

      {/* ===================== PHẦN 1: 4 THẺ KPI TỔNG QUAN (ADMIN / HR) ===================== */}
      {isHrOrAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {/* 1. Tổng quỹ lương */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                border: '1px solid #F1F5F9',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px' }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                }}
              >
                <DollarOutlined style={{ fontSize: 22 }} />
              </div>
              <div style={{ color: '#059669', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                TỔNG QUỸ LƯƠNG THỰC LĨNH
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#047857',
                  margin: '6px 0 4px',
                  fontFamily: 'monospace',
                }}
              >
                {formatCurrency(metrics.totalThucLinh)}
              </div>
              <div style={{ fontSize: 12, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RiseOutlined />
                <span>Chi trả cho toàn bộ nhân sự kỳ này</span>
              </div>
            </Card>
          </Col>

          {/* 2. Tổng phụ cấp & Thưởng */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                border: '1px solid #F1F5F9',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px' }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <SafetyOutlined style={{ fontSize: 22 }} />
              </div>
              <div style={{ color: '#2563EB', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                TỔNG PHỤ CẤP & THƯỞNG
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#1D4ED8',
                  margin: '6px 0 4px',
                  fontFamily: 'monospace',
                }}
              >
                {formatCurrency(metrics.totalPhuCapThuong)}
              </div>
              <div style={{ fontSize: 12, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircleOutlined />
                <span>Gồm trợ cấp ăn trưa, xăng & thưởng dự án</span>
              </div>
            </Card>
          </Col>

          {/* 3. Tổng khấu trừ */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                border: '1px solid #F1F5F9',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px' }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                }}
              >
                <FallOutlined style={{ fontSize: 22 }} />
              </div>
              <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                TỔNG CÁC KHOẢN KHẤU TRỪ
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#B91C1C',
                  margin: '6px 0 4px',
                  fontFamily: 'monospace',
                }}
              >
                {metrics.totalKhauTru > 0 ? `-${formatCurrency(metrics.totalKhauTru)}` : '0 ₫'}
              </div>
              <div style={{ fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Phạt kỷ luật, đi trễ, tạm ứng lương</span>
              </div>
            </Card>
          </Col>

          {/* 4. Số nhân sự */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                border: '1px solid #F1F5F9',
                position: 'relative',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '18px 20px' }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#F0FDFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F766E',
                }}
              >
                <TeamOutlined style={{ fontSize: 22 }} />
              </div>
              <div style={{ color: '#0F766E', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                NHÂN SỰ TRONG BẢNG LƯƠNG
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#0D5C55',
                  margin: '6px 0 4px',
                }}
              >
                {metrics.countPersonnel}{' '}
                <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>nhân sự</span>
              </div>
              <div style={{ fontSize: 12, color: '#14B8A6' }}>
                <span>100% nhân viên đã tính công & lương</span>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* ===================== PHẦN 2 & 3: BẢNG DỮ LIỆU & TOOLBAR ===================== */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #F1F5F9',
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          type="card"
          items={[
            ...(isHrOrAdmin
              ? [
                  {
                    key: 'company',
                    label: (
                      <span style={{ fontWeight: 600, padding: '0 8px' }}>
                        <DollarOutlined style={{ marginRight: 6 }} />
                        Bảng lương toàn công ty ({companyPayrolls.length})
                      </span>
                    ),
                    children: (
                      <div style={{ marginTop: 8 }}>
                        {/* Toolbar */}
                        <div
                          style={{
                            marginBottom: 16,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 12,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Space wrap size={12}>
                            <Input
                              placeholder="Tìm nhân viên hoặc mã NV..."
                              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                              value={searchKeyword}
                              onChange={(e) => setSearchKeyword(e.target.value)}
                              allowClear
                              style={{ width: 250, borderRadius: 8 }}
                            />
                            <Select
                              placeholder="Tất cả Phòng ban"
                              style={{ width: 220 }}
                              allowClear
                              value={filterMaPB}
                              onChange={setFilterMaPB}
                              options={PHONG_BAN_OPTIONS}
                            />
                          </Space>

                          <div style={{ color: '#64748B', fontSize: 13 }}>
                            Hiển thị <strong>{filteredCompanyPayrolls.length}</strong> bảng lương kỳ{' '}
                            <strong>{selectedMonth.format('MM/YYYY')}</strong>
                          </div>
                        </div>

                        {/* Table */}
                        <Table
                          rowKey="maBL"
                          columns={columnsCompany}
                          dataSource={filteredCompanyPayrolls}
                          loading={loadingCompanyPayrolls}
                          scroll={{ x: 'max-content' }}
                          locale={{
                            emptyText: (
                              <Empty description="Chưa có dữ liệu bảng lương cho tháng này." />
                            ),
                          }}
                          pagination={{
                            pageSize: 15,
                            showTotal: (total, range) =>
                              `${range[0]}-${range[1]} của ${total} nhân viên`,
                          }}
                          onRow={(record) => ({
                            onClick: () => {
                              setSelectedRecord(record);
                              setDetailDrawerOpen(true);
                            },
                            style: { cursor: 'pointer' },
                          })}
                        />
                      </div>
                    ),
                  },
                ]
              : []),
            {
              key: 'my',
              label: (
                <span style={{ fontWeight: 600, padding: '0 8px' }}>
                  <SafetyOutlined style={{ marginRight: 6 }} />
                  Phiếu lương của tôi (12 tháng gần nhất)
                </span>
              ),
              children: (
                <div style={{ marginTop: 8 }}>
                  <Table
                    rowKey="maBL"
                    columns={columnsMy}
                    dataSource={myPayrolls}
                    loading={loadingMyPayrolls}
                    scroll={{ x: 'max-content' }}
                    locale={{
                      emptyText: (
                        <Empty description="Chưa có dữ liệu bảng lương cho bạn." />
                      ),
                    }}
                    pagination={{ pageSize: 12 }}
                    onRow={(record) => ({
                      onClick: () => {
                        setSelectedRecord(record);
                        setDetailDrawerOpen(true);
                      },
                      style: { cursor: 'pointer' },
                    })}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ===================== MODAL TÍNH LƯƠNG TỰ ĐỘNG (SP) ===================== */}
      <TinhLuongModal
        open={tinhLuongModalOpen}
        onCancel={() => setTinhLuongModalOpen(false)}
        onSuccess={() => {
          setTinhLuongModalOpen(false);
          fetchCompanyPayrolls();
        }}
      />

      {/* ===================== MODAL THÊM CHI PHÍ PHÁT SINH ===================== */}
      <PhatSinhModal
        open={phatSinhModalOpen}
        onCancel={() => setPhatSinhModalOpen(false)}
        onSuccess={() => {
          fetchCompanyPayrolls();
        }}
        selectedMonth={selectedMonth}
      />

      {/* ===================== DRAWER CHI TIẾT PHIẾU LƯƠNG ===================== */}
      <PayrollDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default BangLuongPage;
