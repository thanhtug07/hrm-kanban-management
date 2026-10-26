import React from 'react';
import { Card, Table, Typography, Button, Tag, Space } from 'antd';
import { ArrowRightOutlined, AlertOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { TaskItemDto } from '@/types/congViec';
import StatusTag from '@/components/StatusTag';
import PriorityTag from '@/components/PriorityTag';

const { Text } = Typography;

interface UrgentTasksTableProps {
  tasks: TaskItemDto[];
  loading: boolean;
}

export const UrgentTasksTable: React.FC<UrgentTasksTableProps> = ({ tasks, loading }) => {
  const navigate = useNavigate();
  const today = dayjs().startOf('day');

  // Lọc các task chưa hoàn thành và (đã quá hạn HOẶC sắp đến hạn trong vòng 5 ngày)
  const urgentList = tasks.filter((t) => {
    if (t.trangThai === 'Done') return false;
    if (t.laQuaHan) return true;
    if (t.deadline) {
      const d = dayjs(t.deadline);
      const diffDays = d.diff(today, 'day');
      return diffDays <= 5; // Trong vòng 5 ngày tới hoặc đã quá hạn
    }
    return false;
  });

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'maTask',
      key: 'maTask',
      width: 70,
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: '#64748B', fontSize: 12 }}>#{val}</span>
      ),
    },
    {
      title: 'Tiêu đề công việc',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
      render: (text: string, record: TaskItemDto) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{text}</div>
          {record.moTa && (
            <div
              style={{
                fontSize: 11.5,
                color: '#94A3B8',
                maxWidth: 360,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.moTa}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'tenNV_PhuTrach',
      key: 'tenNV_PhuTrach',
      width: 170,
      render: (text: string, record: TaskItemDto) => (
        <div>
          <span style={{ fontWeight: 500, fontSize: 12.5, color: '#1E293B' }}>{text}</span>
          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>
            ({record.maNV_PhuTrach})
          </span>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'doUuTien',
      key: 'doUuTien',
      width: 110,
      render: (val: string) => <PriorityTag priority={val} />,
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 140,
      render: (val?: string, record?: TaskItemDto) => {
        if (!val) return <span style={{ color: '#94A3B8' }}>Không có</span>;
        const d = dayjs(val);
        const isOverdue = record?.laQuaHan || d.isBefore(today);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 650,
              backgroundColor: isOverdue ? '#FEE2E2' : '#FEF3C7',
              color: isOverdue ? '#DC2626' : '#B45309',
            }}
          >
            {isOverdue ? <AlertOutlined /> : <ClockCircleOutlined />}
            {d.format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (val: string) => <StatusTag status={val} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: () => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/kanban')}
          style={{ padding: 0, fontWeight: 500, fontSize: 12.5, color: '#0F766E' }}
        >
          Xem trên Kanban <ArrowRightOutlined style={{ fontSize: 10 }} />
        </Button>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 16,
        background: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        marginTop: 20,
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
            Công Việc Sắp Đến Hạn & Quá Hạn (Urgent Tasks)
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Danh sách nhiệm vụ cần ưu tiên đôn đốc tiến độ để tránh trễ hạn dự án
          </Text>
        </div>

        <Button
          type="default"
          shape="round"
          size="small"
          onClick={() => navigate('/kanban')}
          style={{
            borderColor: '#E2E8F0',
            fontSize: 12.5,
            color: '#334155',
          }}
        >
          Mở bảng Kanban
        </Button>
      </div>

      <Table
        dataSource={urgentList}
        columns={columns}
        rowKey="maTask"
        loading={loading}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        size="middle"
        scroll={{ x: 820 }}
      />
    </Card>
  );
};

export default UrgentTasksTable;
