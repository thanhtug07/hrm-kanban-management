import React, { useState } from 'react';
import { Button, Typography, Space, Select, message } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

interface DashboardHeaderProps {
  taskQuaHan: number;
  donNghiPhepChoDuyet: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  taskQuaHan,
  donNghiPhepChoDuyet,
}) => {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [exporting, setExporting] = useState(false);

  // Tính lời chào theo buổi
  const currentHour = new Date().getHours();
  let greetingTime = 'Chào buổi sáng';
  if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'Chào buổi chiều';
  } else if (currentHour >= 18 || currentHour < 5) {
    greetingTime = 'Chào buổi tối';
  }

  const roleName = user?.vaiTro === 'Admin' ? 'Quản trị viên' : 'Quản lý Nhân sự';
  const displayName = user?.hoTen || roleName;

  // Định dạng ngày hôm nay bằng tiếng Việt
  dayjs.locale('vi');
  const todayStr = dayjs().format('dddd, [ngày] DD/MM/YYYY');
  // Chuyển chữ cái đầu thành in hoa
  const capitalizedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      message.success('Đã xuất báo cáo tổng quan HRM (PDF/Excel) thành công!');
    }, 1000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {/* Bên trái: Lời chào cá nhân hóa */}
      <div>
        <Title
          level={3}
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.02em',
          }}
        >
          {greetingTime}, {displayName} 👋
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: 13.5,
            color: '#64748B',
            marginTop: 4,
            display: 'block',
          }}
        >
          Hôm nay là {capitalizedDate}. Bạn có{' '}
          <strong style={{ color: donNghiPhepChoDuyet > 0 ? '#EA580C' : '#0F172A' }}>
            {donNghiPhepChoDuyet} đơn chờ duyệt
          </strong>{' '}
          và{' '}
          <strong style={{ color: taskQuaHan > 0 ? '#DC2626' : '#0F172A' }}>
            {taskQuaHan} task quá hạn
          </strong>
          .
        </Text>
      </div>

      {/* Bên phải: Nút Primary & Range Picker dạng pill */}
      <Space size={10} wrap>
        <Select
          value={period}
          onChange={setPeriod}
          style={{ width: 130 }}
          options={[
            { value: 'week', label: 'Tuần này' },
            { value: 'month', label: 'Tháng này' },
            { value: 'quarter', label: 'Quý này' },
          ]}
          dropdownStyle={{ borderRadius: 10 }}
        />

        <Button
          type="primary"
          icon={<DownloadOutlined />}
          shape="round"
          loading={exporting}
          onClick={handleExportReport}
          style={{
            backgroundColor: '#0F766E', // Teal Enterprise Accent
            borderColor: '#0F766E',
            fontWeight: 500,
            fontSize: 13,
            height: 34,
            padding: '0 18px',
            boxShadow: '0 2px 4px rgba(15, 118, 110, 0.15)',
          }}
        >
          Tạo báo cáo nhanh
        </Button>
      </Space>
    </div>
  );
};

export default DashboardHeader;
