import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tabs,
  Tag,
  DatePicker,
  Select,
  Space,
  Modal,
  Form,
  TimePicker,
  message,
  Typography,
  Avatar,
  Input,
  Tooltip,
  Popover,
} from 'antd';
import {
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined,
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { chamCongApi } from '@/api/chamCongApi';
import { nhanVienApi } from '@/api/nhanVienApi';
import { ChamCongDto, UpdateChamCongDto } from '@/types/chamCong';
import { NhanVienDto } from '@/types/nhanVien';
import { formatDate } from '@/utils/format';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import { PHONG_BAN_OPTIONS } from '../nhanvien/NhanVienFormModal';
import EmployeeCalendarDrawer, {
  formatCleanTime,
  calculateLateMinutes,
} from './components/EmployeeCalendarDrawer';

const { Title, Text } = Typography;

export const ChamCongPage: React.FC = () => {
  const { user } = useAuthStore();
  const isHrOrAdmin = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  // Personal history (For Employee)
  const [myHistory, setMyHistory] = useState<ChamCongDto[]>([]);
  const [loadingMyHistory, setLoadingMyHistory] = useState(false);

  // Company list (For HR/Admin)
  const [companyList, setCompanyList] = useState<ChamCongDto[]>([]);
  const [loadingCompanyList, setLoadingCompanyList] = useState(false);
  const [filterTrangThai, setFilterTrangThai] = useState<string | undefined>(undefined);
  const [filterPhongBan, setFilterPhongBan] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Employee list (For Tab 2: Danh sách nhân sự & Lịch chấm công)
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [empSearchKeyword, setEmpSearchKeyword] = useState<string>('');
  const [empFilterPB, setEmpFilterPB] = useState<string | undefined>(undefined);

  // Drawer state (Lịch chấm công cá nhân)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<NhanVienDto | null>(null);

  // Edit modal (HR/Admin)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChamCongDto | null>(null);
  const [form] = Form.useForm();

  // Active Tab
  const [activeTabKey, setActiveTabKey] = useState<string>('company_history');

  // Clock interval for employee check-in view
  useEffect(() => {
    if (!isHrOrAdmin) {
      const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
      return () => clearInterval(timer);
    }
  }, [isHrOrAdmin]);

  // Today attendance state (for Employee view)
  const todayRecord = myHistory.find(
    (item) => item.ngay.split('T')[0] === currentTime.format('YYYY-MM-DD')
  );

  // Fetch Personal History
  const fetchMyHistory = useCallback(async () => {
    setLoadingMyHistory(true);
    try {
      const res: any = await chamCongApi.getMe(selectedMonth.month() + 1, selectedMonth.year());
      if (res && res.success && res.data) {
        setMyHistory(res.data || []);
      }
    } catch {
      message.error('Không thể tải lịch sử chấm công cá nhân.');
    } finally {
      setLoadingMyHistory(false);
    }
  }, [selectedMonth]);

  // Fetch Company Attendance List
  const fetchCompanyList = useCallback(async () => {
    if (!isHrOrAdmin) return;
    setLoadingCompanyList(true);
    try {
      const res: any = await chamCongApi.getList({
        thang: selectedMonth.month() + 1,
        nam: selectedMonth.year(),
        trangThai: filterTrangThai,
        maPB: filterPhongBan,
      });
      if (res && res.success && res.data) {
        setCompanyList(res.data || []);
      }
    } catch {
      message.error('Không thể tải bảng chấm công toàn công ty.');
    } finally {
      setLoadingCompanyList(false);
    }
  }, [selectedMonth, filterTrangThai, filterPhongBan, isHrOrAdmin]);

  // Fetch Employees List for Tab 2
  const fetchEmployees = useCallback(async () => {
    if (!isHrOrAdmin) return;
    setLoadingEmployees(true);
    try {
      const res: any = await nhanVienApi.getList({ pageSize: 100 });
      if (res && res.success && res.data) {
        setEmployees(res.data.items || []);
      }
    } catch {
      message.error('Không thể tải danh sách nhân sự.');
    } finally {
      setLoadingEmployees(false);
    }
  }, [isHrOrAdmin]);

  useEffect(() => {
    if (isHrOrAdmin) {
      fetchCompanyList();
      fetchEmployees();
    } else {
      fetchMyHistory();
    }
  }, [fetchMyHistory, fetchCompanyList, fetchEmployees, isHrOrAdmin]);

  // Hook for testing & automation
  useEffect(() => {
    (window as any).__openDrawer = (emp?: NhanVienDto) => {
      setSelectedEmployee(emp || employees[0]);
      setDrawerOpen(true);
    };
  }, [employees]);

  // Handle Employee Check-in
  const handleCheckIn = async () => {
    try {
      const res: any = await chamCongApi.checkIn();
      if (res && res.success) {
        message.success('Điểm danh vào ca thành công!');
        fetchMyHistory();
      } else {
        message.warning(res?.message || 'Không thể check-in.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi check-in.');
    }
  };

  // Handle Employee Check-out
  const handleCheckOut = async () => {
    try {
      const res: any = await chamCongApi.checkOut();
      if (res && res.success) {
        message.success('Điểm danh ra về thành công!');
        fetchMyHistory();
      } else {
        message.warning(res?.message || 'Không thể check-out.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi check-out.');
    }
  };

  // Edit attendance record (Admin/HR)
  const handleOpenEdit = (record: ChamCongDto) => {
    setEditingRecord(record);
    const vaoStr = formatCleanTime(record.gioVao);
    const raStr = formatCleanTime(record.gioRa);
    form.setFieldsValue({
      gioVao: record.gioVao ? dayjs(vaoStr, 'HH:mm:ss') : null,
      gioRa: record.gioRa ? dayjs(raStr, 'HH:mm:ss') : null,
      trangThai: record.trangThai,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      const values = await form.validateFields();
      const payload: UpdateChamCongDto = {
        gioVao: values.gioVao ? values.gioVao.format('HH:mm:ss') : undefined,
        gioRa: values.gioRa ? values.gioRa.format('HH:mm:ss') : undefined,
        trangThai: values.trangThai,
      };

      const res: any = await chamCongApi.update(editingRecord.maCC, payload);
      if (res && res.success) {
        message.success('Cập nhật bản ghi chấm công thành công!');
        setEditModalOpen(false);
        fetchCompanyList();
      } else {
        message.error(res?.message || 'Cập nhật thất bại.');
      }
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin nhập.');
    }
  };

  // Render Status Tag
  const renderStatusTag = (status: string, gioVao?: string) => {
    const s = status?.trim().toLowerCase() || '';
    if (s.includes('đủ') || s.includes('đi làm') || s.includes('đúng giờ')) {
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          style={{
            backgroundColor: '#ECFDF5',
            borderColor: '#A7F3D0',
            color: '#065F46',
            borderRadius: 6,
            fontWeight: 600,
            padding: '2px 8px',
          }}
        >
          Đủ công
        </Tag>
      );
    }
    if (s.includes('trễ') || s.includes('muộn')) {
      const lateMins = calculateLateMinutes(gioVao);
      return (
        <Tag
          icon={<ClockCircleOutlined />}
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            color: '#1E40AF',
            borderRadius: 6,
            fontWeight: 600,
            padding: '2px 8px',
          }}
        >
          {lateMins > 0 ? `Trễ ${lateMins}p` : 'Đi trễ'}
        </Tag>
      );
    }
    if (s.includes('vắng') || s.includes('không phép')) {
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#991B1B',
            borderRadius: 6,
            fontWeight: 600,
            padding: '2px 8px',
          }}
        >
          Vắng mặt
        </Tag>
      );
    }
    if (s.includes('phép')) {
      return (
        <Tag
          icon={<CalendarOutlined />}
          style={{
            backgroundColor: '#FEFCE8',
            borderColor: '#FEF08A',
            color: '#854D0E',
            borderRadius: 6,
            fontWeight: 600,
            padding: '2px 8px',
          }}
        >
          Nghỉ phép
        </Tag>
      );
    }
    return <Tag style={{ borderRadius: 6 }}>{status}</Tag>;
  };

  // Thống kê nhanh toàn công ty trong tháng
  const companyMetrics = useMemo(() => {
    let duCong = 0;
    let tre = 0;
    let vang = 0;
    let nghiPhep = 0;

    companyList.forEach((c) => {
      const s = c.trangThai?.trim().toLowerCase() || '';
      if (s.includes('đủ') || s.includes('đi làm') || s.includes('đúng giờ')) duCong++;
      else if (s.includes('trễ') || s.includes('muộn')) tre++;
      else if (s.includes('vắng') || s.includes('không phép')) vang++;
      else if (s.includes('phép')) nghiPhep++;
    });

    return {
      total: companyList.length,
      duCong,
      tre,
      vang,
      nghiPhep,
      tyLeDuCong: companyList.length > 0 ? Math.round((duCong / companyList.length) * 100) : 0,
    };
  }, [companyList]);

  // Bộ lọc dữ liệu bảng công công ty
  const filteredCompanyList = useMemo(() => {
    return companyList.filter((item) => {
      if (!searchKeyword.trim()) return true;
      const kw = searchKeyword.trim().toLowerCase();
      const matchName = item.hoTen?.toLowerCase().includes(kw);
      const matchMa = item.maNV?.toLowerCase().includes(kw);
      return matchName || matchMa;
    });
  }, [companyList, searchKeyword]);

  // Bộ lọc dữ liệu danh sách nhân sự (Tab 2)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (empFilterPB && emp.maPB !== empFilterPB) return false;
      if (!empSearchKeyword.trim()) return true;
      const kw = empSearchKeyword.trim().toLowerCase();
      const matchName = emp.hoTen?.toLowerCase().includes(kw);
      const matchMa = emp.maNV?.toLowerCase().includes(kw);
      const matchEmail = emp.email?.toLowerCase().includes(kw);
      return matchName || matchMa || matchEmail;
    });
  }, [employees, empFilterPB, empSearchKeyword]);

  // Bản đồ thống kê từng nhân viên trong tháng hiện tại
  const employeeAttendanceStatsMap = useMemo(() => {
    const map = new Map<
      string,
      { duCong: number; tre: number; vang: number; nghiPhep: number; tong: number }
    >();

    companyList.forEach((record) => {
      if (!map.has(record.maNV)) {
        map.set(record.maNV, { duCong: 0, tre: 0, vang: 0, nghiPhep: 0, tong: 0 });
      }
      const stat = map.get(record.maNV)!;
      stat.tong++;
      const s = record.trangThai?.trim().toLowerCase() || '';
      if (s.includes('đủ') || s.includes('đi làm') || s.includes('đúng giờ')) stat.duCong++;
      else if (s.includes('trễ') || s.includes('muộn')) stat.tre++;
      else if (s.includes('vắng') || s.includes('không phép')) stat.vang++;
      else if (s.includes('phép')) stat.nghiPhep++;
    });

    return map;
  }, [companyList]);

  // Columns: Bảng cá nhân (NhanVien)
  const columnsMy: ColumnsType<ChamCongDto> = [
    {
      title: 'Ngày làm việc',
      dataIndex: 'ngay',
      key: 'ngay',
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: '#1E293B' }}>{formatDate(val)}</span>
      ),
    },
    {
      title: 'Giờ vào ca',
      dataIndex: 'gioVao',
      key: 'gioVao',
      render: (val?: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#0F172A' }}>
          {formatCleanTime(val)}
        </span>
      ),
    },
    {
      title: 'Giờ ra về',
      dataIndex: 'gioRa',
      key: 'gioRa',
      render: (val?: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#0F172A' }}>
          {formatCleanTime(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (val: string, record) => renderStatusTag(val, record.gioVao),
    },
  ];

  // Columns: Bảng Lịch sử chấm công toàn công ty (Tab 1 - Admin/HR)
  const columnsCompany: ColumnsType<ChamCongDto> = [
    {
      title: 'Nhân viên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      width: 220,
      render: (_, record) => {
        const avatarStyle = getAvatarStyle(record.hoTen);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={36} style={{ ...avatarStyle, fontWeight: 700, fontSize: 13 }}>
              {getInitials(record.hoTen)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{record.hoTen}</div>
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
      dataIndex: 'tenPhongBan',
      key: 'tenPhongBan',
      width: 170,
      render: (val?: string) => (
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
      title: 'Ngày chấm công',
      dataIndex: 'ngay',
      key: 'ngay',
      width: 130,
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>{formatDate(val)}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (val: string, record) => renderStatusTag(val, record.gioVao),
    },
    {
      title: 'Giờ vào',
      dataIndex: 'gioVao',
      key: 'gioVao',
      width: 110,
      render: (val?: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: val ? '#059669' : '#94A3B8',
          }}
        >
          {formatCleanTime(val)}
        </span>
      ),
    },
    {
      title: 'Giờ ra',
      dataIndex: 'gioRa',
      key: 'gioRa',
      width: 110,
      render: (val?: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: val ? '#2563EB' : '#94A3B8',
          }}
        >
          {formatCleanTime(val)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa bản ghi chấm công">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined style={{ color: '#0F766E', fontSize: 15 }} />}
            onClick={() => handleOpenEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Columns: Danh sách nhân sự & Lịch chấm công (Tab 2 - Admin/HR)
  const columnsEmployees: ColumnsType<NhanVienDto> = [
    {
      title: 'Nhân viên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      width: 220,
      render: (_, emp) => {
        const avatarStyle = getAvatarStyle(emp.hoTen);
        const stats = employeeAttendanceStatsMap.get(emp.maNV) || {
          duCong: 0,
          tre: 0,
          vang: 0,
          nghiPhep: 0,
          tong: 0,
        };

        const popoverContent = (
          <div style={{ width: 220, padding: '4px 2px' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: '#0F172A',
                marginBottom: 8,
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: 6,
              }}
            >
              Tháng {selectedMonth.format('MM/YYYY')} - {emp.hoTen}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#065F46' }}>
                <span>✅ Đủ công:</span>
                <span style={{ fontWeight: 700 }}>{stats.duCong} ngày</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E40AF' }}>
                <span>⏰ Đi trễ:</span>
                <span style={{ fontWeight: 700 }}>{stats.tre} lần</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991B1B' }}>
                <span>❌ Vắng mặt:</span>
                <span style={{ fontWeight: 700 }}>{stats.vang} ngày</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#854D0E' }}>
                <span>📅 Nghỉ phép:</span>
                <span style={{ fontWeight: 700 }}>{stats.nghiPhep} ngày</span>
              </div>
              <div
                style={{
                  marginTop: 4,
                  paddingTop: 6,
                  borderTop: '1px dashed #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                <span>Chuyên cần:</span>
                <span style={{ color: '#0F766E' }}>
                  {stats.tong > 0 ? Math.round((stats.duCong / stats.tong) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        );

        return (
          <Popover content={popoverContent} title={null} trigger="hover" placement="right">
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => {
                setSelectedEmployee(emp);
                setDrawerOpen(true);
              }}
            >
              <Avatar size={38} style={{ ...avatarStyle, fontWeight: 700 }}>
                {getInitials(emp.hoTen)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
                  {emp.hoTen}
                </div>
                <div style={{ color: '#64748B', fontSize: 11, fontFamily: 'monospace' }}>
                  {emp.maNV}
                </div>
              </div>
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Email & Liên hệ',
      dataIndex: 'email',
      key: 'email',
      width: 190,
      render: (val?: string, record?: NhanVienDto) => (
        <div>
          <div style={{ fontSize: 12, color: '#334155' }}>{val || '--'}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{record?.sdt || '--'}</div>
        </div>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'tenPB',
      key: 'tenPB',
      width: 160,
      render: (val: string) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 500,
            backgroundColor: '#F0FDFA',
            borderColor: '#99F6E4',
            color: '#0F766E',
          }}
        >
          {val || 'Chưa xếp phòng'}
        </Tag>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: 'tenCV',
      key: 'tenCV',
      width: 130,
      render: (val: string) => (
        <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{val || '--'}</span>
      ),
    },
    {
      title: `Chấm công Tháng ${selectedMonth.format('MM/YYYY')}`,
      key: 'monthly_stat',
      width: 180,
      render: (_, emp) => {
        const stats = employeeAttendanceStatsMap.get(emp.maNV) || {
          duCong: 0,
          tre: 0,
          vang: 0,
          nghiPhep: 0,
          tong: 0,
        };

        const popoverContent = (
          <div style={{ width: 220, padding: '4px 2px' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: '#0F172A',
                marginBottom: 8,
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: 6,
              }}
            >
              Tháng {selectedMonth.format('MM/YYYY')} - {emp.hoTen}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#065F46' }}>
                <span>✅ Đủ công:</span>
                <span style={{ fontWeight: 700 }}>{stats.duCong} ngày</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E40AF' }}>
                <span>⏰ Đi trễ:</span>
                <span style={{ fontWeight: 700 }}>{stats.tre} lần</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991B1B' }}>
                <span>❌ Vắng mặt:</span>
                <span style={{ fontWeight: 700 }}>{stats.vang} ngày</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#854D0E' }}>
                <span>📅 Nghỉ phép:</span>
                <span style={{ fontWeight: 700 }}>{stats.nghiPhep} ngày</span>
              </div>
            </div>
          </div>
        );

        return (
          <Popover content={popoverContent} title={null} trigger="hover">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F8FAFC',
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
            >
              <Tooltip title="Số ngày đủ công">
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                  ✅ {stats.duCong}
                </span>
              </Tooltip>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <Tooltip title="Số lần đi trễ">
                <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 700 }}>
                  ⏰ {stats.tre}
                </span>
              </Tooltip>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <Tooltip title="Số ngày vắng mặt">
                <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700 }}>
                  ❌ {stats.vang}
                </span>
              </Tooltip>
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 110,
      fixed: 'right',
      align: 'center',
      render: (_, emp) => (
        <Button
          type="primary"
          size="small"
          className="btn-view-calendar"
          icon={<CalendarOutlined />}
          style={{
            backgroundColor: '#0F766E',
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 12,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEmployee(emp);
            setDrawerOpen(true);
          }}
        >
          Xem lịch
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100%', paddingBottom: 32 }}>
      {/* ===================== KHU VỰC HEADER ===================== */}
      <PageHeader
        title={isHrOrAdmin ? 'Quản Lý Điểm Danh & Chấm Công' : 'Điểm Danh & Chấm Công Cá Nhân'}
        subtitle={
          isHrOrAdmin
            ? 'Hệ thống tự động đồng bộ từ thiết bị chấm công thông minh, quản lý bảng công và kiểm soát kỷ luật lao động.'
            : 'Theo dõi thời gian làm việc hàng ngày, thực hiện check-in / check-out trực tiếp trên hệ thống.'
        }
        icon={<ClockCircleOutlined />}
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
                if (isHrOrAdmin) {
                  fetchCompanyList();
                  fetchEmployees();
                } else {
                  fetchMyHistory();
                }
              }}
            >
              Làm mới
            </Button>
          </>
        }
      />

      {/* ===================== PHÂN BIỆT THEO ROLE ===================== */}

      {/* 1. ĐỐI VỚI ROLE NHÂN VIÊN: GIỮ NGUYÊN ĐỒNG HỒ & CHECK-IN */}
      {!isHrOrAdmin && (
        <>
          <Card
            bordered={false}
            style={{
              marginBottom: 20,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #0F766E 0%, #115E59 55%, #0B4F4A 100%)',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.28)',
            }}
            bodyStyle={{ padding: '24px 28px' }}
          >
            <Row gutter={24} align="middle">
              <Col xs={24} md={12}>
                <div>
                  <Text style={{ color: '#99F6E4', fontSize: 14 }}>
                    Hôm nay là: {currentTime.format('dddd, DD/MM/YYYY')}
                  </Text>
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '1px',
                      margin: '6px 0 16px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {currentTime.format('HH:mm:ss')}
                  </div>
                  <Space size={14}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<LoginOutlined />}
                      onClick={handleCheckIn}
                      disabled={!!todayRecord?.gioVao}
                      style={{
                        height: 44,
                        padding: '0 24px',
                        borderRadius: 8,
                        backgroundColor: '#10B981',
                        borderColor: '#10B981',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {todayRecord?.gioVao ? 'Đã Vào Ca' : 'Check-in Vào Ca'}
                    </Button>
                    <Button
                      size="large"
                      icon={<LogoutOutlined />}
                      onClick={handleCheckOut}
                      disabled={!todayRecord?.gioVao || !!todayRecord?.gioRa}
                      style={{
                        height: 44,
                        padding: '0 24px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    >
                      {todayRecord?.gioRa ? 'Đã Tan Ca' : 'Check-out Tan Ca'}
                    </Button>
                  </Space>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  bodyStyle={{ padding: '16px 20px' }}
                >
                  <div style={{ color: '#CCFBF1', fontWeight: 600, marginBottom: 10 }}>
                    Trạng thái chấm công hôm nay
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }} size={6}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#99F6E4' }}>Giờ vào ca:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontFamily: 'monospace' }}>
                        {formatCleanTime(todayRecord?.gioVao)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#99F6E4' }}>Giờ ra về:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontFamily: 'monospace' }}>
                        {formatCleanTime(todayRecord?.gioRa)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 4,
                      }}
                    >
                      <span style={{ color: '#99F6E4' }}>Trạng thái:</span>
                      {todayRecord ? (
                        renderStatusTag(todayRecord.trangThai, todayRecord.gioVao)
                      ) : (
                        <Tag color="default">Chưa điểm danh</Tag>
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Bảng chấm công cá nhân */}
          <Card
            bordered={false}
            style={{ borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, color: '#1E293B' }}>
                Lịch Sử Chấm Công Của Tôi - Tháng {selectedMonth.format('MM/YYYY')}
              </Title>
            </div>
            <Table
              rowKey="maCC"
              columns={columnsMy}
              dataSource={myHistory}
              loading={loadingMyHistory}
              locale={{ emptyText: 'Chưa có bản ghi chấm công nào trong tháng này.' }}
              pagination={{ pageSize: 15 }}
            />
          </Card>
        </>
      )}

      {/* 2. ĐỐI VỚI ROLE ADMIN/HR: ẨN ĐỒNG HỒ, HIỂN THỊ KPI & 2 TABS CHÍNH */}
      {isHrOrAdmin && (
        <>
          {/* TOP METRIC KPI CARDS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={12} sm={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #F1F5F9',
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                  TỔNG LƯỢT CHẤM CÔNG
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginTop: 4,
                  }}
                >
                  {companyMetrics.total}{' '}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>lượt</span>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #F1F5F9',
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ color: '#059669', fontSize: 12, fontWeight: 600 }}>
                  ĐỦ CÔNG (ĐÚNG GIỜ)
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#047857',
                    marginTop: 4,
                  }}
                >
                  {companyMetrics.duCong}{' '}
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#10B981' }}>
                    ({companyMetrics.tyLeDuCong}%)
                  </span>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #F1F5F9',
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ color: '#2563EB', fontSize: 12, fontWeight: 600 }}>
                  LƯỢT ĐI TRỄ
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#1D4ED8',
                    marginTop: 4,
                  }}
                >
                  {companyMetrics.tre}{' '}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>lần</span>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 14,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #F1F5F9',
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600 }}>
                  VẮNG MẶT
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#B91C1C',
                    marginTop: 4,
                  }}
                >
                  {companyMetrics.vang}{' '}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>ngày</span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 2 TABS CHÍNH DÀNH CHO ADMIN / HR */}
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
                // TAB 1: Lịch sử chấm công toàn công ty
                {
                  key: 'company_history',
                  label: (
                    <span style={{ fontWeight: 600, padding: '0 8px' }}>
                      <ClockCircleOutlined style={{ marginRight: 6 }} />
                      Lịch sử chấm công toàn công ty ({companyList.length})
                    </span>
                  ),
                  children: (
                    <div style={{ marginTop: 8 }}>
                      {/* Toolbar Tab 1 */}
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
                            style={{ width: 240, borderRadius: 8 }}
                          />
                          <Select
                            placeholder="Tất cả Phòng ban"
                            style={{ width: 210 }}
                            allowClear
                            value={filterPhongBan}
                            onChange={setFilterPhongBan}
                            options={PHONG_BAN_OPTIONS}
                          />
                          <Select
                            placeholder="Tất cả Trạng thái"
                            style={{ width: 170 }}
                            allowClear
                            value={filterTrangThai}
                            onChange={setFilterTrangThai}
                            options={[
                              { value: 'Đủ công', label: 'Đủ công' },
                              { value: 'Trễ', label: 'Đi trễ' },
                              { value: 'Vắng', label: 'Vắng mặt' },
                              { value: 'Nghỉ phép', label: 'Nghỉ phép' },
                            ]}
                          />
                        </Space>

                        <div style={{ color: '#64748B', fontSize: 13 }}>
                          Hiển thị <strong>{filteredCompanyList.length}</strong> bản ghi
                        </div>
                      </div>

                      {/* Bảng dữ liệu Tab 1 */}
                      <Table
                        rowKey="maCC"
                        columns={columnsCompany}
                        dataSource={filteredCompanyList}
                        loading={loadingCompanyList}
                        scroll={{ x: 'max-content' }}
                        locale={{
                          emptyText: 'Không tìm thấy dữ liệu chấm công phù hợp với bộ lọc.',
                        }}
                        pagination={{
                          pageSize: 15,
                          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dòng`,
                        }}
                      />
                    </div>
                  ),
                },

                // TAB 2: Danh sách nhân sự & Lịch chấm công
                {
                  key: 'employee_calendar',
                  label: (
                    <span style={{ fontWeight: 600, padding: '0 8px' }}>
                      <TeamOutlined style={{ marginRight: 6 }} />
                      Danh sách nhân sự & Lịch chấm công ({employees.length})
                    </span>
                  ),
                  children: (
                    <div style={{ marginTop: 8 }}>
                      {/* Toolbar Tab 2 */}
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
                            placeholder="Tìm theo tên, mã NV hoặc email..."
                            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                            value={empSearchKeyword}
                            onChange={(e) => setEmpSearchKeyword(e.target.value)}
                            allowClear
                            style={{ width: 260, borderRadius: 8 }}
                          />
                          <Select
                            placeholder="Tất cả Phòng ban"
                            style={{ width: 210 }}
                            allowClear
                            value={empFilterPB}
                            onChange={setEmpFilterPB}
                            options={PHONG_BAN_OPTIONS}
                          />
                        </Space>

                        <div style={{ color: '#64748B', fontSize: 13 }}>
                          💡 <em>Rê chuột vào nhân viên để xem tóm tắt, nhấn "Xem lịch" để mở lịch dương.</em>
                        </div>
                      </div>

                      {/* Bảng dữ liệu Tab 2 */}
                      <Table
                        rowKey="maNV"
                        columns={columnsEmployees}
                        dataSource={filteredEmployees}
                        loading={loadingEmployees}
                        scroll={{ x: 'max-content' }}
                        locale={{
                          emptyText: 'Không tìm thấy nhân viên nào phù hợp.',
                        }}
                        pagination={{
                          pageSize: 15,
                          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân sự`,
                        }}
                        onRow={(record) => ({
                          onClick: (event) => {
                            const target = event.target as HTMLElement;
                            if (target.closest('button')) return;
                            setSelectedEmployee(record);
                            setDrawerOpen(true);
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
        </>
      )}

      {/* ===================== DRAWER LỊCH DƯƠNG CHẤM CÔNG ===================== */}
      <EmployeeCalendarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedEmployee}
        initialMonth={selectedMonth}
      />

      {/* ===================== MODAL SỬA BẢN GHI CHẤM CÔNG ===================== */}
      <Modal
        open={editModalOpen}
        title={
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
            Chỉnh sửa chấm công: {editingRecord?.hoTen} ({formatDate(editingRecord?.ngay || '')})
          </div>
        }
        okText="Lưu thay đổi"
        cancelText="Hủy"
        onOk={handleSaveEdit}
        onCancel={() => setEditModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="gioVao" label="Giờ vào ca">
            <TimePicker format="HH:mm:ss" style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="gioRa" label="Giờ ra về">
            <TimePicker format="HH:mm:ss" style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng thái chấm công"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select
              style={{ borderRadius: 6 }}
              options={[
                { value: 'Đủ công', label: 'Đủ công' },
                { value: 'Trễ', label: 'Đi trễ' },
                { value: 'Vắng', label: 'Vắng mặt' },
                { value: 'Nghỉ phép', label: 'Nghỉ phép' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChamCongPage;
