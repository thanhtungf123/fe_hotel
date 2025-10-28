// Toast Notification Utility
// Replace all alert() calls with these beautiful toasts

import { toast } from 'react-toastify';

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, { ...toastConfig, ...options });
  },
  
  error: (message, options = {}) => {
    toast.error(message, { ...toastConfig, ...options });
  },
  
  info: (message, options = {}) => {
    toast.info(message, { ...toastConfig, ...options });
  },
  
  warning: (message, options = {}) => {
    toast.warning(message, { ...toastConfig, ...options });
  },
  
  promise: async (promiseFunction, messages = {}) => {
    return toast.promise(
      promiseFunction,
      {
        pending: messages.pending || 'Đang xử lý...',
        success: messages.success || 'Thành công!',
        error: messages.error || 'Có lỗi xảy ra!',
      },
      toastConfig
    );
  },
};

export default showToast;


