import React, { useState } from 'react';
import { Typography, Input, Button } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { Droppable } from '@hello-pangea/dnd';
import { TaskItemDto, TaskStatus } from '@/types/congViec';
import KanbanCard from './KanbanCard';

const { Text } = Typography;

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  badgeColor?: string;
  tasks: TaskItemDto[];
  totalTasks: number;
  onTaskClick: (task: TaskItemDto) => void;
  onEditTask?: (task: TaskItemDto) => void;
  onDeleteTask?: (maTask: number) => void;
  onQuickAdd?: (status: TaskStatus, tieuDe: string) => void;
}

const COLUMN_CONFIG: Record<
  TaskStatus,
  {
    bg: string;
    border: string;
    dotColor: string;
    englishTitle: string;
    vietnameseTitle: string;
    badgeBg: string;
    badgeText: string;
    accentBar: string;
  }
> = {
  Todo: {
    bg: '#F5F3FF', // Tím nhạt rõ nét
    border: '#DDD6FE',
    dotColor: '#7C3AED',
    englishTitle: 'To do',
    vietnameseTitle: 'Chờ làm',
    badgeBg: '#EDE9FE',
    badgeText: '#6D28D9',
    accentBar: '#7C3AED',
  },
  InProgress: {
    bg: '#EFF6FF', // Xanh dương tươi sáng
    border: '#BFDBFE',
    dotColor: '#2563EB',
    englishTitle: 'In progress',
    vietnameseTitle: 'Đang làm',
    badgeBg: '#DBEAFE',
    badgeText: '#1D4ED8',
    accentBar: '#2563EB',
  },
  Review: {
    bg: '#FFF7ED', // Cam ấm hổ phách tách biệt
    border: '#FED7AA',
    dotColor: '#EA580C',
    englishTitle: 'Review',
    vietnameseTitle: 'Chờ duyệt / Test',
    badgeBg: '#FFEDD5',
    badgeText: '#C2410C',
    accentBar: '#EA580C',
  },
  Done: {
    bg: '#F0FDF4', // Xanh lá cây tươi mát
    border: '#BBF7D0',
    dotColor: '#16A34A',
    englishTitle: 'Done',
    vietnameseTitle: 'Hoàn tất',
    badgeBg: '#DCFCE7',
    badgeText: '#15803D',
    accentBar: '#16A34A',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  totalTasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onQuickAdd,
}) => {
  const cfg = COLUMN_CONFIG[status];
  const [isAdding, setIsAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  const handleConfirmAdd = () => {
    if (quickTitle.trim() && onQuickAdd) {
      onQuickAdd(status, quickTitle.trim());
      setQuickTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setQuickTitle('');
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0, // Đảm bảo vừa vặn 100% trong grid/flex, không tràn ngang
        backgroundColor: cfg.bg,
        borderRadius: 14,
        padding: '14px 12px 14px 12px',
        display: 'flex',
        flexDirection: 'column',
        border: `1.5px solid ${cfg.border}`,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '0 2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          {/* Status Dot */}
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: cfg.dotColor,
              display: 'inline-block',
              boxShadow: `0 0 0 2px ${cfg.border}`,
            }}
          />
          {/* Title */}
          <Text
            strong
            style={{
              fontSize: 14,
              color: '#111827',
              letterSpacing: '-0.01em',
              fontWeight: 650,
            }}
          >
            {cfg.englishTitle}
          </Text>
          {/* Badge count */}
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 10,
              backgroundColor: cfg.badgeBg,
              color: cfg.badgeText,
            }}
          >
            {tasks.length}
          </span>
        </div>

        {/* Right Header Controls */}
        {onQuickAdd && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          title={`Thêm công việc vào ${cfg.englishTitle}`}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            padding: '4px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <PlusOutlined style={{ fontSize: 13 }} />
        </button>)}
      </div>

      {/* Droppable Card List Area - Tự nhiên không cuộn lồng nhau (no inner scrollbars) */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              minHeight: 220,
              padding: '2px 1px',
              backgroundColor: snapshot.isDraggingOver
                ? 'rgba(255, 255, 255, 0.7)'
                : 'transparent',
              borderRadius: 10,
              transition: 'background-color 0.2s ease',
            }}
          >
            {tasks.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 12px',
                  color: '#9CA3AF',
                  border: '1.5px dashed rgba(0,0,0,0.1)',
                  borderRadius: 10,
                  margin: '6px 0',
                  background: 'rgba(255,255,255,0.6)',
                }}
              >
                <InboxOutlined
                  style={{
                    fontSize: 22,
                    marginBottom: 4,
                    display: 'block',
                    color: '#D1D5DB',
                  }}
                />
                <span style={{ fontSize: 11.5 }}>Chưa có thẻ</span>
              </div>
            ) : (
              tasks.map((task, index) => (
                <KanbanCard
                  key={task.maTask}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Bottom Button: + Add task */}
      {onQuickAdd && (
      <div style={{ marginTop: 8, paddingTop: 4 }}>
        {isAdding ? (
          <div
            style={{
              background: '#FFFFFF',
              padding: 8,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB',
            }}
          >
            <Input
              autoFocus
              placeholder="Tiêu đề & Enter..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              style={{
                marginBottom: 6,
                borderRadius: 6,
                fontSize: 12.5,
                border: '1px solid #D1D5DB',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <Button
                size="small"
                onClick={() => {
                  setIsAdding(false);
                  setQuickTitle('');
                }}
                style={{ borderRadius: 6, fontSize: 11.5, padding: '0 8px' }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={handleConfirmAdd}
                disabled={!quickTitle.trim()}
                style={{
                  backgroundColor: cfg.accentBar,
                  borderColor: cfg.accentBar,
                  borderRadius: 6,
                  fontSize: 11.5,
                  padding: '0 10px',
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '7px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              border: `1px dashed ${cfg.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              color: '#4B5563',
              fontSize: 12.5,
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = cfg.dotColor;
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
              e.currentTarget.style.borderColor = cfg.border;
              e.currentTarget.style.color = '#4B5563';
            }}
          >
            <PlusOutlined style={{ fontSize: 11 }} />
            <span>Thêm thẻ</span>
          </button>
        )}
      </div>
      )}
    </div>
  );
};

export default KanbanColumn;