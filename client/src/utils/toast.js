/**
 * Custom Toast Utility — Enforces single active toast popup & fast auto-dismissal.
 * Automatically dismisses any active toast before displaying a new notification.
 */
import rawToast from 'react-hot-toast';

const FAST_DURATION = 1400;

export const toast = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast(message, { duration: FAST_DURATION, ...opts });
};

toast.success = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.success(message, { duration: FAST_DURATION, ...opts });
};

toast.error = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.error(message, { duration: FAST_DURATION + 200, ...opts });
};

toast.loading = (message, opts = {}) => {
  rawToast.dismiss();
  return rawToast.loading(message, opts);
};

toast.dismiss = (id) => rawToast.dismiss(id);
toast.promise = (promise, msgs, opts) => {
  rawToast.dismiss();
  return rawToast.promise(promise, msgs, { duration: FAST_DURATION, ...opts });
};

export default toast;
