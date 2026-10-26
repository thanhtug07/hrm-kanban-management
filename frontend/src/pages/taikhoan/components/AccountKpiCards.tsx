import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { TaiKhoanDto } from '@/types/taiKhoan';

interface AccountKpiCardsProps {
  accounts: TaiKhoanDto[];
  loading: boolean;
}

export const AccountKpiCards: React.FC<AccountKpiCardsProps> = ({ accounts, loading }) => {
  const total = accounts.length;
  const activeCount = accounts.filter((a) => a.trangThai).length;
  const lockedCount = accounts.filter((a) => !a.trangThai).length;
  const adminHrCount = accounts.filter((a) => a.vaiTro === 'Admin' || a.vaiTro === 'HR').length;
  const adminHrPct = total > 0 ? Math.round((adminHrCount / total) * 100) : 0;

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    background: '#FFFFFF',
    border: '1px solid #F1F5F9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {/* 1. Tổng tài khoản */}
      <Col xs={12} sm={6}>
        <Card loading={loading} style={cardStyle} styles={{ body: { padding: '16px 18px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 650, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TỔNG TÀI KHOẢN
              </div>
              <div style={{ fontSize: 26, fontWeight: 750, color: '#0F172A', marginTop: 4, lineHeight: 1 }}>
                {total}
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <TeamOutlined />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 8 }}>
            Tất cả user được cấp quyền
          </div>
        </Card>
      </Col>

      {/* 2. Đang hoạt động */}
      <Col xs={12} sm={6}>
        <Card loading={loading} style={cardStyle} styles={{ body: { padding: '16px 18px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 650, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ĐANG HOẠT ĐỘNG
              </div>
              <div style={{ fontSize: 26, fontWeight: 750, color: '#10B981', marginTop: 4, lineHeight: 1 }}>
                {activeCount}
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <CheckCircleOutlined />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#059669', marginTop: 8, fontWeight: 500 }}>
            {total > 0 ? Math.round((activeCount / total) * 100) : 0}% tài khoản khả dụng
          </div>
        </Card>
      </Col>

      {/* 3. Đang bị khóa */}
      <Col xs={12} sm={6}>
        <Card loading={loading} style={cardStyle} styles={{ body: { padding: '16px 18px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 650, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ĐANG BỊ KHÓA
              </div>
              <div style={{ fontSize: 26, fontWeight: 750, color: lockedCount > 0 ? '#EF4444' : '#64748B', marginTop: 4, lineHeight: 1 }}>
                {lockedCount}
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <LockOutlined />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: lockedCount > 0 ? '#DC2626' : '#94A3B8', marginTop: 8, fontWeight: 500 }}>
            {lockedCount > 0 ? 'Bị vô hiệu hóa đăng nhập' : 'Không có tài khoản bị khóa'}
          </div>
        </Card>
      </Col>

      {/* 4. Tỷ lệ Admin / HR */}
      <Col xs={12} sm={6}>
        <Card loading={loading} style={cardStyle} styles={{ body: { padding: '16px 18px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 650, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ADMIN & HR
              </div>
              <div style={{ fontSize: 26, fontWeight: 750, color: '#0F766E', marginTop: 4, lineHeight: 1 }}>
                {adminHrCount}
              </div>
            </div>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
                color: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#0F766E', marginTop: 8, fontWeight: 500 }}>
            Chiếm {adminHrPct}% tổng quyền quản trị
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AccountKpiCards;
