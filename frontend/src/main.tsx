import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

import router from '@/router';
import '@/styles/global.css';
import '@/styles/sider-premium.css';

// Kích hoạt relativeTime và locale tiếng Việt cho dayjs toàn cục
dayjs.extend(relativeTime);
dayjs.locale('vi');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#4F46E5', // Indigo SaaS
          colorSuccess: '#10B981', // Emerald
          colorWarning: '#F59E0B', // Amber
          colorError: '#EF4444',   // Muted Rose Red
          colorInfo: '#3B82F6',    // Sky Blue
          colorBgLayout: '#F8FAFC',
          colorBgContainer: '#FFFFFF',
          colorText: '#1E293B',
          colorTextSecondary: '#64748B',
          colorBorder: '#E2E8F0',
          borderRadius: 10,
          fontFamily:
            "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        },
        components: {
          Card: {
            headerFontSize: 15,
            paddingLG: 20,
          },
          Table: {
            headerBg: '#F8FAFC',
            headerColor: '#475569',
            cellPaddingBlock: 12,
            cellPaddingInline: 14,
          },
          Button: {
            controlHeight: 38,
            borderRadius: 8,
            fontWeight: 600,
          },
          Input: {
            controlHeight: 38,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 38,
            borderRadius: 8,
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>
);
