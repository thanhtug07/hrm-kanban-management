import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Typography,
  Space,
  Tag,
  Descriptions,
  Divider,
  List,
  Avatar,
  Input,
  Button,
  Popconfirm,
  message,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { TaskItemDto, BinhLuanDto } from '@/types/congViec';
import { congViecApi } from '@/api/congViecApi';
import { useAuthStore } from '@/stores/authStore';
import PriorityTag from '@/components/PriorityTag';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils/format';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskDetailDrawerProps {
  task: TaskItemDto | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: TaskItemDto) => void;
  onDeleted: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  open,
  onClose,
  onEdit,
  onDeleted,
}) => {
  const { user } = useAuthStore();
  const isHrOrAdmin = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  const [comments, setComments] = useState<BinhLuanDto[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const res = await congViecApi.getComments(task.maTask);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch {
      message.error('Không thể tải bình luận công việc.');
    } finally {
      setLoadingComments(false);
    }
  }, [task]);

  useEffect(() => {
    if (open && task) {
      fetchComments();
      setNewComment('');
    }
  }, [open, task, fetchComments]);

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await congViecApi.addComment(task.maTask, { noiDung: newComment.trim() });
      if (res.success) {
        message.success('Đã gửi bình luận');
        setNewComment('');
        fetchComments();
      } else {
        message.error(res.message || 'Gửi bình luận thất bại.');
      }
    } catch {
      message.error('Lỗi khi gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      const res = await congViecApi.delete(task.maTask);
      if (res.success) {
        message.success(`Đã xóa công việc #${task.maTask}`);
        onClose();
        onDeleted();
      } else {
        message.error(res.message || 'Xóa công việc thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi xóa công việc.');
    }
  };

  if (!task) return null;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Chi tiết công việc #{task.maTask}</span>
          <StatusTag status={task.trangThai} />
          <PriorityTag priority={task.doUuTien} />
          {task.laQuaHan && (
            <Tag color="error" icon={<AlertOutlined />}>
              Quá hạn
            </Tag>
          )}
        </div>
      }
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      extra={
        isHrOrAdmin && (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1890ff' }} />}
              onClick={() => {
                onClose();
                onEdit(task);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa công việc này?"
              onConfirm={handleDeleteTask}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    >
      <Title level={4} style={{ marginBottom: 12 }}>
        {task.tieuDe}
      </Title>

      <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Người giao">{task.tenNV_Giao}</Descriptions.Item>
        <Descriptions.Item label="Phụ trách">{task.tenNV_PhuTrach}</Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {task.ngayBatDau ? formatDate(task.ngayBatDau) : 'Chưa đặt'}
        </Descriptions.Item>
        <Descriptions.Item label="Hạn chót">
          {task.deadline ? (
            <span style={{ color: task.laQuaHan ? '#f5222d' : undefined, fontWeight: task.laQuaHan ? 'bold' : 'normal' }}>
              {formatDate(task.deadline)}
            </span>
          ) : (
            'Không có'
          )}
        </Descriptions.Item>
        {task.ngayHoanThanh && (
          <Descriptions.Item label="Ngày hoàn thành" span={2}>
            <Tag color="success">{formatDate(task.ngayHoanThanh)}</Tag>
          </Descriptions.Item>
        )}
      </Descriptions>

      <div>
        <Text strong>Mô tả chi tiết:</Text>
        <div
          style={{
            marginTop: 6,
            padding: 12,
            backgroundColor: '#fafafa',
            borderRadius: 6,
            minHeight: 60,
          }}
        >
          {task.moTa ? (
            <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{task.moTa}</Paragraph>
          ) : (
            <Text type="secondary" italic>
              Không có mô tả chi tiết.
            </Text>
          )}
        </div>
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* Comment Section */}
      <div>
        <Title level={5} style={{ marginBottom: 12 }}>
          Trao đổi & Bình luận ({comments.length})
        </Title>

        <List
          loading={loadingComments}
          itemLayout="horizontal"
          dataSource={comments}
          locale={{ emptyText: 'Chưa có bình luận nào cho công việc này.' }}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{item.hoTen}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {item.thoiGian ? formatDate(item.thoiGian) : ''}
                    </Text>
                  </div>
                }
                description={
                  <div style={{ color: '#262626', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                    {item.noiDung}
                  </div>
                }
              />
            </List.Item>
          )}
          style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            rows={2}
            placeholder="Viết bình luận, phản hồi tiến độ..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleAddComment();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submittingComment}
            onClick={handleAddComment}
            style={{ height: 'auto' }}
          >
            Gửi
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default TaskDetailDrawer;
