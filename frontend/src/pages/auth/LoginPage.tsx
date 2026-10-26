import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Tag, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { LoginRequest } from '@/types/auth';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginRequest>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: LoginRequest) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.login(values);
      if (res && res.token && res.userProfile) {
        setAuth(res.token, res.userProfile);
        message.success(`Đăng nhập thành công! Chào mừng ${res.userProfile.hoTen}`);
        navigate(from, { replace: true });
      } else {
        setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        errorObj.response?.data?.message || errorObj.message || 'Không thể kết nối đến máy chủ backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (tenDangNhap: string, matKhau: string) => {
    form.setFieldsValue({ tenDangNhap, matKhau });
    setErrorMessage(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
            HỆ THỐNG QUẢN LÝ NHÂN SỰ
          </Title>
          <Text type="secondary">Đăng nhập cổng thông tin nội bộ & Kanban</Text>
        </div>

        {errorMessage && (
          <Alert
            message="Đăng nhập không thành công"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ tenDangNhap: '', matKhau: '' }}
        >
          <Form.Item
            name="tenDangNhap"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ví dụ: admin, hr, nv001"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="matKhau"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<LoginOutlined />}
              loading={loading}
              block
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
            Tài khoản mẫu thử nghiệm (Click để điền nhanh):
          </Text>
          <Space direction="vertical" style={{ width: '100%' }} size={6}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                background: '#fafafa',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={() => handleQuickFill('admin', 'Admin@123')}
            >
              <Space>
                <Tag color="red">Admin</Tag>
                <Text code>admin</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Admin@123</Text>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                background: '#fafafa',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={() => handleQuickFill('hr', 'Hr@123')}
            >
              <Space>
                <Tag color="blue">HR</Tag>
                <Text code>hr</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Hr@123</Text>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                background: '#fafafa',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={() => handleQuickFill('nv001', 'Nv@123')}
            >
              <Space>
                <Tag color="green">Nhân viên</Tag>
                <Text code>nv001</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>Nv@123</Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
