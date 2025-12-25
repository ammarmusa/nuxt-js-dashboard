import { toast } from "vue-sonner";

export const useToast = () => {
  return {
    success: (message: string, options?: any) => {
      toast.success(message, options);
    },
    error: (message: string, options?: any) => {
      toast.error(message, options);
    },
    info: (message: string, options?: any) => {
      toast.info(message, options);
    },
    warning: (message: string, options?: any) => {
      toast.warning(message, options);
    },
    loading: (message: string, options?: any) => {
      return toast.loading(message, options);
    },
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return toast.promise(promise, msgs);
    },
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId);
    },
  };
};
