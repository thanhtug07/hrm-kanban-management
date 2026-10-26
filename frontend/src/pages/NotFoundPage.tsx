import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Result
        status="404"
        title="404 - Trang không tồn tại"
        subTitle="Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được chuyển dời."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Về Trang Chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
