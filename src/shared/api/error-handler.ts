import { toast } from 'sonner';

export const handleApiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Something went wrong';

  toast.error('API Error', {
    description: message,
  });
};
