import React from 'react';
import { Card, Typography, Avatar, Tag, Empty, Tooltip } from 'antd';
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

// Thời gian tuyệt đối: dd/MM/yyyy HH:mm
function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Thời gian tương đối: "vừa xong", "5 phút trước", "2 giờ trước", "hôm qua"...
function formatRelative(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

function formatDeadline(deadline?: string): string {
  if (!deadline) return '—';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ tasks }) => {
  const recent = [...tasks]
    .sort((a, b) => {
      const ta = new Date(a.ngayCapNhat || a.ngayTao || 0).getTime();
      const tb = new Date(b.ngayCapNhat || b.ngayTao || 0).getTime();
      if (tb !== ta) return tb - ta;
      return b.maTask - a.maTask;
    })
    .slice(0, 10);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
          {recent.map((task) => {
            const actor = task.tenNV_PhuTrach || task.tenNV_Giao || 'Hệ Thống';
            const avatar = getAvatarStyle(actor);
            const status = STATUS_META[task.trangThai] || STATUS_META.Todo;
            const isDone = task.trangThai === 'Done';
            const updatedAt = task.ngayCapNhat || task.ngayTao;

            return (
              <div
                key={task.maTask}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                }}
                className="activity-item"
              >
                {/* Avatar + nội dung (trái) */}
                <Avatar
                  size={40}
                  style={{
                    backgroundColor: avatar.bg,
                    color: avatar.text,
                    border: `1px solid ${avatar.border}`,
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                  }}
                >
                  {getInitials(actor)}
                </Avatar>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Dòng 1: actor + hành động */}
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                    <strong style={{ color: '#0F172A' }}>{actor}</strong>{' '}
                    <span style={{ color: '#64748B' }}>
                      {isDone ? 'đã hoàn thành' : 'vừa cập nhật'}
                    </span>
                  </div>

                  {/* Dòng 2: tiêu đề task — TO, RÕ */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 650,
                      color: '#0F766E',
                      marginTop: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`Task #${task.maTask}: ${task.tieuDe}`}
                  >
                    #{task.maTask} · {task.tieuDe}
                  </div>

                  {/* Dòng 3: tag trạng thái + deadline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
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
                        fontSize: 11.5,
                        color: task.laQuaHan ? '#DC2626' : '#94A3B8',
                        fontWeight: task.laQuaHan ? 600 : 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ClockCircleOutlined style={{ fontSize: 10 }} />
                      {task.laQuaHan ? 'Quá hạn: ' : 'Hạn: '}
                      {formatDeadline(task.deadline)}
                    </span>
                  </div>
                </div>

                {/* Thời gian (phải) — chi tiết */}
                <div
                  style={{
                    flexShrink: 0,
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 2,
                    minWidth: 118,
                  }}
                >
                  <Tooltip title="Thời điểm cập nhật gần nhất">
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#0F766E',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDateTime(updatedAt)}
                    </span>
                  </Tooltip>
                  <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {formatRelative(updatedAt)}
                  </span>
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
