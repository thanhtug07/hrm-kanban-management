import React, { useState } from 'react';
import { Modal, Typography, message, Alert } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { taiKhoanApi } from '@/api/taiKhoanApi';
import { TaiKhoanDto } from '@/types/taiKhoan';

const { Text } = Typography;

interface ResetPasswordModalProps {
  account: TaiKhoanDto | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  account,
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!account) return null;

  const handleConfirmReset = async () => {
    setLoading(true);
    try {
      const res: any = await taiKhoanApi.resetPassword(account.maTK, {
        matKhauMoi: 'Hrm@123456',
      });
      if (res && res.success) {
        message.success(
          res.message || `Đã đặt lại mật khẩu cho tài khoản '${account.tenDangNhap}' thành công!`
        );
        onSuccess();
        onClose();
      } else {
        message.error(res?.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch {
      message.error('Lỗi kết nối khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyOutlined style={{ color: '#F59E0B' }} />
          <span style={{ fontWeight: 700, fontSize: 16 }}>Đặt Lại Mật Khẩu Mặc Định</span>
        </div>
      }
      okText="Xác nhận Đặt lại"
      cancelText="Hủy bỏ"
      onOk={handleConfirmReset}
      onCancel={onClose}
      confirmLoading={loading}
      width={460}
      okButtonProps={{
        style: { backgroundColor: '#F59E0B', borderColor: '#F59E0B', borderRadius: 8 },
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
    >
      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
          Hệ thống sẽ đặt lại mật khẩu của người dùng{' '}
          <strong style={{ color: '#0F172A' }}>
            {account.hoTen || account.tenDangNhap} ({account.tenDangNhap})
          </strong>{' '}
          về mật khẩu mặc định của tổ chức. Bạn có chắc chắn muốn thực hiện?
        </p>

        <Alert
          message={
            <span>
              Mật khẩu mới sau khi đặt lại: <strong style={{ color: '#0F766E' }}>Hrm@123456</strong>
            </span>
          }
          type="warning"
          showIcon
          style={{ borderRadius: 8, marginTop: 14 }}
        />
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
