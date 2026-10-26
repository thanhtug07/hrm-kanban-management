import React from 'react';
import { Drawer, Typography, Tag, Divider, Space, Card, Row, Col, Empty } from 'antd';
import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BangLuongDto } from '@/types/bangLuong';
import { formatCurrency } from '@/utils/format';

const { Title, Text } = Typography;

interface PayrollDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  record: BangLuongDto | null;
}

export const PayrollDetailDrawer: React.FC<PayrollDetailDrawerProps> = ({
  open,
  onClose,
  record,
}) => {
  if (!record) return null;

  // Lọc danh sách phát sinh theo Thưởng vs Khấu trừ
  const thuongItems = (record.chiPhiPhatSinhs || []).filter(
    (item) => item.loai === 'Thưởng' || item.loai === 'Công tác phí'
  );

  const phatItems = (record.chiPhiPhatSinhs || []).filter(
    (item) => item.loai === 'Phạt' || item.loai === 'Ứng lương'
  );

  // Phụ cấp gốc
  const phuCapGoc = Math.max(0, record.phuCap - (record.thuongPhatSinh || 0));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={500}
      title={null}
      destroyOnClose
      styles={{
        body: { padding: '24px', backgroundColor: '#F8FAFC' },
      }}
    >
      {/* Vỏ ngoài Phiếu Lương Giấy Payslip */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        {/* Header Phiếu Lương */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
            padding: '24px 20px',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BankOutlined style={{ fontSize: 20, color: '#FFFFFF' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>
                  HRM ENTERPRISE
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.5px' }}>
                  PHIẾU LƯƠNG NHÂN VIÊN
                </div>
              </div>
            </div>

            <Tag
              color="cyan"
              style={{
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                backgroundColor: 'rgba(6, 182, 212, 0.25)',
                color: '#E0F2FE',
              }}
            >
              Tháng {record.thang}/{record.nam}
            </Tag>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: 12.5,
            }}
          >
            <div>
              <span style={{ color: '#C7D2FE' }}>Họ và tên:</span>{' '}
              <strong style={{ color: '#FFFFFF' }}>{record.hoTen}</strong>
            </div>
            <div>
              <span style={{ color: '#C7D2FE' }}>Mã NV:</span>{' '}
              <strong style={{ color: '#FFFFFF' }}>{record.maNV}</strong>
            </div>
            <div>
              <span style={{ color: '#C7D2FE' }}>Phòng ban:</span>{' '}
              <span style={{ color: '#E0E7FF' }}>{record.tenPB}</span>
            </div>
            <div>
              <span style={{ color: '#C7D2FE' }}>Chức vụ:</span>{' '}
              <span style={{ color: '#E0E7FF' }}>{record.tenCV}</span>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết các khoản */}
        <div style={{ padding: '20px' }}>
          {/* KHỐI 1: THU NHẬP CHÍNH */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', textTransform: 'uppercase' }}>
                1. Thu Nhập Chính
              </span>
              <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
                {record.soNgayCong} ngày công thực tế
              </Tag>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>Lương theo ngày công:</span>
                <strong style={{ color: '#0F172A' }}>{formatCurrency(record.luongCoBan)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>Phụ cấp cố định (Ăn trưa, xăng xe):</span>
                <strong style={{ color: '#0F172A' }}>{formatCurrency(phuCapGoc)}</strong>
              </div>
            </div>
          </div>

          {/* KHỐI 2: CHI PHÍ PHÁT SINH & THƯỞNG */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: '#047857', textTransform: 'uppercase' }}>
                2. Chi Phí Phát Sinh & Thưởng
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                +{formatCurrency(record.thuongPhatSinh || 0)}
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#ECFDF5',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid #A7F3D0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {thuongItems.length > 0 ? (
                thuongItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ color: '#065F46', fontWeight: 600 }}>
                        <PlusCircleOutlined style={{ marginRight: 6, color: '#059669' }} />
                        {item.loai}: {item.lyDo || 'Khen thưởng'}
                      </div>
                    </div>
                    <strong style={{ color: '#047857' }}>+{formatCurrency(item.soTien)}</strong>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: '#065F46', fontStyle: 'italic', textAlign: 'center' }}>
                  Không có khoản thưởng phát sinh trong kỳ này.
                </div>
              )}
            </div>
          </div>

          {/* KHỐI 3: KHẤU TRỪ */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: '#B91C1C', textTransform: 'uppercase' }}>
                3. Các Khoản Khấu Trừ
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>
                {record.khauTru > 0 ? `-${formatCurrency(record.khauTru)}` : '0 ₫'}
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 10,
                padding: '12px 14px',
                border: '1px solid #FECACA',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {phatItems.length > 0 ? (
                phatItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ color: '#991B1B', fontWeight: 600 }}>
                        <MinusCircleOutlined style={{ marginRight: 6, color: '#DC2626' }} />
                        {item.loai}: {item.lyDo || 'Khấu trừ vi phạm'}
                      </div>
                    </div>
                    <strong style={{ color: '#DC2626' }}>-{formatCurrency(item.soTien)}</strong>
                  </div>
                ))
              ) : record.khauTru > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ color: '#991B1B' }}>Khấu trừ kỷ luật & đi trễ/vắng:</span>
                  <strong style={{ color: '#DC2626' }}>-{formatCurrency(record.khauTru)}</strong>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#991B1B', fontStyle: 'italic', textAlign: 'center' }}>
                  Không có khoản khấu trừ nào trong kỳ này (0 ₫).
                </div>
              )}
            </div>
          </div>

          {/* KHỐI TỔNG THỰC LĨNH */}
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '2px solid #10B981',
              borderRadius: 12,
              padding: '16px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#065F46',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              TỔNG THỰC LĨNH (NET INCOME)
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#047857',
                margin: '6px 0 4px',
                letterSpacing: '-0.5px',
              }}
            >
              {formatCurrency(record.thucLinh)}
            </div>
            <div style={{ fontSize: 11, color: '#059669' }}>
              = (Lương cơ bản + Phụ cấp + Thưởng) - Khấu trừ
            </div>
          </div>
        </div>

        {/* Footer Xác thực */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SafetyCertificateOutlined style={{ color: '#10B981', fontSize: 14 }} />
            <span>Xác thực bởi Bộ phận Kế toán - Nhân sự</span>
          </div>
          <span>Kỳ lương: {record.thang}/{record.nam}</span>
        </div>
      </div>
    </Drawer>
  );
};

export default PayrollDetailDrawer;
