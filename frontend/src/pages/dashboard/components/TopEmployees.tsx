import React from 'react';
import { Card, Typography, Avatar, Progress, Empty } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { TopNhanVienItem } from '@/types/dashboard';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Text } = Typography;

interface TopEmployeesProps {
  data: TopNhanVienItem[];
}

export const TopEmployees: React.FC<TopEmployeesProps> = ({ data }) => {
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
        <Empty description="Chưa có dữ liệu nhân viên xuất sắc" />
      </Card>
    );
  }

  const maxTask = data[0]?.soTask || 1;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FDE68A',
          label: '1',
        };
      case 1:
        return {
          bg: '#F1F5F9',
          color: '#475569',
          border: '#E2E8F0',
          label: '2',
        };
      case 2:
        return {
          bg: '#FFEDD5',
          color: '#C2410C',
          border: '#FED7AA',
          label: '3',
        };
      default:
        return {
          bg: '#F8FAFC',
          color: '#94A3B8',
          border: 'transparent',
          label: `${rank + 1}`,
        };
    }
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }}
      styles={{ body: { padding: '20px 22px' } }}
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
            Top Nhân Viên Phụ Trách (Task Leaders)
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Xếp hạng nhân sự năng suất cao nhất theo số lượng công việc
          </Text>
        </div>

        <TrophyOutlined style={{ fontSize: 18, color: '#F59E0B' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.slice(0, 5).map((emp, index) => {
          const avatar = getAvatarStyle(emp.hoTen);
          const badge = getRankBadge(index);
          const percentage = Math.round((emp.soTask / maxTask) * 100);

          return (
            <div
              key={emp.maNV}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: index === 0 ? '#FAF5FF' : '#F8FAFC',
                borderRadius: 12,
                border: index === 0 ? '1px solid #E9D5FF' : '1px solid #F1F5F9',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Podium Rank Circle */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {badge.label}
                </div>

                <Avatar
                  size={32}
                  style={{
                    backgroundColor: avatar.bg,
                    color: avatar.text,
                    border: `1px solid ${avatar.border}`,
                    fontWeight: 700,
                    fontSize: 11.5,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(emp.hoTen)}
                </Avatar>

                <div>
                  <div style={{ fontWeight: 650, fontSize: 13, color: '#0F172A' }}>
                    {emp.hoTen}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Mã NV: {emp.maNV}</div>
                </div>
              </div>

              {/* Progress & Task Count */}
              <div style={{ width: 130, textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#4F46E5', marginBottom: 2 }}>
                  {emp.soTask} tasks
                </div>
                <Progress
                  percent={percentage}
                  showInfo={false}
                  strokeColor={index === 0 ? '#7C3AED' : '#4F46E5'}
                  size="small"
                  style={{ margin: 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TopEmployees;
