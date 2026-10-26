import React from 'react';
import { Avatar, Tooltip, Typography, Popconfirm, Button } from 'antd';
import {
  CalendarOutlined,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Draggable } from '@hello-pangea/dnd';
import dayjs from 'dayjs';
import { TaskItemDto } from '@/types/congViec';
import { getInitials, getAvatarStyle } from '@/utils/avatar';

const { Text } = Typography;

interface KanbanCardProps {
  task: TaskItemDto;
  index: number;
  onClick: (task: TaskItemDto) => void;
  onEdit?: (task: TaskItemDto) => void;
  onDelete?: (maTask: number) => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'Khẩn cấp': { label: 'URGENT', color: '#EF4444', dot: '#DC2626' },
  'Cao': { label: 'HIGH', color: '#F97316', dot: '#EA580C' },
  'Trung bình': { label: 'MEDIUM', color: '#D97706', dot: '#EAB308' },
  'Thấp': { label: 'LOW', color: '#3B82F6', dot: '#2563EB' },
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  index,
  onClick,
  onEdit,
  onDelete,
}) => {
  const avatarStyle = getAvatarStyle(task.tenNV_PhuTrach);
  const isOverdue = task.laQuaHan;
  const priority = PRIORITY_CONFIG[task.doUuTien] || {
    label: (task.doUuTien || 'NORMAL').toUpperCase(),
    color: '#6B7280',
    dot: '#9CA3AF',
  };

  return (
    <Draggable draggableId={String(task.maTask)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          style={{
            marginBottom: 10,
            userSelect: 'none',
            ...provided.draggableProps.style,
          }}
        >
          <div
            className="hover-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              padding: '14px 16px',
              border: '1px solid #F3F4F6',
              boxShadow: snapshot.isDragging
                ? '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)'
                : '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
              transform: snapshot.isDragging ? 'rotate(2.5deg) scale(1.02)' : 'none',
              cursor: 'grab',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Dòng 1: Dot + Priority Title in hoa & Quick Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: priority.dot,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: priority.color,
                    letterSpacing: '0.06em',
                  }}
                >
                  {priority.label}
                </span>
              </div>

              {/* Quick Actions (Hover reveal) */}
              <div
                className="card-actions"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <Tooltip title="Sửa công việc">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined style={{ fontSize: 12, color: '#6B7280' }} />}
                      onClick={() => onEdit(task)}
                      style={{ width: 22, height: 22, padding: 0 }}
                    />
                  </Tooltip>
                )}
                {onDelete && (
                  <Popconfirm
                    title="Xóa công việc này?"
                    onConfirm={() => onDelete(task.maTask)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Xóa">
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                        style={{ width: 22, height: 22, padding: 0 }}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </div>
            </div>

            {/* Dòng 2: Tiêu đề Task (Đậm, 14.5px) */}
            <h3
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 6px 0',
                lineHeight: 1.4,
              }}
            >
              {task.tieuDe}
            </h3>

            {/* Dòng 3: Mô tả (nếu có, tối đa 2 dòng) */}
            {task.moTa && (
              <p
                style={{
                  fontSize: 12.5,
                  color: '#6B7280',
                  margin: '0 0 12px 0',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.moTa}
              </p>
            )}

            {/* Dòng 4: Footer (Avatar + Tên bên trái, Deadline/Comment bên phải) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: task.moTa ? 0 : 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Avatar
                  size={24}
                  style={{
                    backgroundColor: avatarStyle.bg,
                    color: avatarStyle.text,
                    border: `1px solid ${avatarStyle.border}`,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getInitials(task.tenNV_PhuTrach)}
                </Avatar>
                <span
                  style={{
                    fontSize: 12,
                    color: '#4B5563',
                    fontWeight: 500,
                    maxWidth: 110,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {task.tenNV_PhuTrach}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {task.soBinhLuan > 0 && (
                  <span style={{ fontSize: 11.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CommentOutlined style={{ fontSize: 11 }} />
                    {task.soBinhLuan}
                  </span>
                )}

                {task.deadline && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: isOverdue ? 600 : 500,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: isOverdue ? '#FEE2E2' : '#F3F4F6',
                      color: isOverdue ? '#DC2626' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CalendarOutlined style={{ fontSize: 10.5 }} />
                    {dayjs(task.deadline).format('DD/MM')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
