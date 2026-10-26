import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  FireOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { DashboardDto } from '@/types/dashboard';

interface KpiCardsProps {
  data: DashboardDto | null;
  loading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, loading }) => {
  const navigate = useNavigate();
  const totalEmployees = data?.tongNhanVien || 0;
  const activeEmployees = data?.nhanVienDangLam || 0;
  const activeRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    background: '#FFFFFF',
    border: '1px solid #F1F5F9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* KPI 1: Tổng Nhân Sự */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          loading={loading}
          style={cardStyle}
          styles={{ body: { padding: '20px 22px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 6,
                }}
              >
                Tổng Nhân Sự
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 750,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {totalEmployees}
              </div>
            </div>
            {/* Soft Gradient Icon Box */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <TeamOutlined />
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: '#16A34A',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                backgroundColor: '#DCFCE7',
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              <ArrowUpOutlined style={{ marginRight: 3 }} /> +12%
            </span>
            <span style={{ color: '#64748B' }}>so với tháng trước</span>
          </div>
        </Card>
      </Col>

      {/* KPI 2: Tỷ Lệ Hoạt Động */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          loading={loading}
          style={cardStyle}
          styles={{ body: { padding: '20px 22px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 6,
                }}
              >
                Tỷ Lệ Hoạt Động
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 750,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {activeRate}%
              </div>
            </div>
            {/* Soft Gradient Icon Box */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <CheckCircleOutlined />
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: '#059669',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                backgroundColor: '#D1FAE5',
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {activeEmployees} đang làm
            </span>
            <span style={{ color: '#64748B' }}>/ {data?.nhanVienNghiViec || 0} đã nghỉ</span>
          </div>
        </Card>
      </Col>

      {/* KPI 3: Task Quá Hạn */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          loading={loading}
          style={{ ...cardStyle, cursor: 'pointer' }}
          styles={{ body: { padding: '20px 22px' } }}
          onClick={() => navigate('/kanban')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 6,
                }}
              >
                Task Quá Hạn
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 750,
                  color: (data?.taskQuaHan || 0) > 0 ? '#DC2626' : '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {data?.taskQuaHan || 0}
              </div>
            </div>
            {/* Soft Gradient Icon Box */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <FireOutlined />
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                backgroundColor: (data?.taskQuaHan || 0) > 0 ? '#FEE2E2' : '#F1F5F9',
                color: (data?.taskQuaHan || 0) > 0 ? '#DC2626' : '#64748B',
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {(data?.taskQuaHan || 0) > 0 ? 'Cần xử lý ngay' : 'Đúng tiến độ'}
            </span>
            <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
              Xem Kanban <ArrowRightOutlined style={{ fontSize: 10 }} />
            </span>
          </div>
        </Card>
      </Col>

      {/* KPI 4: Đơn Nghỉ Chờ Duyệt */}
      <Col xs={24} sm={12} lg={6}>
        <Card
          loading={loading}
          style={{ ...cardStyle, cursor: 'pointer' }}
          styles={{ body: { padding: '20px 22px' } }}
          onClick={() => navigate('/nghiphep')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: 6,
                }}
              >
                Đơn Nghỉ Chờ Duyệt
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 750,
                  color: (data?.donNghiPhepChoDuyet || 0) > 0 ? '#EA580C' : '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {data?.donNghiPhepChoDuyet || 0}
              </div>
            </div>
            {/* Soft Gradient Icon Box */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <CalendarOutlined />
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 6,
                backgroundColor: (data?.donNghiPhepChoDuyet || 0) > 0 ? '#FFEDD5' : '#F1F5F9',
                color: (data?.donNghiPhepChoDuyet || 0) > 0 ? '#EA580C' : '#64748B',
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {(data?.donNghiPhepChoDuyet || 0) > 0 ? 'Chờ phê duyệt' : 'Đã duyệt hết'}
            </span>
            <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
              Duyệt ngay <ArrowRightOutlined style={{ fontSize: 10 }} />
            </span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default KpiCards;
