import React from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  switch (status) {
    case 'Todo':
      return <Tag color="purple">Chờ thực hiện</Tag>;
    case 'InProgress':
      return <Tag color="blue">Đang thực hiện</Tag>;
    case 'Review':
      return <Tag color="orange">Đang duyệt / Test</Tag>;
    case 'Done':
      return <Tag color="green">Đã hoàn thành</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

export default StatusTag;
