import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import { ArrowUpOutlined, CheckCircleOutlined, RiseOutlined } from '@ant-design/icons';
import type { DashboardPeriod } from './DashboardHeader';

const { Text } = Typography;

// ponytail: mock, thay bằng API khi có endpoint thống kê theo tháng
const MOCK_TREND_DATA = [
  { month: 'T4/2026', taoMoi: 12, hoanThanh: 9 },
  { month: 'T5/2026', taoMoi: 14, hoanThanh: 10 },
  { month: 'T6/2026', taoMoi: 18, hoanThanh: 15 },
  { month: 'T7/2026', taoMoi: 22, hoanThanh: 19 },
  { month: 'T8/2026', taoMoi: 19, hoanThanh: 21 },
  { month: 'T9/2026', taoMoi: 27, hoanThanh: 24 },
  { month: 'T10/2026', taoMoi: 25, hoanThanh: 23 },
];

// Số mốc tháng hiển thị theo kỳ
const PERIOD_POINTS: Record<DashboardPeriod, number> = {
  week: 1,
  month: 3,
  quarter: 6,
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const taoMoi = payload[0]?.value ?? 0;
    const hoanThanh = payload[1]?.value ?? 0;
    const pct = taoMoi > 0 ? Math.round((hoanThanh / taoMoi) * 100) : 0;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid #E2E8F0',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
          fontSize: 12.5,
          minWidth: 180,
        }}
      >
        <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 8, fontSize: 13 }}>{label}</div>
        <div style={{ color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E' }} />
            Tạo mới
          </span>
          <strong>{taoMoi}</strong>
        </div>
        <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            Hoàn thành
          </span>
          <strong>{hoanThanh}</strong>
        </div>
        <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 8, paddingTop: 6, color: '#64748B', fontSize: 12 }}>
          Tỷ lệ hoàn tất: <strong style={{ color: '#0F172A' }}>{pct}%</strong>
        </div>
      </div>
    );
  }
  return null;
};

interface TaskTrendChartProps {
  period?: DashboardPeriod;
}

export const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ period = 'month' }) => {
  const points = PERIOD_POINTS[period];
  const chartData = MOCK_TREND_DATA.slice(-points);
  const rangeLabel =
    period === 'quarter' ? '6 tháng gần nhất' : period === 'week' ? 'tháng gần nhất' : '3 tháng gần nhất';

  // Tính chỉ số tổng hợp
  const totalTaoMoi = chartData.reduce((s, d) => s + d.taoMoi, 0);
  const totalHoanThanh = chartData.reduce((s, d) => s + d.hoanThanh, 0);
  const tyLe = totalTaoMoi > 0 ? Math.round((totalHoanThanh / totalTaoMoi) * 100) : 0;

  const summary = [
    { label: 'Tổng tạo mới', value: totalTaoMoi, icon: <ArrowUpOutlined />, color: '#0F766E', bg: '#ECFDF5' },
    { label: 'Tổng hoàn thành', value: totalHoanThanh, icon: <CheckCircleOutlined />, color: '#059669', bg: '#F0FDF4' },
    { label: 'Tỷ lệ hoàn tất', value: `${tyLe}%`, icon: <RiseOutlined />, color: '#2563EB', bg: '#EFF6FF' },
  ];

  return (
    <Card
      style={{
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: 20,
      }}
      styles={{ body: { padding: '20px 22px 16px' } }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            Xu Hướng Công Việc (Task Trend)
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Tương quan khối lượng việc tạo mới và hoàn tất — {rangeLabel}
          </Text>
        </div>

        <Space size={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
            <span style={{ width: 12, height: 4, borderRadius: 2, background: '#0F766E' }} />
            <span style={{ color: '#64748B', fontWeight: 500 }}>Tạo mới</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
            <span style={{ width: 12, height: 4, borderRadius: 2, background: '#10B981' }} />
            <span style={{ color: '#64748B', fontWeight: 500 }}>Hoàn thành</span>
          </div>
        </Space>
      </div>

      {/* Summary strip */}
      <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
        {summary.map((s) => (
          <Col xs={24} sm={8} key={s.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                background: s.bg,
                border: '1px solid rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#FFFFFF',
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 750, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 18, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTaoMoi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorHoanThanh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F6" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              allowDecimals={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }} />
            <Legend
              verticalAlign="top"
              height={0}
              content={() => null}
            />
            <Area
              type="monotone"
              dataKey="taoMoi"
              name="Tạo mới"
              stroke="#0F766E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTaoMoi)"
              dot={{ r: 4, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            >
              <LabelList dataKey="taoMoi" position="top" fill="#0F766E" fontSize={11.5} fontWeight={700} />
            </Area>
            <Area
              type="monotone"
              dataKey="hoanThanh"
              name="Hoàn thành"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorHoanThanh)"
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            >
              <LabelList dataKey="hoanThanh" position="bottom" fill="#10B981" fontSize={11.5} fontWeight={700} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TaskTrendChart;
