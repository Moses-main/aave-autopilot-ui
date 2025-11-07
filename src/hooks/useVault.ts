import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Vault ABI - simplified for our use case
const vaultABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'receiver', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type VaultState = {
  // Balances
  usdcBalance: string;
  vaultBalance: string;
  totalAssets: string;
  sharePrice: string;
  allowance: string;
  
  // Loading states
  isApproving: boolean;
  isDepositing: boolean;
  isWithdrawing: boolean;
  isLoading: boolean;
  
  // Transaction hashes
  approveHash: `0x${string}` | null;
  depositHash: `0x${string}` | null;
  withdrawHash: `0x${string}` | null;
  
  // Actions
  approve: (amount: string) => Promise<`0x${string}` | undefined>;
  deposit: (amount: string) => Promise<`0x${string}` | undefined>;
  withdraw: (amount: string) => Promise<`0x${string}` | undefined>;
  
  // Errors
  error: Error | null;
};

export function useVault(): VaultState {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const vaultAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`;
  const usdcAddress = (import.meta.env.VITE_USDC_ADDRESS || '') as `0x${string}`;
  
  // State
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [depositHash, setDepositHash] = useState<`0x${string}` | null>(null);
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);

  // Read USDC balance
  const { 
    data: usdcBalance = 0n, 
    refetch: refetchUsdcBalance 
  } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: { enabled: !!address }
  });

  // Read Vault balance
  const { 
    data: vaultBalance = 0n, 
    refetch: refetchVaultBalance 
  } = useReadContract({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: { enabled: !!address }
  });

  // Read total assets
  const { 
    data: totalAssets = 0n, 
    refetch: refetchTotalAssets 
  } = useReadContract({
    address: vaultAddress,
    abi: vaultABI,
    functionName: 'totalAssets',
    query: { enabled: !!address }
  });

  // Read allowance
  const { 
    data: allowance = 0n, 
    refetch: refetchAllowance 
  } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address || '0x', vaultAddress],
    query: { enabled: !!address }
  });

  // Write contract
  const { writeContractAsync } = useWriteContract();

  // Handle approve transaction
  const approve = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseUnits(amount, 6);
    setIsApproving(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [vaultAddress, amountWei],
      });

      setApproveHash(hash);
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to approve');
      setError(error);
      throw error;
    } finally {
      setIsApproving(false);
    }
  };

  // Handle deposit transaction
  const deposit = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseUnits(amount, 6);
    setIsDepositing(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultABI,
        functionName: 'deposit',
        args: [amountWei, address],
      });

      setDepositHash(hash);
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Deposit failed');
      setError(error);
      throw error;
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle withdraw transaction
  const withdraw = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseUnits(amount, 6);
    setIsWithdrawing(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultABI,
        functionName: 'withdraw',
        args: [amountWei, address, address],
      });

      setWithdrawHash(hash);
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Withdrawal failed');
      setError(error);
      throw error;
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Wait for transaction receipts and refetch data
  useWaitForTransactionReceipt({
    hash: approveHash,
    onSuccess: () => {
      refetchAllowance();
      refetchUsdcBalance();
    },
  });

  useWaitForTransactionReceipt({
    hash: depositHash,
    onSuccess: () => {
      refetchUsdcBalance();
      refetchVaultBalance();
      refetchTotalAssets();
    },
  });

  useWaitForTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      refetchUsdcBalance();
      refetchVaultBalance();
      refetchTotalAssets();
    },
  });

  // Calculate share price (1e18 precision)
  const sharePrice = totalAssets > 0n && vaultBalance > 0n 
    ? formatUnits((totalAssets * 10n**18n) / vaultBalance, 18)
    : '0';

  return {
    // Balances
    usdcBalance: formatUnits(usdcBalance, 6),
    vaultBalance: formatUnits(vaultBalance, 6),
    totalAssets: formatUnits(totalAssets, 6),
    sharePrice,
    allowance: formatUnits(allowance, 6),
    
    // Loading states
    isApproving,
    isDepositing,
    isWithdrawing,
    isLoading: isApproving || isDepositing || isWithdrawing,
    
    // Transaction hashes
    approveHash,
    depositHash,
    withdrawHash,
    
    // Actions
    approve,
    deposit,
    withdraw,
    
    // Errors
    error,
  };
}