import React from 'react';
import { Typography, Space } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * Header trang dùng chung — đồng bộ design language với AdminDashboard.
 * Tiêu đề đậm + phụ đề + vùng action bên phải.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, extra }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <Title
            level={3}
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text style={{ fontSize: 13.5, color: '#64748B', display: 'block', marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </div>
      </div>

      {extra && (
        <Space size={10} wrap>
          {extra}
        </Space>
      )}
    </div>
  );
};

export default PageHeader;
