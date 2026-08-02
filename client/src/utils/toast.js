/**
 * Custom Toast Utility — Enforces single active toast popup & fast auto-dismissal.
 * Automatically dismisses any active toast before displaying a new notification.
 */
import rawToast from 'react-hot-toast';

const FAST_DURATION = 1800;

function formatMessage(msg) {
  if (!msg) return 'An error occurred';
  if (typeof msg === 'string') return msg;
  if (typeof msg === 'object') {
    return (
      msg.message ||
      msg.error ||
      msg.data?.message ||
      msg.data?.error ||
      msg.response?.data?.message ||
      msg.response?.data?.error ||
      (typeof msg.toString === 'function' && msg.toString() !== '[object Object]' ? msg.toString() : null) ||
      'An unexpected error occurred'
    );
  }
  return String(msg);
}

export const toast = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast(formatMessage(message), { duration: FAST_DURATION, ...opts });
};

toast.success = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.success(formatMessage(message), { duration: FAST_DURATION, ...opts });
};

toast.error = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.error(formatMessage(message), { duration: FAST_DURATION + 400, ...opts });
};

toast.loading = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.loading(formatMessage(message), opts);
};

toast.dismiss = (id) => rawToast.dismiss(id);
toast.promise = (promise, msgs, opts) => {
  rawToast.dismiss();
  return rawToast.promise(promise, msgs, { duration: FAST_DURATION, ...opts });
};

export default toast;

