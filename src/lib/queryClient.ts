import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus to reduce network requests
      refetchOnWindowFocus: false,
      // Retry failed queries once
      retry: 1,
      // Cache time of 5 minutes
      gcTime: 5 * 60 * 1000,
      // Stale time of 1 minute
      staleTime: 60 * 1000,
    },
  },
});

// Query keys for consistent query key management
export const queryKeys = {
  account: (address?: string) => ['account', address],
  balance: (address?: string, token?: string) => ['balance', address, token],
  allowance: (owner?: string, spender?: string, token?: string) => 
    ['allowance', owner, spender, token],
  aaveUserData: (address?: string) => ['aave', 'user', address],
  aaveReserves: ['aave', 'reserves'],
  vault: {
    balance: (address?: string) => ['vault', 'balance', address],
    totalAssets: ['vault', 'totalAssets'],
    maxWithdraw: (address?: string) => ['vault', 'maxWithdraw', address],
  },
};
