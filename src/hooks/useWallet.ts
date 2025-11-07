import { useAccount, useChainId, usePublicClient, useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { erc20Abi } from 'viem';

// Helper function to generate query keys
const queryKeys = {
  balance: (address?: string, token?: string) => ['balance', address, token],
};

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  // Fetch native token balance
  const { data: nativeBalance } = useQuery({
    queryKey: queryKeys.balance(address, 'native'),
    queryFn: async () => {
      if (!address || !publicClient) return null;
      const balance = await publicClient.getBalance({ address });
      return { value: balance, decimals: 18, symbol: 'ETH' };
    },
    enabled: !!address && isConnected && !!publicClient,
  });

  // Fetch token balance with caching
  const getTokenBalance = (tokenAddress: `0x${string}`) => {
    const { data: balance } = useReadContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address || '0x'],
      query: {
        enabled: !!address && isConnected && !!publicClient,
      },
    });

    const { data: decimals } = useReadContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
      query: {
        enabled: !!address && isConnected && !!publicClient,
      },
    });

    return useQuery({
      queryKey: queryKeys.balance(address, tokenAddress),
      queryFn: () => {
        if (!balance || decimals === undefined) return null;
        return { value: balance, decimals, symbol: 'TOKEN' };
      },
      enabled: !!balance && decimals !== undefined,
    });
  };

  return {
    address,
    isConnected,
    chainId,
    nativeBalance,
    getTokenBalance,
  };
}
