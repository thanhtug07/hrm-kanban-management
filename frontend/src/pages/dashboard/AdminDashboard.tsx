import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { dashboardApi } from '@/api/dashboardApi';
import { congViecApi } from '@/api/congViecApi';
import { DashboardDto } from '@/types/dashboard';
import { TaskItemDto } from '@/types/congViec';

import DashboardHeader from './components/DashboardHeader';
import KpiCards from './components/KpiCards';
import TaskTrendChart from './components/TaskTrendChart';
import DepartmentDonut from './components/DepartmentDonut';
import ActivityFeed from './components/ActivityFeed';
import TopEmployees from './components/TopEmployees';
import UrgentTasksTable from './components/UrgentTasksTable';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [tasks, setTasks] = useState<TaskItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, boardRes]: [any, any] = await Promise.all([
          dashboardApi.getSummary(),
          congViecApi.getBoard(),
        ]);

        if (dashRes && dashRes.success && dashRes.data) {
          setData(dashRes.data);
        } else {
          message.error(dashRes?.message || 'Không thể tải số liệu Dashboard.');
        }

        if (boardRes && boardRes.success && boardRes.data) {
          const allTasks: TaskItemDto[] = [
            ...(boardRes.data.todo || []),
            ...(boardRes.data.inProgress || []),
            ...(boardRes.data.review || []),
            ...(boardRes.data.done || []),
          ];
          setTasks(allTasks);
        }
      } catch {
        message.error('Không thể kết nối đến máy chủ Dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalEmployees = data?.tongNhanVien || 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 24 }}>
      {/* 1. Header Chào Mừng & Hành Động Nhanh */}
      <DashboardHeader
        taskQuaHan={data?.taskQuaHan || 0}
        donNghiPhepChoDuyet={data?.donNghiPhepChoDuyet || 0}
      />

      {/* 2. Khối KPI Cards (Top Metrics - Hàng 1) */}
      <KpiCards data={data} loading={loading} />

      {/* 3. Bố Cục Bento Grid (Hàng 2 & 3: Cột Trái 60% & Cột Phải 40%) */}      {/* 3. Xu Hướng Công Việc (toàn chiều rộng) */}
      <TaskTrendChart />

      {/* 4. Hàng cân bằng: Phân bổ phòng ban + Top nhân sự */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
          marginBottom: 20,
        }}
        className="dash-balanced-row"
      >
        <DepartmentDonut
          data={data?.nhanSuTheoPhongBan || []}
          totalEmployees={totalEmployees}
        />
        <TopEmployees data={data?.topNhanVienNhieuTask || []} />
      </div>

      {/* 5. Hoạt động gần đây (toàn chiều rộng) */}
      <div style={{ marginBottom: 20 }}>
        <ActivityFeed tasks={tasks} />
      </div>
      {/* 4. Hàng 4: Bảng Cảnh Báo Công Việc Sắp Đến Hạn & Quá Hạn */}
      <UrgentTasksTable tasks={tasks} loading={loading} />
    </div>
  );
};

export default AdminDashboard;
