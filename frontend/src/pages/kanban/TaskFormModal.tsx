import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import { TaskItemDto, CreateTaskDto, UpdateTaskDto } from '@/types/congViec';
import { congViecApi } from '@/api/congViecApi';
import { nhanVienApi } from '@/api/nhanVienApi';
import { NhanVienDto } from '@/types/nhanVien';

interface TaskFormModalProps {
  open: boolean;
  editingTask: TaskItemDto | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const { TextArea } = Input;

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  editingTask,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState<NhanVienDto[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);

  const isEditing = !!editingTask;

  useEffect(() => {
    if (open) {
      // Load list employees for assignment dropdown
      const loadEmployees = async () => {
        setLoadingEmp(true);
        try {
          const res = await nhanVienApi.getList({ pageSize: 100 });
          if (res.success && res.data) {
            setEmployees(res.data.items);
          }
        } catch {
          message.error('Không thể tải danh sách nhân viên.');
        } finally {
          setLoadingEmp(false);
        }
      };
      loadEmployees();

      if (editingTask) {
        form.setFieldsValue({
          ...editingTask,
          ngayBatDau: editingTask.ngayBatDau ? dayjs(editingTask.ngayBatDau) : null,
          deadline: editingTask.deadline ? dayjs(editingTask.deadline) : null,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          doUuTien: 'Trung bình',
          ngayBatDau: dayjs(),
        });
      }
    }
  }, [open, editingTask, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        tieuDe: values.tieuDe,
        moTa: values.moTa,
        maNV_PhuTrach: values.maNV_PhuTrach,
        doUuTien: values.doUuTien,
        ngayBatDau: values.ngayBatDau ? values.ngayBatDau.format('YYYY-MM-DD') : undefined,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
      };

      if (isEditing && editingTask) {
        const updateData: UpdateTaskDto = payload;
        const res = await congViecApi.update(editingTask.maTask, updateData);
        if (res.success) {
          message.success('Cập nhật công việc thành công!');
          onSuccess();
        } else {
          message.error(res.message || 'Cập nhật thất bại.');
        }
      } else {
        const createData: CreateTaskDto = payload;
        const res = await congViecApi.create(createData);
        if (res.success) {
          message.success('Giao việc mới thành công!');
          onSuccess();
        } else {
          message.error(res.message || 'Tạo công việc thất bại.');
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errorObj.response?.data?.message || 'Có lỗi xảy ra khi lưu công việc.');
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? `Chỉnh sửa công việc #${editingTask?.maTask}` : 'Giao Việc Mới'}
      okText={isEditing ? 'Lưu thay đổi' : 'Tạo công việc'}
      cancelText="Hủy bỏ"
      onOk={handleSubmit}
      onCancel={onCancel}
      width={650}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="tieuDe"
          label="Tiêu đề công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc!' }]}
        >
          <Input placeholder="Ví dụ: Thiết kế giao diện Dashboard" />
        </Form.Item>

        <Form.Item name="moTa" label="Mô tả chi tiết">
          <TextArea rows={4} placeholder="Yêu cầu công việc, tài liệu đính kèm..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maNV_PhuTrach"
              label="Người phụ trách"
              rules={[{ required: true, message: 'Chọn nhân viên phụ trách!' }]}
            >
              <Select
                placeholder="Chọn nhân viên"
                loading={loadingEmp}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={employees.map((emp) => ({
                  value: emp.maNV,
                  label: `${emp.hoTen} (${emp.maNV}) - ${emp.tenPB}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="doUuTien"
              label="Mức độ ưu tiên"
              rules={[{ required: true, message: 'Chọn độ ưu tiên!' }]}
            >
              <Select
                options={[
                  { value: 'Thấp', label: 'Thấp' },
                  { value: 'Trung bình', label: 'Trung bình' },
                  { value: 'Cao', label: 'Cao' },
                  { value: 'Khẩn cấp', label: 'Khẩn cấp' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ngayBatDau" label="Ngày bắt đầu">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="deadline" label="Hạn chót (Deadline)">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
