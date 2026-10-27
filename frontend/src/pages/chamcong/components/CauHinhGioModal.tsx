import React, { useEffect, useState } from 'react';
import { Modal, Form, TimePicker, InputNumber, Switch, Button, message, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { chamCongApi } from '@/api/chamCongApi';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CauHinhGioModal: React.FC<Props> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      chamCongApi
        .getCauHinh()
        .then((res: any) => {
          if (res?.success && res.data) {
            const c = res.data;
            form.setFieldsValue({
              gioBatDau: c.gioBatDau ? dayjs(c.gioBatDau, 'HH:mm:ss') : dayjs('08:00', 'HH:mm'),
              gioKetThuc: c.gioKetThuc ? dayjs(c.gioKetThuc, 'HH:mm:ss') : dayjs('17:30', 'HH:mm'),
              phutChoPhepSom: c.phutChoPhepSom,
              phutChoPhepTre: c.phutChoPhepTre,
              batBuocCheckOutSauKetThuc: c.batBuocCheckOutSauKetThuc,
            });
          }
        })
        .catch(() => message.error('Không tải được cấu hình giờ.'))
        .finally(() => setLoading(false));
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);
      const res: any = await chamCongApi.updateCauHinh({
        gioBatDau: v.gioBatDau.format('HH:mm:ss'),
        gioKetThuc: v.gioKetThuc.format('HH:mm:ss'),
        phutChoPhepSom: v.phutChoPhepSom,
        phutChoPhepTre: v.phutChoPhepTre,
        batBuocCheckOutSauKetThuc: v.batBuocCheckOutSauKetThuc,
      });
      if (res?.success) {
        message.success('Cập nhật cấu hình giờ chấm công thành công.');
        onClose();
      } else {
        message.error(res?.message || 'Cập nhật thất bại.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(e.response?.data?.message || 'Có lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span><SettingOutlined /> Cấu hình khung giờ chấm công</span>}
      onCancel={onClose}
      okText="Lưu cấu hình"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={handleOk}
      width={520}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Quy định giờ check-in/check-out cho toàn công ty. Nhân viên chỉ chấm công được trong khung giờ này.
      </Text>
      <Form form={form} layout="vertical" disabled={loading}>
        <Form.Item name="gioBatDau" label="Giờ bắt đầu ca" rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}>
          <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} />
        </Form.Item>
        <Form.Item name="gioKetThuc" label="Giờ kết thúc ca" rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}>
          <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={5} />
        </Form.Item>
        <Form.Item
          name="phutChoPhepSom"
          label="Cho phép check-in sớm (phút)"
          rules={[{ required: true }]}
          extra="Ví dụ 15: từ 07:45 có thể check-in khi ca 08:00"
        >
          <InputNumber min={0} max={120} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="phutChoPhepTre"
          label="Cho phép check-in trễ (phút)"
          rules={[{ required: true }]}
          extra="0 = phải check-in trước giờ kết thúc ca"
        >
          <InputNumber min={0} max={120} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="batBuocCheckOutSauKetThuc"
          label="Bắt buộc check-out sau giờ kết thúc ca"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CauHinhGioModal;