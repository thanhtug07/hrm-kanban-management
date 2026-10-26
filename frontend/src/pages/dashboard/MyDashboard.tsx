import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, message, Skeleton, Empty, Button } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboardApi';
import { DashboardCaNhanDto } from '@/types/dashboard';
import { formatCurrency } from '@/utils/format';
import PageHeader from '@/components/PageHeader';

interface TaskStat {
  key: string;
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export const MyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardCaNhanDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getMyDashboard();
      if (res.success && res.data) setData(res.data);
      else message.error(res?.message || 'Không thể tải dữ liệu Dashboard cá nhân.');
    } catch {
      message.error('Không thể tải dữ liệu Dashboard cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const t = data?.taskCuaToi;
  const taskStats: TaskStat[] = [
    { key: 'todo', label: 'Chờ làm', value: t?.todo || 0, color: '#64748B', bg: 'linear-gradient(135deg,#F1F5F9,#E2E8F0)', icon: <UnorderedListOutlined /> },
    { key: 'inProgress', label: 'Đang làm', value: t?.inProgress || 0, color: '#2563EB', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', icon: <ClockCircleOutlined /> },
    { key: 'done', label: 'Đã xong', value: t?.done || 0, color: '#16A34A', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', icon: <CheckCircleOutlined /> },
    { key: 'quaHan', label: 'Quá hạn', value: t?.quaHan || 0, color: '#DC2626', bg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)', icon: <ExclamationCircleOutlined /> },
  ];

  return (
    <div>
      <PageHeader
        title="Bảng Điều Khiển Cá Nhân"
        subtitle="Tổng quan nhiệm vụ, chấm công và chế độ của bạn"
        icon={<DashboardOutlined />}
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
        }
      />

      {/* Nhiệm vụ Kanban */}
      <Card
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UnorderedListOutlined style={{ color: '#0F766E' }} /> Nhiệm Vụ Của Tôi (Kanban)
          </span>
        }
        style={{ borderRadius: 16, marginBottom: 20, border: '1px solid #F1F5F9' }}
        extra={
          <Button type="link" size="small" onClick={() => navigate('/kanban')}>
            Xem bảng Kanban →
          </Button>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {taskStats.map((s) => (
              <Col xs={12} sm={6} key={s.key}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: s.bg,
                    border: '1px solid rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ fontSize: 22, color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 750, color: s.color, lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* Chấm công tháng này */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: '#0F766E' }} /> Chấm Công Tháng Này
              </span>
            }
            style={{ borderRadius: 16, height: '100%', border: '1px solid #F1F5F9' }}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/chamcong')}>
                Chi tiết →
              </Button>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Ngày công tích lũy"
                    value={data?.chamCongThangNay.soNgayCong || 0}
                    suffix="ngày"
                    valueStyle={{ color: '#0F766E', fontWeight: 750 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Số lần đi muộn"
                    value={data?.chamCongThangNay.soLanTre || 0}
                    suffix="lần"
                    valueStyle={{
                      color: data?.chamCongThangNay.soLanTre ? '#EA580C' : '#16A34A',
                      fontWeight: 750,
                    }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        {/* Lương & Nghỉ phép */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ color: '#0F766E' }} /> Lương &amp; Chế Độ
              </span>
            }
            style={{ borderRadius: 16, height: '100%', border: '1px solid #F1F5F9' }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                    Lương thực lĩnh gần nhất
                  </div>
                  {data?.luongThangGanNhat ? (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 26, fontWeight: 750, color: '#16A34A' }}>
                        {formatCurrency(data.luongThangGanNhat.thucLinh)}
                      </span>
                      <Tag color="green" style={{ borderRadius: 8, fontWeight: 600 }}>
                        Tháng {data.luongThangGanNhat.thang}/{data.luongThangGanNhat.nam}
                      </Tag>
                    </div>
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu bảng lương" style={{ margin: '8px 0' }} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Tag color="warning" icon={<ScheduleOutlined />} style={{ borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
                    {data?.donNghiPhepCuaToi.choDuyet || 0} đơn chờ duyệt
                  </Tag>
                  <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
                    {data?.donNghiPhepCuaToi.daDuyet || 0} đơn đã duyệt
                  </Tag>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyDashboard;
