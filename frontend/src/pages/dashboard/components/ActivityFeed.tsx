import React from 'react';
import { Card, Typography, Avatar, Tag, Empty } from 'antd';
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import { TaskItemDto, TaskStatus } from '@/types/congViec';

const { Text } = Typography;

interface ActivityFeedProps {
  tasks: TaskItemDto[];
}

const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  Todo: { label: 'Cần làm', color: '#475569', bg: '#F1F5F9' },
  InProgress: { label: 'Đang làm', color: '#0F766E', bg: '#ECFDF5' },
  Review: { label: 'Chờ duyệt', color: '#B45309', bg: '#FFFBEB' },
  Done: { label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5' },
};

function formatDeadline(deadline?: string): string {
  if (!deadline) return 'Không có hạn';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 'Không có hạn';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ tasks }) => {
  const recent = [...tasks]
    .sort((a, b) => {
      const ta = new Date(a.ngayCapNhat || a.ngayTao || 0).getTime();
      const tb = new Date(b.ngayCapNhat || b.ngayTao || 0).getTime();
      if (tb !== ta) return tb - ta;
      return b.maTask - a.maTask;
    })
    .slice(0, 8);

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
            Các công việc được cập nhật mới nhất trên hệ thống
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

      {recent.length === 0 ? (
        <Empty description="Chưa có hoạt động nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recent.map((task, index) => {
            const actor = task.tenNV_PhuTrach || task.tenNV_Giao || 'Hệ Thống';
            const avatar = getAvatarStyle(actor);
            const status = STATUS_META[task.trangThai] || STATUS_META.Todo;
            const isDone = task.trangThai === 'Done';
            return (
              <div
                key={task.maTask}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  paddingBottom: 12,
                  borderBottom: index !== recent.length - 1 ? '1px solid #F1F5F9' : 'none',
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
                  {getInitials(actor)}
                </Avatar>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                    <strong style={{ color: '#0F172A' }}>{actor}</strong>{' '}
                    {isDone ? 'đã hoàn thành' : 'vừa cập nhật'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#0F766E',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={task.tieuDe}
                  >
                    Task #{task.maTask}: {task.tieuDe}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Tag
                      icon={isDone ? <CheckCircleOutlined /> : <SyncOutlined />}
                      style={{
                        margin: 0,
                        fontSize: 11,
                        borderRadius: 8,
                        border: 'none',
                        color: status.color,
                        backgroundColor: status.bg,
                        fontWeight: 600,
                      }}
                    >
                      {status.label}
                    </Tag>
                    <span
                      style={{
                        fontSize: 11,
                        color: task.laQuaHan ? '#DC2626' : '#94A3B8',
                        fontWeight: task.laQuaHan ? 600 : 400,
                      }}
                    >
                      {task.laQuaHan ? 'Quá hạn: ' : 'Hạn: '}
                      {formatDeadline(task.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
