import React, { useState } from 'react';
import {
  Drawer,
  Typography,
  Space,
  Tag,
  Button,
  Timeline,
  Avatar,
  Divider,
  Popconfirm,
  Input,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { NghiPhepDto } from '@/types/nghiPhep';
import { nghiPhepApi } from '@/api/nghiPhepApi';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Title, Text, Paragraph } = Typography;

interface LeaveDetailDrawerProps {
  leave: NghiPhepDto | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  isApprover: boolean; // Admin or HR
}

export const LeaveDetailDrawer: React.FC<LeaveDetailDrawerProps> = ({
  leave,
  open,
  onClose,
  onUpdated,
  isApprover,
}) => {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!leave) return null;

  const avatar = getAvatarStyle(leave.hoTen || leave.maNV);

  // Tính tổng số ngày nghỉ
  const dStart = dayjs(leave.tuNgay);
  const dEnd = dayjs(leave.denNgay);
  const totalDays = dEnd.diff(dStart, 'day') + 1;

  const getLeaveTypeTag = (type: string) => {
    switch (type) {
      case 'Phép năm':
        return <Tag style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', fontWeight: 600 }}>Phép năm</Tag>;
      case 'Bệnh':
        return <Tag style={{ backgroundColor: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA', fontWeight: 600 }}>Nghỉ bệnh / Ốm</Tag>;
      case 'Thai sản':
        return <Tag style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', borderColor: '#E9D5FF', fontWeight: 600 }}>Thai sản</Tag>;
      case 'Không lương':
        return <Tag style={{ backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0', fontWeight: 600 }}>Nghỉ không lương</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const getStatusTag = (st: string) => {
    switch (st) {
      case 'Chờ duyệt':
        return (
          <Tag style={{ backgroundColor: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A', fontWeight: 650, borderRadius: 6 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            Chờ duyệt
          </Tag>
        );
      case 'Đã duyệt':
        return (
          <Tag style={{ backgroundColor: '#DCFCE7', color: '#15803D', borderColor: '#BBF7D0', fontWeight: 650, borderRadius: 6 }}>
            <CheckCircleOutlined style={{ marginRight: 4 }} />
            Đã duyệt
          </Tag>
        );
      case 'Từ chối':
        return (
          <Tag style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA', fontWeight: 650, borderRadius: 6 }}>
            <CloseCircleOutlined style={{ marginRight: 4 }} />
            Từ chối
          </Tag>
        );
      default:
        return <Tag>{st}</Tag>;
    }
  };

  const handleApprove = async () => {
    setLoadingApprove(true);
    try {
      const res: any = await nghiPhepApi.duyet(leave.maNP, { trangThai: 'Đã duyệt' });
      if (res && res.success) {
        message.success(`Đã phê duyệt đơn nghỉ phép #${leave.maNP} thành công!`);
        onUpdated();
        onClose();
      } else {
        message.error(res?.message || 'Phê duyệt đơn thất bại.');
      }
    } catch {
      message.error('Lỗi kết nối khi phê duyệt đơn.');
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async () => {
    setLoadingReject(true);
    try {
      const res: any = await nghiPhepApi.duyet(leave.maNP, {
        trangThai: 'Từ chối',
        lyDoTuChoi: rejectReason.trim() || 'Không đáp ứng điều kiện nghỉ phép',
      });
      if (res && res.success) {
        message.success(`Đã từ chối đơn nghỉ phép #${leave.maNP}!`);
        onUpdated();
        onClose();
      } else {
        message.error(res?.message || 'Từ chối đơn thất bại.');
      }
    } catch {
      message.error('Lỗi kết nối khi từ chối đơn.');
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={500}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
            Chi Tiết Đơn Nghỉ Phép #{leave.maNP}
          </span>
          {getStatusTag(leave.trangThai)}
        </div>
      }
      styles={{
        body: { padding: '20px 24px', backgroundColor: '#FFFFFF' },
      }}
      footer={
        isApprover && leave.trangThai === 'Chờ duyệt' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '4px 0' }}>
            <Popconfirm
              title="Từ chối đơn xin nghỉ phép"
              description={
                <div style={{ width: 280, marginTop: 8 }}>
                  <Text style={{ fontSize: 12.5, display: 'block', marginBottom: 6 }}>
                    Nhập lý do từ chối (tùy chọn):
                  </Text>
                  <Input.TextArea
                    rows={2}
                    placeholder="Lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              }
              onConfirm={handleReject}
              okText="Xác nhận Từ chối"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: loadingReject }}
            >
              <Button danger icon={<CloseOutlined />} style={{ borderRadius: 8, height: 36 }}>
                Từ chối
              </Button>
            </Popconfirm>

            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loadingApprove}
              onClick={handleApprove}
              style={{
                backgroundColor: '#10B981',
                borderColor: '#10B981',
                borderRadius: 8,
                height: 36,
                fontWeight: 600,
                padding: '0 18px',
              }}
            >
              Phê Duyệt Đơn
            </Button>
          </div>
        ) : null
      }
    >
      {/* 1. Header Người Làm Đơn */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          background: '#F8FAFC',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          marginBottom: 20,
        }}
      >
        <Avatar
          size={46}
          style={{
            backgroundColor: avatar.bg,
            color: avatar.text,
            border: `1px solid ${avatar.border}`,
            fontSize: 15,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(leave.hoTen || leave.maNV)}
        </Avatar>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            {leave.hoTen || leave.maNV}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            Mã nhân viên: <strong style={{ color: '#334155' }}>{leave.maNV}</strong>
          </div>
        </div>
      </div>

      {/* 2. Khối Thông Tin Chi Tiết */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
          Thông Tin Ngày Nghỉ
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>Loại phép</div>
            <div style={{ marginTop: 4 }}>{getLeaveTypeTag(leave.loaiPhep)}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>Tổng số ngày nghỉ</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#4F46E5', marginTop: 2 }}>
              {totalDays} ngày
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>Từ ngày</div>
            <div style={{ fontSize: 13.5, fontWeight: 650, color: '#0F172A', marginTop: 2 }}>
              {dayjs(leave.tuNgay).format('DD/MM/YYYY')}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>Đến ngày</div>
            <div style={{ fontSize: 13.5, fontWeight: 650, color: '#0F172A', marginTop: 2 }}>
              {dayjs(leave.denNgay).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Khối Lý Do Nghỉ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Lý Do Xin Nghỉ
        </div>
        <div
          style={{
            background: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            fontSize: 13,
            color: '#334155',
            lineHeight: 1.6,
            minHeight: 60,
          }}
        >
          {leave.lyDo || 'Không có ghi chú lý do cụ thể.'}
        </div>
      </div>

      <Divider style={{ margin: '16px 0 20px' }} />

      {/* 4. Khối Lịch Sử Phê Duyệt (Timeline) */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
          Tiến Trình Xét Duyệt
        </div>

        <Timeline
          items={[
            {
              color: '#3B82F6',
              children: (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                    Nhân viên gửi đơn xin nghỉ phép
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    {leave.tuNgay ? dayjs(leave.tuNgay).subtract(1, 'day').format('DD/MM/YYYY') : 'Hệ thống ghi nhận'}
                  </div>
                </div>
              ),
            },
            leave.trangThai === 'Chờ duyệt'
              ? {
                  color: '#F59E0B',
                  dot: <ClockCircleOutlined style={{ fontSize: 15 }} />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#B45309' }}>
                        Đang chờ Quản lý / HR xét duyệt
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Đơn đang nằm trong hàng đợi cần xử lý
                      </div>
                    </div>
                  ),
                }
              : leave.trangThai === 'Đã duyệt'
              ? {
                  color: '#10B981',
                  dot: <CheckCircleOutlined style={{ fontSize: 15 }} />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#15803D' }}>
                        Đã được phê duyệt chấp thuận
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                        Người duyệt: <strong style={{ color: '#0F172A' }}>{leave.tenNV_Duyet || leave.maNV_Duyet || 'Quản lý nhân sự'}</strong>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Thời gian duyệt: {leave.ngayDuyet ? dayjs(leave.ngayDuyet).format('HH:mm:ss - DD/MM/YYYY') : 'Đã ghi nhận'}
                      </div>
                    </div>
                  ),
                }
              : {
                  color: '#EF4444',
                  dot: <CloseCircleOutlined style={{ fontSize: 15 }} />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#DC2626' }}>
                        Đơn đã bị từ chối
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                        Người từ chối: <strong style={{ color: '#0F172A' }}>{leave.tenNV_Duyet || leave.maNV_Duyet || 'Quản lý nhân sự'}</strong>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Thời gian: {leave.ngayDuyet ? dayjs(leave.ngayDuyet).format('HH:mm:ss - DD/MM/YYYY') : 'Đã ghi nhận'}
                      </div>
                    </div>
                  ),
                },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default LeaveDetailDrawer;
