import React from 'react';
import { Card, Typography, Space } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const { Text } = Typography;

// Mock 6 tháng gần nhất cho xu hướng công việc
const MOCK_TREND_DATA = [
  { month: 'T5/2026', taoMoi: 14, hoanThanh: 10 },
  { month: 'T6/2026', taoMoi: 18, hoanThanh: 15 },
  { month: 'T7/2026', taoMoi: 22, hoanThanh: 19 },
  { month: 'T8/2026', taoMoi: 19, hoanThanh: 21 },
  { month: 'T9/2026', taoMoi: 27, hoanThanh: 24 },
  { month: 'T10/2026', taoMoi: 25, hoanThanh: 23 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          fontSize: 12.5,
        }}
      >
        <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{label}</div>
        <div style={{ color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5' }} />
          <span>Tạo mới: <strong>{payload[0]?.value}</strong> tasks</span>
        </div>
        <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          <span>Hoàn thành: <strong>{payload[1]?.value}</strong> tasks</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TaskTrendChart: React.FC = () => {
  return (
    <Card
      style={{
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: 20,
      }}
      styles={{ body: { padding: '20px 22px 14px' } }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            Xu Hướng Công Việc (Task Trend)
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Tương quan giữa khối lượng việc tạo mới và tỷ lệ hoàn tất trong 6 tháng qua
          </Text>
        </div>

        <Space size={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#4F46E5' }} />
            <span style={{ color: '#64748B' }}>Tạo mới</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981' }} />
            <span style={{ color: '#64748B' }}>Hoàn thành</span>
          </div>
        </Space>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTaoMoi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHoanThanh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="taoMoi"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTaoMoi)"
            />
            <Area
              type="monotone"
              dataKey="hoanThanh"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorHoanThanh)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TaskTrendChart;
