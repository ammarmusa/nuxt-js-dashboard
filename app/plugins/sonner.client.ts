// plugins/sonner.client.ts
import { toast } from "vue-sonner";

/**
 * Vue Sonner Toast Plugin
 * Provides a global toast notification system
 * Usage: const toast = useToast() or const { $toast } = useNuxtApp()
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Provide toast globally for both Nuxt app and components
  return {
    provide: {
      toast: {
        success: (message: string, options?: any) =>
          toast.success(message, options),
        error: (message: string, options?: any) =>
          toast.error(message, options),
        info: (message: string, options?: any) => toast.info(message, options),
        warning: (message: string, options?: any) =>
          toast.warning(message, options),
        loading: (message: string, options?: any) =>
          toast.loading(message, options),
        promise: toast.promise,
        dismiss: toast.dismiss,
      },
    },
  };
});
