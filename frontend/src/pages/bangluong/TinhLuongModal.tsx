import React, { useState } from 'react';
import { Modal, Form, DatePicker, Alert, message } from 'antd';
import dayjs from 'dayjs';
import { bangLuongApi } from '@/api/bangLuongApi';

interface TinhLuongModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const TinhLuongModal: React.FC<TinhLuongModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const monthYear: dayjs.Dayjs = values.monthYear;
      setLoading(true);

      const res = await bangLuongApi.tinhLuong({
        thang: monthYear.month() + 1,
        nam: monthYear.year(),
      });

      if (res.success && res.data) {
        message.success(
          `Tính lương thành công cho ${res.data.soNhanVienTinhLuong} nhân viên trong tháng ${res.data.thang}/${res.data.nam}!`
        );
        onSuccess();
      } else {
        message.error(res.message || 'Tính lương thất bại.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi chạy tính lương.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Tính Lương Tự Động"
      okText="Tiến hành tính lương"
      cancelText="Hủy"
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={onCancel}
      destroyOnClose
    >
      <Alert
        message="Lưu ý quan trọng"
        description="Hệ thống sẽ tổng hợp số ngày công thực tế của nhân viên từ dữ liệu Chấm công trong tháng đã chọn và tính toán Lương thực lĩnh theo công thức chuẩn."
        type="info"
        showIcon
        style={{ marginBottom: 16, marginTop: 12 }}
      />

      <Form form={form} layout="vertical" initialValues={{ monthYear: dayjs() }}>
        <Form.Item
          name="monthYear"
          label="Kỳ tính lương (Tháng / Năm)"
          rules={[{ required: true, message: 'Vui lòng chọn tháng và năm!' }]}
        >
          <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} allowClear={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TinhLuongModal;
