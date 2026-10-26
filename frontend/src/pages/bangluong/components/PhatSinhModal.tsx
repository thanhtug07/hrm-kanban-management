import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Input, message, Row, Col, Typography, Divider } from 'antd';
import { DollarOutlined, UserOutlined, TagOutlined, FileTextOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { nhanVienApi } from '@/api/nhanVienApi';
import { bangLuongApi } from '@/api/bangLuongApi';
import { NhanVienDto } from '@/types/nhanVien';
import { CreateChiPhiPhatSinhDto } from '@/types/bangLuong';

const { Text } = Typography;

interface PhatSinhModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedMonth: Dayjs;
}

export const PhatSinhModal: React.FC<PhatSinhModalProps> = ({
  open,
  onCancel,
  onSuccess,
  selectedMonth,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingEmployees(true);
      nhanVienApi
        .getList({ pageSize: 100 })
        .then((res: any) => {
          if (res && res.success && res.data) {
            setEmployees(res.data.items || []);
          }
        })
        .finally(() => setLoadingEmployees(false));
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: CreateChiPhiPhatSinhDto = {
        maNV: values.maNV,
        loai: values.loai,
        soTien: Number(values.soTien),
        lyDo: values.lyDo,
        thang: selectedMonth.month() + 1,
        nam: selectedMonth.year(),
      };

      const res: any = await bangLuongApi.createPhatSinh(payload);
      if (res && res.success) {
        message.success(`Đã thêm khoản ${values.loai.toLowerCase()} thành công!`);
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(res?.message || 'Không thể lưu chi phí phát sinh.');
      }
    } catch {
      // Validate error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F766E',
            }}
          >
            <DollarOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              Thêm Chi Phí Phát Sinh / Thưởng Phạt
            </div>
            <div style={{ fontSize: 12, fontWeight: 400, color: '#64748B' }}>
              Kỳ lương áp dụng: Tháng {selectedMonth.format('MM/YYYY')}
            </div>
          </div>
        </div>
      }
      okText="Lưu phát sinh"
      cancelText="Hủy"
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      destroyOnClose
      width={520}
      okButtonProps={{
        style: {
          backgroundColor: '#0F766E',
          borderRadius: 8,
          height: 38,
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: { borderRadius: 8, height: 38 },
      }}
    >
      <Divider style={{ margin: '14px 0 18px' }} />

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="maNV"
          label={<span style={{ fontWeight: 600 }}>Nhân viên áp dụng</span>}
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm và chọn nhân viên áp dụng..."
            loading={loadingEmployees}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            options={employees.map((emp) => ({
              value: emp.maNV,
              label: `${emp.hoTen} (${emp.maNV}) - ${emp.tenPB || 'PB'}`,
            }))}
            style={{ borderRadius: 8, height: 40 }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="loai"
              label={<span style={{ fontWeight: 600 }}>Phân loại</span>}
              rules={[{ required: true, message: 'Chọn phân loại!' }]}
              initialValue="Thưởng"
            >
              <Select
                options={[
                  { value: 'Thưởng', label: '🎁 Thưởng thành tích / Dự án' },
                  { value: 'Công tác phí', label: '🚗 Hỗ trợ công tác phí / Xăng xe' },
                  { value: 'Phạt', label: '⚠️ Phạt vi phạm / Đi trễ' },
                  { value: 'Ứng lương', label: '💸 Tạm ứng lương' },
                ]}
                style={{ borderRadius: 8, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="soTien"
              label={<span style={{ fontWeight: 600 }}>Số tiền (VNĐ)</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền!' },
                {
                  type: 'number',
                  min: 1000,
                  message: 'Số tiền tối thiểu là 1.000 đ',
                },
              ]}
              initialValue={500000}
            >
              <InputNumber
                style={{ width: '100%', borderRadius: 8, height: 40, paddingTop: 3 }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                step={50000}
                addonAfter="₫"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="lyDo"
          label={<span style={{ fontWeight: 600 }}>Lý do / Diễn giải chi tiết</span>}
          rules={[{ required: true, message: 'Vui lòng nhập lý do phát sinh!' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Thưởng hoàn thành dự án vượt tiến độ 10 ngày..."
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PhatSinhModal;
