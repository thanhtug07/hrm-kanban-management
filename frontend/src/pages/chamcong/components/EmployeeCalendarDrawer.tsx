import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Drawer,
  Calendar,
  Badge,
  Spin,
  Tag,
  Typography,
  Space,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Empty,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { NhanVienDto } from '@/types/nhanVien';
import { ChamCongDto } from '@/types/chamCong';
import { chamCongApi } from '@/api/chamCongApi';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Title, Text } = Typography;

interface EmployeeCalendarDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: NhanVienDto | null;
  initialMonth?: Dayjs;
}

export const formatCleanTime = (timeStr?: string | null): string => {
  if (!timeStr) return '--:--:--';
  return timeStr.split('.')[0];
};

export const calculateLateMinutes = (gioVaoStr?: string | null): number => {
  if (!gioVaoStr) return 0;
  const clean = gioVaoStr.split('.')[0];
  const parts = clean.split(':').map(Number);
  if (parts.length < 2) return 0;
  const vaoMinutes = parts[0] * 60 + parts[1];
  const standardMinutes = 8 * 60; // Ca làm việc 08:00:00
  const late = vaoMinutes - standardMinutes;
  return late > 0 ? late : 0;
};

export const EmployeeCalendarDrawer: React.FC<EmployeeCalendarDrawerProps> = ({
  open,
  onClose,
  employee,
  initialMonth,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(initialMonth || dayjs());
  const [attendanceRecords, setAttendanceRecords] = useState<ChamCongDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth]);

  const fetchAttendance = useCallback(async () => {
    if (!employee?.maNV) return;
    setLoading(true);
    try {
      const res: any = await chamCongApi.getList({
        maNV: employee.maNV,
        thang: selectedMonth.month() + 1,
        nam: selectedMonth.year(),
      });
      if (res && res.success && res.data) {
        setAttendanceRecords(res.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch {
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [employee?.maNV, selectedMonth]);

  useEffect(() => {
    if (open && employee) {
      fetchAttendance();
    }
  }, [open, employee, fetchAttendance]);

  // Map ngày 'YYYY-MM-DD' -> ChamCongDto
  const attendanceMap = useMemo(() => {
    const map = new Map<string, ChamCongDto>();
    attendanceRecords.forEach((record) => {
      // Ngày trả về có thể là "2026-10-01" hoặc có kèm giờ
      const dateKey = record.ngay.split('T')[0];
      map.set(dateKey, record);
    });
    return map;
  }, [attendanceRecords]);

  // Thống kê tháng
  const summary = useMemo(() => {
    let duCong = 0;
    let tre = 0;
    let vang = 0;
    let nghiPhep = 0;
    let tongPhutTre = 0;

    attendanceRecords.forEach((item) => {
      const status = item.trangThai?.trim().toLowerCase() || '';
      if (status.includes('đủ') || status.includes('đi làm') || status.includes('đúng giờ')) {
        duCong++;
      } else if (status.includes('trễ') || status.includes('muộn')) {
        tre++;
        tongPhutTre += calculateLateMinutes(item.gioVao);
      } else if (status.includes('vắng') || status.includes('không phép')) {
        vang++;
      } else if (status.includes('phép')) {
        nghiPhep++;
      }
    });

    return {
      duCong,
      tre,
      vang,
      nghiPhep,
      tongPhutTre,
      tongNgayGhiNhan: attendanceRecords.length,
    };
  }, [attendanceRecords]);

  // Custom fullCellRender ô lịch (Dương lịch thuần túy, kiểm soát 100% không trùng lặp số ngày)
  const fullCellRender = (current: Dayjs) => {
    const dateStr = current.format('YYYY-MM-DD');
    const dayOfWeek = current.day(); // 0 = CN, 6 = T7
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isCurrentMonth = current.month() === selectedMonth.month();

    if (!isCurrentMonth) {
      return (
        <div style={{ height: '100%', minHeight: 52, opacity: 0.25, padding: '4px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{current.date()}</span>
        </div>
      );
    }

    const record = attendanceMap.get(dateStr);

    // Nếu cuối tuần (T7, CN)
    if (isWeekend) {
      return (
        <div
          style={{
            height: '100%',
            minHeight: 52,
            backgroundColor: '#F8FAFC',
            borderRadius: 6,
            padding: '4px 6px',
            border: '1px dashed #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{current.date()}</span>
            <span style={{ fontSize: 9, color: '#94A3B8' }}>{dayOfWeek === 0 ? 'CN' : 'T7'}</span>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' }}>
            Nghỉ tuần
          </div>
        </div>
      );
    }

    // Nếu không có bản ghi và là ngày trong tuần
    if (!record) {
      return (
        <div
          style={{
            height: '100%',
            minHeight: 52,
            borderRadius: 6,
            padding: '4px 6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>{current.date()}</span>
          <div style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center' }}>--</div>
        </div>
      );
    }

    // Có bản ghi chấm công thật: phân loại trạng thái
    const status = record.trangThai?.trim().toLowerCase() || '';

    // 1. ĐỦ CÔNG
    if (status.includes('đủ') || status.includes('đi làm') || status.includes('đúng giờ')) {
      return (
        <Tooltip
          title={`Đủ công: Vào ${formatCleanTime(record.gioVao)} - Ra ${formatCleanTime(record.gioRa)}`}
        >
          <div
            style={{
              height: '100%',
              minHeight: 52,
              backgroundColor: '#ECFDF5',
              borderRadius: 6,
              padding: '4px 6px',
              border: '1px solid #A7F3D0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#065F46' }}>{current.date()}</span>
              <CheckCircleOutlined style={{ fontSize: 11, color: '#059669' }} />
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#047857',
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: '#D1FAE5',
                borderRadius: 4,
                padding: '1px 2px',
              }}
            >
              {formatCleanTime(record.gioVao).slice(0, 5)}
            </div>
          </div>
        </Tooltip>
      );
    }

    // 2. TRỄ
    if (status.includes('trễ') || status.includes('muộn')) {
      const lateMins = calculateLateMinutes(record.gioVao);
      return (
        <Tooltip
          title={`Đi trễ: Vào ${formatCleanTime(record.gioVao)} (Trễ ${lateMins > 0 ? lateMins + ' phút' : ''})`}
        >
          <div
            style={{
              height: '100%',
              minHeight: 52,
              backgroundColor: '#EFF6FF',
              borderRadius: 6,
              padding: '4px 6px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1E40AF' }}>{current.date()}</span>
              <ClockCircleOutlined style={{ fontSize: 11, color: '#2563EB' }} />
            </div>
            <div
              style={{
                fontSize: 9,
                color: '#1D4ED8',
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: '#DBEAFE',
                borderRadius: 4,
                padding: '1px 2px',
              }}
            >
              {lateMins > 0 ? `Trễ ${lateMins}p` : 'Trễ ca'}
            </div>
          </div>
        </Tooltip>
      );
    }

    // 3. VẮNG
    if (status.includes('vắng') || status.includes('không phép')) {
      return (
        <Tooltip title="Vắng mặt trong ca làm việc">
          <div
            style={{
              height: '100%',
              minHeight: 52,
              backgroundColor: '#FEF2F2',
              borderRadius: 6,
              padding: '4px 6px',
              border: '1px solid #FECACA',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#991B1B' }}>{current.date()}</span>
              <CloseCircleOutlined style={{ fontSize: 11, color: '#DC2626' }} />
            </div>
            <div
              style={{
                fontSize: 9,
                color: '#B91C1C',
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: '#FEE2E2',
                borderRadius: 4,
                padding: '1px 2px',
              }}
            >
              Vắng
            </div>
          </div>
        </Tooltip>
      );
    }

    // 4. NGHỈ PHÉP
    if (status.includes('phép')) {
      return (
        <Tooltip title="Nghỉ phép có duyệt">
          <div
            style={{
              height: '100%',
              minHeight: 52,
              backgroundColor: '#FEFCE8',
              borderRadius: 6,
              padding: '4px 6px',
              border: '1px solid #FEF08A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#854D0E' }}>{current.date()}</span>
              <CalendarOutlined style={{ fontSize: 11, color: '#CA8A04' }} />
            </div>
            <div
              style={{
                fontSize: 9,
                color: '#A16207',
                fontWeight: 700,
                textAlign: 'center',
                backgroundColor: '#FEF9C3',
                borderRadius: 4,
                padding: '1px 2px',
              }}
            >
              Phép
            </div>
          </div>
        </Tooltip>
      );
    }

    // Mặc định
    return (
      <div
        style={{
          height: '100%',
          minHeight: 52,
          backgroundColor: '#F8FAFC',
          borderRadius: 6,
          padding: '4px 6px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{current.date()}</span>
        <span style={{ fontSize: 9, color: '#64748B', textAlign: 'center' }}>{record.trangThai}</span>
      </div>
    );
  };

  const avatarStyle = employee ? getAvatarStyle(employee.hoTen) : {};

  return (
    <Drawer
      title={null}
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{
        body: { padding: '20px 24px', backgroundColor: '#F8FAFC' },
      }}
    >
      {employee ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Card Profile */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar
                  size={58}
                  style={{
                    ...avatarStyle,
                    fontSize: 22,
                    fontWeight: 700,
                    border: '3px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {getInitials(employee.hoTen)}
                </Avatar>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Title level={4} style={{ color: '#FFFFFF', margin: 0, fontWeight: 700 }}>
                      {employee.hoTen}
                    </Title>
                    <Tag
                      color="cyan"
                      style={{
                        borderRadius: 6,
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: 'rgba(6, 182, 212, 0.25)',
                        color: '#E0F2FE',
                      }}
                    >
                      {employee.maNV}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: '#E0E7FF', fontSize: 13 }}>
                      {employee.tenPB || 'Phòng ban'}
                    </Text>
                    <span style={{ color: '#818CF8' }}>•</span>
                    <Text style={{ color: '#C7D2FE', fontSize: 13 }}>
                      {employee.tenCV || 'Nhân viên'}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: '#A5B4FC', fontSize: 12 }}>
                      {employee.email || 'Chưa cập nhật email'}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Month Selector */}
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(val) => val && setSelectedMonth(val)}
                format="MM/YYYY"
                allowClear={false}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  borderRadius: 8,
                }}
              />
            </div>
          </Card>

          {/* Quick Metrics Bar */}
          <Row gutter={[12, 12]}>
            <Col span={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: '12px 8px' }}
              >
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>ĐỦ CÔNG</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#047857', marginTop: 2 }}>
                  {summary.duCong} <span style={{ fontSize: 11, fontWeight: 400 }}>ngày</span>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: '12px 8px' }}
              >
                <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>ĐI TRỄ</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1D4ED8', marginTop: 2 }}>
                  {summary.tre} <span style={{ fontSize: 11, fontWeight: 400 }}>lần</span>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: '12px 8px' }}
              >
                <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>VẮNG MẶT</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#B91C1C', marginTop: 2 }}>
                  {summary.vang} <span style={{ fontSize: 11, fontWeight: 400 }}>ngày</span>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: '12px 8px' }}
              >
                <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>NGHỈ PHÉP</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#B45309', marginTop: 2 }}>
                  {summary.nghiPhep} <span style={{ fontSize: 11, fontWeight: 400 }}>ngày</span>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Lịch Dương Chấm Công (Ant Design Calendar) */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                  Lịch Chấm Công Dương Lịch
                </span>
                <span style={{ marginLeft: 8, fontSize: 13, color: '#64748B' }}>
                  Tháng {selectedMonth.format('MM/YYYY')}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                Tổng {summary.tongNgayGhiNhan} bản ghi
              </span>
            </div>

            <Spin spinning={loading} tip="Đang tải dữ liệu chấm công...">
              <style>{`
                .custom-calendar-container .ant-picker-calendar-date-value {
                  display: none !important;
                }
                .custom-calendar-container .ant-picker-calendar-date-content {
                  height: 100% !important;
                  min-height: 48px !important;
                }
                .custom-calendar-container .ant-picker-cell-inner {
                  padding: 2px !important;
                }
              `}</style>
              <div className="custom-calendar-container" style={{ minHeight: 380 }}>
                <Calendar
                  fullscreen={false}
                  value={selectedMonth}
                  onSelect={(date) => setSelectedMonth(date)}
                  headerRender={() => null} // Ẩn header mặc định vì đã có DatePicker tùy biến
                  cellRender={fullCellRender}
                />
              </div>
            </Spin>

            {/* Chú thích màu sắc (Legend) */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: '#065F46', fontWeight: 500 }}>Đủ công</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: '#1E40AF', fontWeight: 500 }}>Đi trễ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: '#991B1B', fontWeight: 500 }}>Vắng mặt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#FEFCE8',
                    border: '1px solid #FEF08A',
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: '#854D0E', fontWeight: 500 }}>Nghỉ phép</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    borderRadius: 3,
                  }}
                />
                <span style={{ color: '#94A3B8' }}>Nghỉ tuần (T7, CN)</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Empty description="Chưa chọn nhân viên để xem lịch" />
      )}
    </Drawer>
  );
};

export default EmployeeCalendarDrawer;
