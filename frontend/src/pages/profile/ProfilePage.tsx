import React, { useState } from 'react';
import { Card, Row, Col, Descriptions, Form, Input, Button, Typography, Tag, message } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';

const { Title } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields();
      if (values.matKhauMoi !== values.xacNhanMatKhau) {
        message.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      setLoading(true);
      const res = await authApi.changePassword({
        matKhauCu: values.matKhauCu,
        matKhauMoi: values.matKhauMoi,
      });

      if (res && res.success) {
        message.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
        form.resetFields();
      } else {
        message.error(res?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role?: string) => {
    switch (role) {
      case 'Admin':
        return <Tag color="red">Quản trị viên (Admin)</Tag>;
      case 'HR':
        return <Tag color="blue">Nhân sự (HR)</Tag>;
      case 'NhanVien':
        return <Tag color="green">Nhân viên</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Thông Tin Hồ Sơ & Đổi Mật Khẩu
      </Title>

      <Row gutter={[16, 16]}>
        {/* User Info Card */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Thông Tin Tài Khoản
              </span>
            }
            style={{ borderRadius: 8, height: '100%' }}
          >
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Mã nhân viên">
                <strong>{user?.maNV || 'Không áp dụng'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                <strong>{user?.hoTen}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">{user?.tenDangNhap}</Descriptions.Item>
              <Descriptions.Item label="Vai trò hệ thống">
                {getRoleTag(user?.vaiTro)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng ban">{user?.tenPB || '---'}</Descriptions.Item>
              <Descriptions.Item label="Chức vụ">{user?.tenCV || '---'}</Descriptions.Item>
              <Descriptions.Item label="Email liên hệ">{user?.email || '---'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{user?.sdt || '---'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Change Password Card */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <KeyOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                Đổi Mật Khẩu
              </span>
            }
            style={{ borderRadius: 8, height: '100%' }}
          >
            <Form form={form} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                name="matKhauCu"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu cũ..." />
              </Form.Item>

              <Form.Item
                name="matKhauMoi"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới..." />
              </Form.Item>

              <Form.Item
                name="xacNhanMatKhau"
                label="Xác nhận mật khẩu mới"
                rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới..." />
              </Form.Item>

              <Form.Item style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<KeyOutlined />}
                  loading={loading}
                  block
                >
                  Cập Nhật Mật Khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
