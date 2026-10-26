import React, { useState } from 'react';
import { Modal, Form, Select, DatePicker, Input, message } from 'antd';
import { CreateNghiPhepDto } from '@/types/nghiPhep';
import { nghiPhepApi } from '@/api/nghiPhepApi';

interface NghiPhepFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const NghiPhepFormModal: React.FC<NghiPhepFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dates = values.dates;

      const payload: CreateNghiPhepDto = {
        loaiPhep: values.loaiPhep,
        tuNgay: dates[0].format('YYYY-MM-DD'),
        denNgay: dates[1].format('YYYY-MM-DD'),
        lyDo: values.lyDo,
      };

      setLoading(true);
      const res = await nghiPhepApi.create(payload);
      if (res.success) {
        message.success('Gửi đơn nghỉ phép thành công! Đang chờ phê duyệt.');
        form.resetFields();
        onSuccess();
      } else {
        message.error(res.message || 'Không thể tạo đơn nghỉ phép.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi khi gửi đơn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span style={{ fontWeight: 700, fontSize: 16 }}>Làm Đơn Xin Nghỉ Phép</span>}
      okText="Gửi Đơn Nghỉ Phép"
      cancelText="Hủy bỏ"
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      okButtonProps={{
        style: { backgroundColor: '#0F766E', borderColor: '#0F766E', borderRadius: 8 },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ loaiPhep: 'Phép năm' }}
      >
        <Form.Item
          name="loaiPhep"
          label="Loại nghỉ phép"
          rules={[{ required: true, message: 'Chọn loại nghỉ phép!' }]}
        >
          <Select
            style={{ borderRadius: 8 }}
            dropdownStyle={{ borderRadius: 8 }}
            options={[
              { value: 'Phép năm', label: 'Nghỉ phép năm (hưởng lương)' },
              { value: 'Bệnh', label: 'Nghỉ ốm / bệnh (bảo hiểm xã hội)' },
              { value: 'Thai sản', label: 'Nghỉ chế độ thai sản' },
              { value: 'Không lương', label: 'Nghỉ việc riêng không lương' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="dates"
          label="Thời gian nghỉ (Từ ngày - Đến ngày)"
          rules={[{ required: true, message: 'Chọn khoảng thời gian nghỉ!' }]}
        >
          <RangePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="lyDo"
          label="Lý do xin nghỉ"
          rules={[{ required: true, message: 'Vui lòng ghi rõ lý do xin nghỉ!' }]}
        >
          <TextArea rows={3} placeholder="Mô tả lý do xin nghỉ phép..." style={{ borderRadius: 8 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NghiPhepFormModal;
