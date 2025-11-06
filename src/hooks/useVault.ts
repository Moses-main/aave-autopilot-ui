import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { erc20ABI, vaultABI } from '@/lib/wallet';
import { useQuery } from '@tanstack/react-query';
import { formatUnits, parseUnits } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

export function useVault() {
  const { address } = useAccount();
  const vaultAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;

  const queryClient = useQueryClient();

  // Get user's USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address,
    },
  });

  // Get user's vault shares
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address,
    },
  });

  // Get total assets in vault
  const { data: totalAssets } = useReadContract({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'totalAssets',
  });

  // Get USDC allowance for vault
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address || '0x', vaultAddress],
    query: {
      enabled: !!address,
    },
  });

  // Approve USDC for vault
  const { 
    writeContractAsync: approve, 
    isPending: isApproving,
    data: approveHash
  } = useWriteContract();

  // Deposit into vault
  const { 
    writeContractAsync: deposit, 
    isPending: isDepositing,
    data: depositHash
  } = useWriteContract();

  // Withdraw from vault
  const { 
    writeContractAsync: withdraw, 
    isPending: isWithdrawing,
    data: withdrawHash
  } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
    onSuccess: () => {
      refetchAllowance();
    },
  });

  // Wait for deposit transaction
  const { isLoading: isDepositLoading } = useWaitForTransactionReceipt({
    hash: depositHash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usdcBalance'] });
      queryClient.invalidateQueries({ queryKey: ['vaultBalance'] });
    },
  });

  // Wait for withdraw transaction
  const { isLoading: isWithdrawLoading } = useWaitForTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usdcBalance'] });
      queryClient.invalidateQueries({ queryKey: ['vaultBalance'] });
    },
  });

  // Get vault share price (assets per share)
  const sharePrice = useQuery({
    queryKey: ['sharePrice', totalAssets, vaultBalance],
    queryFn: async () => {
      if (!totalAssets || !vaultBalance) return '0';
      const assets = parseFloat(formatUnits(totalAssets as bigint, 6));
      const shares = parseFloat(formatUnits(vaultBalance as bigint, 18));
      return shares > 0 ? (assets / shares).toFixed(6) : '1.0';
    },
    enabled: !!totalAssets && !!vaultBalance
  });

  // Format balance for display
  const formatBalance = (balance: bigint | undefined, decimals = 18) => {
    if (!balance) return '0';
    return parseFloat(formatUnits(balance, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Calculate user's USDC equivalent of vault shares
  const userUsdcBalance = useQuery({
    queryKey: ['userUsdcBalance', vaultBalance, sharePrice],
    queryFn: () => {
      if (!vaultBalance) return '0';
      const shares = parseFloat(formatBalance(vaultBalance));
      return (shares * parseFloat(sharePrice.data || '1.0')).toFixed(6);
    },
    enabled: !!vaultBalance && !!sharePrice.data
  });

  return {
    // State
    usdcBalance: formatBalance(usdcBalance, 6),
    vaultBalance: formatBalance(vaultBalance),
    userBalance: userUsdcBalance.data || '0',
    totalAssets: formatBalance(totalAssets, 6),
    sharePrice: sharePrice.data || '1.0',
    allowance: allowance || 0n,
    
    // Actions
    approve: async (amount: string) => {
      const amountWei = parseUnits(amount, 6);
      await approve({
        address: usdcAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [vaultAddress, amountWei],
      });
    },
    
    deposit: async (amount: string) => {
      const amountWei = parseUnits(amount, 6);
      await deposit({
        address: vaultAddress,
        abi: vaultABI,
        functionName: 'deposit',
        args: [amountWei, address],
      });
    },
    
    withdraw: async (amount: string) => {
      const amountWei = parseUnits(amount, 6);
      await withdraw({
        address: vaultAddress,
        abi: vaultABI,
        functionName: 'withdraw',
        args: [amountWei, address, address],
      });
    },
    
    // Loading states
    isApproving: isApproving || isApproveLoading,
    isDepositing: isDepositing || isDepositLoading,
    isWithdrawing: isWithdrawing || isWithdrawLoading,
    isLoading: isApproving || isDepositing || isWithdrawing || 
              isApproveLoading || isDepositLoading || isWithdrawLoading,
  };
}
