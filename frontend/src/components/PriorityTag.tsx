import React from 'react';
import { Tag } from 'antd';

interface PriorityTagProps {
  priority: string;
}

export const PriorityTag: React.FC<PriorityTagProps> = ({ priority }) => {
  switch (priority) {
    case 'Khẩn cấp':
      return <Tag color="#f5222d">Khẩn cấp</Tag>;
    case 'Cao':
      return <Tag color="#fa8c16">Cao</Tag>;
    case 'Trung bình':
      return <Tag color="#1890ff">Trung bình</Tag>;
    case 'Thấp':
      return <Tag color="#8c8c8c">Thấp</Tag>;
    default:
      return <Tag>{priority}</Tag>;
  }
};

export default PriorityTag;
