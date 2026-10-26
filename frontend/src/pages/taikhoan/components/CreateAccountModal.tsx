import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { nhanVienApi } from '@/api/nhanVienApi';
import { taiKhoanApi } from '@/api/taiKhoanApi';
import { NhanVienDto } from '@/types/nhanVien';
import { TaiKhoanDto } from '@/types/taiKhoan';

interface CreateAccountModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  existingAccounts: TaiKhoanDto[];
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  open,
  onCancel,
  onSuccess,
  existingAccounts,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);

  // Tập hợp các MaNV đã có tài khoản
  const existingMaNVs = new Set(
    existingAccounts.map((a) => a.maNV).filter((id): id is string => Boolean(id))
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        matKhau: 'Hrm@123456',
        vaiTro: 'NhanVien',
        maNV: undefined,
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
  }, [open, form]);

  // Danh sách nhân viên chưa có tài khoản
  const availableEmployees = employees.filter((emp) => !existingMaNVs.has(emp.maNV));

  const handleSelectEmployee = (maNV?: string) => {
    if (!maNV) return;
    const selected = employees.find((e) => e.maNV === maNV);
    if (selected) {
      let suggestedUsername = selected.maNV.toLowerCase();
      if (selected.email && selected.email.includes('@')) {
        suggestedUsername = selected.email.split('@')[0].toLowerCase();
      }
      form.setFieldsValue({ tenDangNhap: suggestedUsername });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const res: any = await taiKhoanApi.create({
        maNV: values.maNV || null, // Tùy ý: có thể chọn hoặc không cần có trong DS công ty
        tenDangNhap: values.tenDangNhap.trim().toLowerCase(),
        matKhau: values.matKhau.trim(),
        vaiTro: values.vaiTro,
      });

      if (res && res.success) {
        message.success(res.message || 'Cấp tài khoản mới thành công!');
        onSuccess();
      } else {
        message.error(res?.message || 'Cấp tài khoản thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Vui lòng kiểm tra lại thông tin nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span style={{ fontWeight: 700, fontSize: 16 }}>Cấp Tài Khoản Mới</span>}
      okText="Cấp Tài Khoản"
      cancelText="Hủy bỏ"
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      width={520}
      destroyOnClose
      okButtonProps={{
        style: { backgroundColor: '#4F46E5', borderColor: '#4F46E5', borderRadius: 8 },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
    >
      <div style={{ marginTop: 14 }}>
        <Alert
          message="Nhân viên được cấp là tùy ý: Bạn có thể chọn liên kết nhân viên nội bộ hoặc để trống để tạo tài khoản ngoài công ty."
          type="info"
          showIcon
          style={{ marginBottom: 18, borderRadius: 8, fontSize: 12.5 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="maNV"
            label="Nhân viên được cấp (Tùy chọn)"
            extra="Không bắt buộc — Có thể để trống nếu cấp tài khoản cho chuyên gia/đối tác ngoài danh sách công ty."
          >
            <Select
              placeholder="Chọn nhân viên công ty (hoặc để trống)..."
              loading={loadingEmp}
              showSearch
              allowClear
              onChange={handleSelectEmployee}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableEmployees.map((emp) => ({
                value: emp.maNV,
                label: `${emp.hoTen} (${emp.maNV}) - ${emp.tenPB || 'Chưa xếp phòng'}`,
              }))}
              dropdownStyle={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="tenDangNhap"
            label="Tên đăng nhập (Username)"
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
              placeholder="Nhập tên đăng nhập tùy ý (vd: nguyenvana, partner01)..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="matKhau"
            label="Mật khẩu khởi tạo (Tùy ý)"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu khởi tạo!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
              placeholder="Nhập mật khẩu tùy ý (mặc định: Hrm@123456)"
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
        </Form>
      </div>
    </Modal>
  );
};

export default CreateAccountModal;
