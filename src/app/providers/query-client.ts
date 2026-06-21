import { DEFAULT_QUERY_RETRY_COUNT } from '@/shared/config/query';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: DEFAULT_QUERY_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
  },
});
