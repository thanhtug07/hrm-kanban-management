import React from 'react';
import { Card, Typography, Empty, Space } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NhanSuTheoPhongBanItem } from '@/types/dashboard';

const { Text } = Typography;

const DONUT_COLORS = ['#0F766E', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

interface DepartmentDonutProps {
  data: NhanSuTheoPhongBanItem[];
  totalEmployees: number;
}

export const DepartmentDonut: React.FC<DepartmentDonutProps> = ({
  data,
  totalEmployees,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          background: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Empty description="Chưa có dữ liệu phòng ban" />
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.tenPB,
    value: item.soLuong,
    color: DONUT_COLORS[index % DONUT_COLORS.length],
    maPB: item.maPB,
  }));

  return (
    <Card
      style={{
        height: '100%',
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }}
      styles={{ body: { padding: '20px 22px' } }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
          Phân Bổ Nhân Lực (Department Donut)
        </div>
        <Text type="secondary" style={{ fontSize: 12.5 }}>
          Cơ cấu tỷ trọng nhân sự theo các khối phòng ban chức năng
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Donut Chart with Centered Total */}
        <div style={{ width: 220, height: 220, position: 'relative', margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} nhân sự (${totalEmployees > 0 ? Math.round((Number(value) / totalEmployees) * 100) : 0}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  fontSize: 12,
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text overlay */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 750, color: '#0F172A', lineHeight: 1 }}>
              {totalEmployees}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>Nhân sự</div>
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chartData.map((item) => {
            const pct = totalEmployees > 0 ? Math.round((item.value / totalEmployees) * 100) : 0;
            return (
              <div
                key={item.maPB}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 12px',
                  background: '#F8FAFC',
                  borderRadius: 8,
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      display: 'inline-block',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1E293B' }}>
                      {item.name}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    {item.value}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#64748B', marginLeft: 4 }}>
                    ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default DepartmentDonut;
