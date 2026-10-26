import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { NhanVienDto, CreateNhanVienDto, UpdateNhanVienDto } from '@/types/nhanVien';
import { nhanVienApi } from '@/api/nhanVienApi';

interface NhanVienFormModalProps {
  open: boolean;
  editingItem: NhanVienDto | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const PHONG_BAN_OPTIONS = [
  { value: 'PB001', label: 'PB001 - Phòng Công nghệ Thông tin' },
  { value: 'PB002', label: 'PB002 - Phòng Nhân sự' },
  { value: 'PB003', label: 'PB003 - Phòng Kế toán - Tài chính' },
  { value: 'PB004', label: 'PB004 - Phòng Kinh doanh' },
  { value: 'PB005', label: 'PB005 - Phòng Marketing' },
];

export const CHUC_VU_OPTIONS = [
  { value: 'CV001', label: 'CV001 - Giám đốc điều hành' },
  { value: 'CV002', label: 'CV002 - Trưởng phòng' },
  { value: 'CV003', label: 'CV003 - Phó phòng' },
  { value: 'CV004', label: 'CV004 - Nhân viên' },
  { value: 'CV005', label: 'CV005 - Thực tập sinh' },
];

export const TRANG_THAI_OPTIONS = [
  { value: 'Đang làm', label: 'Đang làm' },
  { value: 'Tạm nghỉ', label: 'Tạm nghỉ' },
  { value: 'Nghỉ việc', label: 'Nghỉ việc' },
];

export const NhanVienFormModal: React.FC<NhanVienFormModalProps> = ({
  open,
  editingItem,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!editingItem;

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          ...editingItem,
          ngaySinh: editingItem.ngaySinh ? dayjs(editingItem.ngaySinh) : null,
          ngayVaoLam: editingItem.ngayVaoLam ? dayjs(editingItem.ngayVaoLam) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          gioiTinh: 'Nam',
          trangThai: 'Đang làm',
          ngayVaoLam: dayjs(),
        });
      }
    }
  }, [open, editingItem, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        ngaySinh: values.ngaySinh ? values.ngaySinh.format('YYYY-MM-DD') : '',
        ngayVaoLam: values.ngayVaoLam ? values.ngayVaoLam.format('YYYY-MM-DD') : '',
      };

      if (isEditing && editingItem) {
        const updateData: UpdateNhanVienDto = {
          ...payload,
          trangThai: values.trangThai || 'Đang làm',
        };
        const res: any = await nhanVienApi.update(editingItem.maNV, updateData);
        if (res.success) {
          message.success('Cập nhật thông tin nhân viên thành công!');
          onSuccess();
        } else {
          message.error(res.message || 'Cập nhật thất bại.');
        }
      } else {
        const createData: CreateNhanVienDto = payload;
        const res: any = await nhanVienApi.create(createData);
        if (res.success) {
          message.success('Thêm mới nhân viên thành công!');
          onSuccess();
        } else {
          message.error(res.message || 'Thêm mới thất bại.');
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? `Chỉnh sửa nhân viên: ${editingItem?.maNV}` : 'Thêm mới nhân viên'}
      okText={isEditing ? 'Lưu thay đổi' : 'Thêm nhân viên'}
      cancelText="Hủy bỏ"
      onOk={handleSubmit}
      onCancel={onCancel}
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn An" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gioiTinh"
              label="Giới tính"
              rules={[{ required: true, message: 'Chọn giới tính!' }]}
            >
              <Select
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' },
                  { value: 'Khác', label: 'Khác' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ngaySinh"
              label="Ngày sinh"
              rules={[{ required: true, message: 'Chọn ngày sinh!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cccd"
              label="Số CCCD / CMND"
              rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}
            >
              <Input placeholder="CCCD 12 chữ số" maxLength={12} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sdt"
              label="Số điện thoại"
              rules={[{ pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ!' }]}
            >
              <Input placeholder="0901234567" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Email không đúng định dạng!' }]}
            >
              <Input placeholder="email@company.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="diaChi" label="Địa chỉ">
          <Input placeholder="Địa chỉ thường trú" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maPB"
              label="Phòng ban"
              rules={[{ required: true, message: 'Chọn phòng ban!' }]}
            >
              <Select placeholder="Chọn phòng ban" options={PHONG_BAN_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maCV"
              label="Chức vụ"
              rules={[{ required: true, message: 'Chọn chức vụ!' }]}
            >
              <Select placeholder="Chọn chức vụ" options={CHUC_VU_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ngayVaoLam"
              label="Ngày vào làm"
              rules={[{ required: true, message: 'Chọn ngày vào làm!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          {isEditing && (
            <Col span={12}>
              <Form.Item
                name="trangThai"
                label="Trạng thái làm việc"
                rules={[{ required: true, message: 'Chọn trạng thái!' }]}
              >
                <Select options={TRANG_THAI_OPTIONS} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default NhanVienFormModal;
