import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { nhanVienApi } from '@/api/nhanVienApi';
import { taiKhoanApi } from '@/api/taiKhoanApi';
import { NhanVienDto } from '@/types/nhanVien';
import { TaiKhoanDto } from '@/types/taiKhoan';

interface EditAccountModalProps {
  account: TaiKhoanDto | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);

  useEffect(() => {
    if (open && account) {
      form.setFieldsValue({
        tenDangNhap: account.tenDangNhap,
        matKhauMoi: '', // Mặc định để trống, nếu nhập sẽ đổi mật khẩu mới
        vaiTro: account.vaiTro,
        maNV: account.maNV || undefined,
      });

      const fetchEmps = async () => {
        setLoadingEmp(true);
        try {
          const res: any = await nhanVienApi.getList({ pageSize: 100 });
          if (res && res.success && res.data) {
            setEmployees(res.data.items || []);
          }
        } catch {
          // ignore
        } finally {
          setLoadingEmp(false);
        }
      };
      fetchEmps();
    }
  }, [open, account, form]);

  const handleSubmit = async () => {
    if (!account) return;
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res: any = await taiKhoanApi.update(account.maTK, {
        tenDangNhap: values.tenDangNhap.trim().toLowerCase(),
        matKhauMoi: values.matKhauMoi ? values.matKhauMoi.trim() : undefined,
        vaiTro: values.vaiTro,
        maNV: values.maNV || null,
      });

      if (res && res.success) {
        message.success(res.message || 'Cập nhật tài khoản thành công!');
        onSuccess();
        onClose();
      } else {
        message.error(res?.message || 'Cập nhật tài khoản thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EditOutlined style={{ color: '#0F766E' }} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            Chỉnh Sửa Tài Khoản: {account?.tenDangNhap}
          </span>
        </div>
      }
      okText="Lưu Thay Đổi"
      cancelText="Hủy bỏ"
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={520}
      destroyOnClose
      okButtonProps={{
        style: { backgroundColor: '#0F766E', borderColor: '#0F766E', borderRadius: 8 },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
    >
      <div style={{ marginTop: 14 }}>
        <Alert
          message="Bạn có thể chỉnh sửa Tên đăng nhập và Mật khẩu tùy ý. Nếu không muốn đổi mật khẩu, hãy để trống ô Mật khẩu mới."
          type="info"
          showIcon
          style={{ marginBottom: 18, borderRadius: 8, fontSize: 12.5 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="tenDangNhap"
            label="Tên đăng nhập (Username - Tùy ý)"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tối thiểu 3 ký tự' },
              {
                pattern: /^[a-zA-Z0-9_.-]+$/,
                message: 'Chỉ chứa chữ cái, số, dấu gạch dưới hoặc gạch ngang',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Nhập tên đăng nhập mới..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="matKhauMoi"
            label="Mật khẩu mới (Tùy ý)"
            extra="Để trống nếu muốn giữ nguyên mật khẩu hiện tại"
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Nhập mật khẩu mới tùy ý nếu muốn đổi..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="vaiTro"
            label="Vai trò & Quyền hạn (Role)"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              style={{ borderRadius: 8 }}
              options={[
                { value: 'NhanVien', label: 'Nhân viên (Xem Kanban, Chấm công, Xin nghỉ, Bảng lương)' },
                { value: 'HR', label: 'Quản lý Nhân sự - HR (Duyệt nghỉ phép, Quản lý task, Nhân viên)' },
                { value: 'Admin', label: 'Quản trị viên - Admin (Toàn quyền hệ thống & Quản lý tài khoản)' },
              ]}
              dropdownStyle={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="maNV"
            label="Nhân viên liên kết (Tùy chọn)"
            extra="Có thể chọn nhân viên nội bộ hoặc để trống nếu là tài khoản độc lập"
          >
            <Select
              placeholder="Chọn nhân viên công ty (hoặc để trống)..."
              loading={loadingEmp}
              showSearch
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map((emp) => ({
                value: emp.maNV,
                label: `${emp.hoTen} (${emp.maNV}) - ${emp.tenPB || 'Chưa xếp phòng'}`,
              }))}
              dropdownStyle={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
