// src/hooks/useAaveV3.ts
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, parseUnits, Address } from 'viem';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// AAVE V3 Pool ABI - simplified for our use case
const aaveV3PoolABI = [
  {
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'interestRateMode', type: 'uint256' },
      { internalType: 'uint16', name: 'referralCode', type: 'uint16' },
      { internalType: 'address', name: 'onBehalfOf', type: 'address' },
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'interestRateMode', type: 'uint256' },
      { internalType: 'address', name: 'onBehalfOf', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type AaveV3State = {
  // Balances
  usdcBalance: string;
  aTokenBalance: string;
  totalSupplied: string;
  healthFactor: string;
  
  // Loading states
  isSupplying: boolean;
  isWithdrawing: boolean;
  isLoading: boolean;
  
  // Transaction hashes
  supplyHash?: `0x${string}`;
  withdrawHash?: `0x${string}`;
  
  // Actions
  supply: (amount: string) => Promise<`0x${string}` | undefined>;
  withdraw: (amount: string) => Promise<`0x${string}` | undefined>;
  
  // Errors
  error: Error | null;
};

export function useAaveV3(): AaveV3State {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const poolAddress = (import.meta.env.VITE_AAVE_POOL_ADDRESS || '') as `0x${string}`;
  const usdcAddress = (import.meta.env.VITE_USDC_ADDRESS || '') as `0x${string}`;
  const aTokenAddress = (import.meta.env.VITE_ATOKEN_ADDRESS || '') as `0x${string}`;
  
  // State
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | null>(null);
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

  // Read aToken balance (user's supplied amount)
  const { 
    data: aTokenBalance = 0n, 
    refetch: refetchATokenBalance 
  } = useReadContract({
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: { enabled: !!address }
  });

  // Read total supplied (can be same as aTokenBalance if no interest)
  const totalSupplied = aTokenBalance; // In a real implementation, this would come from AAVE's data provider

  // Health factor (simplified - in reality this comes from AAVE's data provider)
  const healthFactor = '1.0'; // This would be calculated based on collateral/borrows

  // Write contract
  const { writeContractAsync } = useWriteContract();

  // Handle supply transaction
  const supply = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
    setIsSupplying(true);
    setError(null);

    try {
      // First approve USDC spending if needed
      await writeContractAsync({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [poolAddress, amountWei],
      });

      // Then supply to AAVE
      const hash = await writeContractAsync({
        address: poolAddress as Address,
        abi: aaveV3PoolABI,
        functionName: 'supply',
        args: [
          usdcAddress as Address, 
          amountWei, 
          address as Address,
          0 as const, // interestRateMode
          address as Address // onBehalfOf
        ],
      });

      setSupplyHash(hash);
      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Supply failed');
      setError(error);
      throw error;
    } finally {
      setIsSupplying(false);
    }
  };

  // Handle withdraw transaction
  const withdraw = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseUnits(amount, 6); // aUSDC has 6 decimals
    setIsWithdrawing(true);
    setError(null);

    try {
      const hash = await writeContractAsync({
        address: poolAddress as Address,
        abi: aaveV3PoolABI,
        functionName: 'withdraw',
        args: [
          usdcAddress as Address, 
          amountWei, 
          address as Address
        ],
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
    hash: supplyHash,
    onSuccess: () => {
      refetchUsdcBalance();
      refetchATokenBalance();
    },
  });

  useWaitForTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      refetchUsdcBalance();
      refetchATokenBalance();
    },
  });

  const state: AaveV3State = {
    // Balances
    usdcBalance: usdcBalance?.toString() || '0',
    aTokenBalance: aTokenBalance?.toString() || '0',
    totalSupplied: totalSupplied?.toString() || '0',
    healthFactor: healthFactor?.toString() || '0',
    // Loading states
    isSupplying,
    isWithdrawing,
    isLoading: isSupplying || isWithdrawing,
    // Transaction hashes
    supplyHash: supplyHash || undefined,
    withdrawHash: withdrawHash || undefined,
    // Actions
    supply,
    withdraw,
    // Errors
    error,
  };

  return state;
}