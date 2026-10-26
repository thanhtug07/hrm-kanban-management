import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, message, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '@/api/dashboardApi';
import { DashboardCaNhanDto } from '@/types/dashboard';
import { formatCurrency } from '@/utils/format';

const { Title, Text } = Typography;

export const MyDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardCaNhanDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await dashboardApi.getMyDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch {
        message.error('Không thể tải dữ liệu Dashboard cá nhân.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Bảng Điều Khiển Cá Nhân
      </Title>

      {/* Kanban Task stats */}
      <Card title="Nhiệm Vụ Của Tôi (Kanban)" loading={loading} style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Chờ làm (Todo)"
              value={data?.taskCuaToi.todo || 0}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Đang làm (In Progress)"
              value={data?.taskCuaToi.inProgress || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Đã xong (Done)"
              value={data?.taskCuaToi.done || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Quá hạn"
              value={data?.taskCuaToi.quaHan || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Điểm danh */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Chấm Công Tháng Này</span>
              </Space>
            }
            loading={loading}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Số ngày công tích lũy"
                  value={data?.chamCongThangNay.soNgayCong || 0}
                  suffix="ngày"
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Số lần đi muộn"
                  value={data?.chamCongThangNay.soLanTre || 0}
                  suffix="lần"
                  valueStyle={{ color: data?.chamCongThangNay.soLanTre ? '#fa8c16' : '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Lương & Nghỉ phép */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <span>Lương & Chế Độ</span>
              </Space>
            }
            loading={loading}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Lương tháng gần nhất:</Text>
              {data?.luongThangGanNhat ? (
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    {formatCurrency(data.luongThangGanNhat.thucLinh)}
                  </span>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    Tháng {data.luongThangGanNhat.thang}/{data.luongThangGanNhat.nam}
                  </Tag>
                </div>
              ) : (
                <div>
                  <Text italic>Chưa có dữ liệu bảng lương tháng gần nhất.</Text>
                </div>
              )}
            </div>

            <div>
              <Text type="secondary">Trạng thái đơn nghỉ phép:</Text>
              <div style={{ marginTop: 6, display: 'flex', gap: 16 }}>
                <Tag color="warning" icon={<ScheduleOutlined />}>
                  {data?.donNghiPhepCuaToi.choDuyet || 0} đơn đang chờ duyệt
                </Tag>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {data?.donNghiPhepCuaToi.daDuyet || 0} đơn đã duyệt
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyDashboard;
