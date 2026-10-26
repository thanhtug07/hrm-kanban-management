import React, { useState } from 'react';
import { Card, Row, Col, Descriptions, Form, Input, Button, Tag, message, Avatar, Divider, Typography } from 'antd';
import { KeyOutlined, UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import { getInitials, getAvatarStyle } from '@/utils/avatar';
import PageHeader from '@/components/PageHeader';

const { Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const avatarStyle = getAvatarStyle(user?.hoTen);

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
        return <Tag color="red" style={{ borderRadius: 8, fontWeight: 600 }}>Quản trị viên</Tag>;
      case 'HR':
        return <Tag color="blue" style={{ borderRadius: 8, fontWeight: 600 }}>Nhân sự (HR)</Tag>;
      case 'NhanVien':
        return <Tag color="green" style={{ borderRadius: 8, fontWeight: 600 }}>Nhân viên</Tag>;
      default:
        return <Tag style={{ borderRadius: 8 }}>{role}</Tag>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Trang Cá Nhân"
        subtitle="Thông tin tài khoản và bảo mật mật khẩu"
        icon={<UserOutlined />}
      />

      <Row gutter={[16, 16]}>
        {/* Thẻ hồ sơ */}
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 16, height: '100%', border: '1px solid #F1F5F9' }}>
            {/* Banner + avatar */}
            <div
              style={{
                height: 84,
                borderRadius: 12,
                background: 'linear-gradient(135deg,#0F766E 0%,#14B8A6 55%,#5EEAD4 100%)',
                marginBottom: 44,
                position: 'relative',
              }}
            >
              <Avatar
                size={72}
                style={{
                  position: 'absolute',
                  left: 24,
                  bottom: -36,
                  backgroundColor: avatarStyle.bg,
                  color: avatarStyle.text,
                  border: '4px solid #fff',
                  fontWeight: 800,
                  fontSize: 26,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                {getInitials(user?.hoTen)}
              </Avatar>
            </div>

            <div style={{ padding: '0 4px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 750, color: '#0F172A' }}>
                  {user?.hoTen || user?.tenDangNhap}
                </h2>
                {getRoleTag(user?.vaiTro)}
              </div>
              <Text style={{ color: '#64748B', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MailOutlined /> {user?.email || 'chưa cập nhật email'}
              </Text>

              <Divider style={{ margin: '16px 0' }} />

              <Descriptions column={1} size="middle">
                <Descriptions.Item label={<span><IdcardOutlined /> Mã nhân viên</span>}>
                  <strong>{user?.maNV || '—'}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Tên đăng nhập">{user?.tenDangNhap}</Descriptions.Item>
                <Descriptions.Item label="Phòng ban">{user?.tenPB || '—'}</Descriptions.Item>
                <Descriptions.Item label="Chức vụ">{user?.tenCV || '—'}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{user?.sdt || '—'}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">—</Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>

        {/* Đổi mật khẩu */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <KeyOutlined style={{ color: '#0F766E' }} /> Đổi Mật Khẩu
              </span>
            }
            style={{ borderRadius: 16, height: '100%', border: '1px solid #F1F5F9' }}
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

              <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" icon={<KeyOutlined />} loading={loading} block size="large">
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
