import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  message,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanBoardDto, TaskItemDto, TaskStatus } from '@/types/congViec';
import { congViecApi } from '@/api/congViecApi';
import { nhanVienApi } from '@/api/nhanVienApi';
import { NhanVienDto } from '@/types/nhanVien';
import { useAuthStore } from '@/stores/authStore';
import KanbanColumn from './KanbanColumn';
import TaskDetailDrawer from './TaskDetailDrawer';
import TaskFormModal from './TaskFormModal';

const { Title, Text } = Typography;

export const KanbanBoardPage: React.FC = () => {
  const { user } = useAuthStore();
  const isHrOrAdmin = user?.vaiTro === 'Admin' || user?.vaiTro === 'HR';

  const [boardData, setBoardData] = useState<KanbanBoardDto>({
    todo: [],
    inProgress: [],
    review: [],
    done: [],
    totalTasks: 0,
    overdueTasks: 0,
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);

  // Filter
  const [filterMaNV, setFilterMaNV] = useState<string | undefined>(undefined);
  const [filterDoUuTien, setFilterDoUuTien] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // Modals & Drawers
  const [selectedTask, setSelectedTask] = useState<TaskItemDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItemDto | null>(null);

  // Fetch Board
  const fetchBoard = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const res: any = await congViecApi.getBoard({
          maNV: filterMaNV,
          doUuTien: filterDoUuTien,
          search: searchText,
        });
        if (res && res.success && res.data) {
          setBoardData({
            todo: res.data.todo || [],
            inProgress: res.data.inProgress || [],
            review: res.data.review || [],
            done: res.data.done || [],
            totalTasks: res.data.totalTasks || 0,
            overdueTasks: res.data.overdueTasks || 0,
          });
        }
      } catch (err) {
        if (!isBackground) {
          message.error('Lỗi khi tải dữ liệu bảng Kanban từ máy chủ.');
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [filterMaNV, filterDoUuTien, searchText]
  );

  // Polling Real-time mỗi 30s
  useEffect(() => {
    fetchBoard(false);
    const interval = setInterval(() => {
      fetchBoard(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  useEffect(() => {
    // Chỉ Admin/HR mới có quyền xem danh sách nhân viên (endpoint /api/nhanvien)
    if (!isHrOrAdmin) return;
    const loadEmps = async () => {
      try {
        const res: any = await nhanVienApi.getList({ pageSize: 100 });
        if (res && res.success && res.data) {
          setEmployees(res.data.items || []);
        }
      } catch {
        // ignore
      }
    };
    loadEmps();
  }, [isHrOrAdmin]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const maTask = parseInt(draggableId, 10);
    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    const getColumnKey = (status: TaskStatus): keyof KanbanBoardDto => {
      switch (status) {
        case 'Todo':
          return 'todo';
        case 'InProgress':
          return 'inProgress';
        case 'Review':
          return 'review';
        case 'Done':
          return 'done';
      }
    };

    const sourceKey = getColumnKey(sourceStatus);
    const destKey = getColumnKey(destStatus);

    const sourceTasks = Array.from(boardData[sourceKey] as TaskItemDto[]);
    const destTasks =
      sourceKey === destKey ? sourceTasks : Array.from(boardData[destKey] as TaskItemDto[]);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    if (!movedTask) return;

    movedTask.trangThai = destStatus;
    destTasks.splice(destination.index, 0, movedTask);

    const maTaskTruoc = destination.index > 0 ? destTasks[destination.index - 1].maTask : null;
    const maTaskSau =
      destination.index < destTasks.length - 1 ? destTasks[destination.index + 1].maTask : null;

    setBoardData((prev) => {
      if (sourceKey === destKey) {
        return {
          ...prev,
          [sourceKey]: destTasks,
        };
      } else {
        return {
          ...prev,
          [sourceKey]: sourceTasks,
          [destKey]: destTasks,
        };
      }
    });

    try {
      const res: any = await congViecApi.move(maTask, {
        trangThaiMoi: destination.droppableId,
        maTaskTruoc,
        maTaskSau,
      });

      if (!res || !res.success) {
        message.error(res?.message || 'Di chuyển công việc thất bại.');
        fetchBoard(false);
      } else {
        fetchBoard(true);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi xảy ra khi di chuyển công việc.');
      fetchBoard(false);
    }
  };

  // Quick Add Task
  const handleQuickAdd = async (status: TaskStatus, tieuDe: string) => {
    try {
      const res: any = await congViecApi.create({
        tieuDe,
        maNV_PhuTrach: user?.maNV || 'NV001',
        doUuTien: 'Trung bình',
      });

      if (res && res.success && res.data) {
        const newTask = res.data;
        if (status !== 'Todo') {
          await congViecApi.move(newTask.maTask, {
            trangThaiMoi: status,
          });
        }
        message.success(`Đã thêm nhanh thẻ #${newTask.maTask}!`);
        fetchBoard(true);
      } else {
        message.error(res?.message || 'Thêm nhanh thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Lỗi khi tạo công việc nhanh.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (maTask: number) => {
    try {
      const res: any = await congViecApi.delete(maTask);
      if (res && res.success) {
        message.success(`Đã xóa công việc #${maTask}`);
        fetchBoard(true);
      } else {
        message.error(res?.message || 'Xóa công việc thất bại.');
      }
    } catch {
      message.error('Lỗi khi xóa công việc.');
    }
  };

  const handleOpenDetail = (task: TaskItemDto) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (task: TaskItemDto) => {
    setEditingTask(task);
    setFormModalOpen(true);
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* Top Header - Notion / Linear Minimalist Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          padding: '2px 0',
        }}
      >
        {/* Left Title */}
        <div>
          <Title
            level={4}
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 650,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            Kanban Board
          </Title>
        </div>

        {/* Right Action Buttons */}
        <Space size={10} wrap>
          <Tooltip title="Đồng bộ lại dữ liệu">
            <Button
              shape="round"
              icon={<ReloadOutlined />}
              onClick={() => fetchBoard(false)}
              loading={loading}
              style={{
                border: '1px solid #D1D5DB',
                color: '#374151',
                fontSize: 13,
                height: 34,
              }}
            >
              Làm mới
            </Button>
          </Tooltip>

          {isHrOrAdmin && (
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTask(null);
                setFormModalOpen(true);
              }}
              style={{
                backgroundColor: '#0F766E', // Teal đậm sang trọng
                borderColor: '#0F766E',
                fontWeight: 500,
                fontSize: 13,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                padding: '0 18px',
                height: 34,
              }}
            >
              + Giao việc mới
            </Button>
          )}
        </Space>
      </div>

      {/* Filter & Search Bar - Clean Pill Inputs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
          padding: '10px 14px',
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, flex: 1 }}>
          {/* Search Pill Input */}
          <Input
            placeholder="Tìm theo tiêu đề nhiệm vụ..."
            prefix={<SearchOutlined style={{ color: '#9CA3AF', marginRight: 4 }} />}
            style={{
              width: 260,
              borderRadius: 20,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              fontSize: 13,
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          {/* Assignee Filter */}
          <Select
            placeholder="Người phụ trách: Tất cả"
            style={{ width: 190 }}
            allowClear
            value={filterMaNV}
            onChange={setFilterMaNV}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={employees.map((emp) => ({
              value: emp.maNV,
              label: `${emp.hoTen}`,
            }))}
            dropdownStyle={{ borderRadius: 8 }}
          />

          {/* Priority Filter */}
          <Select
            placeholder="Mức độ: Tất cả"
            style={{ width: 140 }}
            allowClear
            value={filterDoUuTien}
            onChange={setFilterDoUuTien}
            options={[
              { value: 'Khẩn cấp', label: 'Khẩn cấp' },
              { value: 'Cao', label: 'Cao' },
              { value: 'Trung bình', label: 'Trung bình' },
              { value: 'Thấp', label: 'Thấp' },
            ]}
            dropdownStyle={{ borderRadius: 8 }}
          />
        </div>

        {/* 4 Phases Summary Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            Chờ làm: <strong style={{ color: '#7C3AED' }}>{boardData.todo.length}</strong>
          </span>
          <span style={{ color: '#E5E7EB' }}>|</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            Đang làm: <strong style={{ color: '#2563EB' }}>{boardData.inProgress.length}</strong>
          </span>
          <span style={{ color: '#E5E7EB' }}>|</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            Review: <strong style={{ color: '#EA580C' }}>{boardData.review.length}</strong>
          </span>
          <span style={{ color: '#E5E7EB' }}>|</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            Hoàn tất: <strong style={{ color: '#16A34A' }}>{boardData.done.length}</strong>
          </span>
        </div>
      </div>

      {/* 4 Columns Kanban Area - Không tràn ngang, Không cuộn lồng nhau */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 14,
            width: '100%',
            alignItems: 'start', // Các cột tự nhiên giãn theo thẻ, cuộn cả trang
          }}
        >
          <KanbanColumn
            status="Todo"
            title="To do"
            tasks={boardData.todo}
            totalTasks={boardData.totalTasks}
            onTaskClick={handleOpenDetail}
            onEditTask={isHrOrAdmin ? handleOpenEdit : undefined}
            onDeleteTask={isHrOrAdmin ? handleDeleteTask : undefined}
            onQuickAdd={isHrOrAdmin ? handleQuickAdd : undefined}
          />
          <KanbanColumn
            status="InProgress"
            title="In progress"
            tasks={boardData.inProgress}
            totalTasks={boardData.totalTasks}
            onTaskClick={handleOpenDetail}
            onEditTask={isHrOrAdmin ? handleOpenEdit : undefined}
            onDeleteTask={isHrOrAdmin ? handleDeleteTask : undefined}
            onQuickAdd={isHrOrAdmin ? handleQuickAdd : undefined}
          />
          <KanbanColumn
            status="Review"
            title="Review"
            tasks={boardData.review}
            totalTasks={boardData.totalTasks}
            onTaskClick={handleOpenDetail}
            onEditTask={isHrOrAdmin ? handleOpenEdit : undefined}
            onDeleteTask={isHrOrAdmin ? handleDeleteTask : undefined}
            onQuickAdd={isHrOrAdmin ? handleQuickAdd : undefined}
          />
          <KanbanColumn
            status="Done"
            title="Done"
            tasks={boardData.done}
            totalTasks={boardData.totalTasks}
            onTaskClick={handleOpenDetail}
            onEditTask={isHrOrAdmin ? handleOpenEdit : undefined}
            onDeleteTask={isHrOrAdmin ? handleDeleteTask : undefined}
            onQuickAdd={isHrOrAdmin ? handleQuickAdd : undefined}
          />
        </div>
      </DragDropContext>

      {/* Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleOpenEdit}
        onDeleted={() => fetchBoard(true)}
        onChanged={(updated) => { if (updated) setSelectedTask(updated); fetchBoard(true); }}
      />

      {/* Create / Edit Modal */}
      <TaskFormModal
        open={formModalOpen}
        editingTask={editingTask}
        onCancel={() => setFormModalOpen(false)}
        onSuccess={() => {
          setFormModalOpen(false);
          fetchBoard(true);
        }}
      />
    </div>
  );
};

export default KanbanBoardPage;