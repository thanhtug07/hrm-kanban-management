import React from 'react';
import { Card, Typography, Avatar, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  FileDoneOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Text } = Typography;

interface ActivityItem {
  id: number;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: 'task' | 'leave' | 'comment' | 'payroll';
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    actor: 'Bùi Thanh Thảo',
    action: 'vừa cập nhật tiến độ công việc',
    target: 'Task #8: Xây dựng giao diện Kanban kéo thả',
    time: '5 phút trước',
    type: 'task',
  },
  {
    id: 2,
    actor: 'Vũ Đình Trọng',
    action: 'đã chuyển trạng thái sang In Progress',
    target: 'Task #6: Thiết kế CSDL SQL Server',
    time: '25 phút trước',
    type: 'task',
  },
  {
    id: 3,
    actor: 'Ngô Văn Kiên',
    action: 'đã gửi đơn xin nghỉ phép năm',
    target: 'Đơn nghỉ 2 ngày (02/11 - 03/11)',
    time: '1 giờ trước',
    type: 'leave',
  },
  {
    id: 4,
    actor: 'Lý Hải Yến',
    action: 'đã hoàn thành công việc',
    target: 'Task #4: Lập báo cáo tài chính dự trù quý 4',
    time: '3 giờ trước',
    type: 'task',
  },
  {
    id: 5,
    actor: 'Dương Thúy Hằng',
    action: 'vừa thêm bình luận mới vào',
    target: 'Task #7: Phát triển API Xác thực JWT',
    time: '5 giờ trước',
    type: 'comment',
  },
  {
    id: 6,
    actor: 'Hệ Thống HRM',
    action: 'đã tự động tổng hợp bảng lương tháng',
    target: 'Kỳ lương tháng 10/2026 cho 22 nhân viên',
    time: 'Hôm qua',
    type: 'payroll',
  },
];

export const ActivityFeed: React.FC = () => {
  return (
    <Card
      style={{
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: 20,
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
            Hoạt Động Gần Đây (Activity Feed)
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Dòng sự kiện cập nhật thời gian thực trên hệ thống
          </Text>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 650,
            padding: '2px 8px',
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
          Live
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MOCK_ACTIVITIES.map((act) => {
          const avatar = getAvatarStyle(act.actor);
          return (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                paddingBottom: 12,
                borderBottom: act.id !== MOCK_ACTIVITIES.length ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <Avatar
                size={34}
                style={{
                  backgroundColor: avatar.bg,
                  color: avatar.text,
                  border: `1px solid ${avatar.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(act.actor)}
              </Avatar>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                  <strong style={{ color: '#0F172A' }}>{act.actor}</strong> {act.action}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#4F46E5',
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {act.target}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  {act.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityFeed;
