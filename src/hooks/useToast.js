import toast from 'react-hot-toast';

const useToast = () => {
  const success = (message) => {
    toast.success(message);
  };

  const error = (message) => {
    toast.error(message);
  };

  const loading = (message) => {
    return toast.loading(message);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const promise = (promiseFn, messages) => {
    return toast.promise(promiseFn, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    });
  };

  const custom = (message, options = {}) => {
    toast(message, options);
  };

  return {
    success,
    error,
    loading,
    dismiss,
    promise,
    custom,
  };
};

export default useToast;
