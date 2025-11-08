import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi, parseUnits, formatUnits, Address } from 'viem';
import { useState, useMemo } from 'react';
import { useWatchTransactionReceipt } from './useWatchTransactionReceipt';
import { useAaveData } from './useAaveData';

// AAVE V3 Pool ABI - extended with additional functions
const aaveV3PoolABI = [
  {
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address', name: 'onBehalfOf', type: 'address' },
      { internalType: 'uint16', name: 'referralCode', type: 'uint16' },
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
      { internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { internalType: 'uint256', name: 'totalCollateralBase', type: 'uint256' },
      { internalType: 'uint256', name: 'totalDebtBase', type: 'uint256' },
      { internalType: 'uint256', name: 'availableBorrowsBase', type: 'uint256' },
      { internalType: 'uint256', name: 'currentLiquidationThreshold', type: 'uint256' },
      { internalType: 'uint256', name: 'ltv', type: 'uint256' },
      { internalType: 'uint256', name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface AaveV3State {
  // Balances
  usdcBalance: string;
  aTokenBalance: string;
  totalSupplied: string;
  
  // Health metrics
  healthFactor: number;
  loanToValue: number;
  availableBorrows: string;
  liquidationThreshold: number;
  totalCollateralBase: string;
  totalDebtBase: string;
  
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
  refetch: () => void;
  
  // Error handling
  error: Error | null;
};

export function useAaveV3(): AaveV3State {
  const { address } = useAccount();
  
  // Contract addresses from environment variables
  const poolAddress = (import.meta.env.VITE_AAVE_POOL_ADDRESS || '') as `0x${string}`;
  const usdcAddress = (import.meta.env.VITE_USDC_ADDRESS || '') as `0x${string}`;
  const aTokenAddress = (import.meta.env.VITE_ATOKEN_ADDRESS || '') as `0x${string}`;
  
  // State
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | null>(null);
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);

  // Get AAVE data using our custom hook
  const { 
    userData: aaveUserData, 
    refetch: refetchAaveData 
  } = useAaveData();
  const isAaveDataLoading = false; // This should be managed based on your loading state

  // Read USDC balance
  const { 
    data: usdcBalance = 0n, 
    refetch: refetchUsdcBalance,
  } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      select: (data) => {
        return data as bigint;
      },
    },
  });

  // Read aToken balance (user's supplied amount)
  const { 
    data: aTokenBalance = 0n, 
    refetch: refetchATokenBalance,
  } = useReadContract({
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      select: (data) => {
        return data as bigint;
      },
    },
  });

  // Format user data
  const formattedUserData = useMemo(() => {
    if (!aaveUserData) {
      return {
        healthFactor: '0',
        loanToValue: '0',
        availableBorrows: '0',
        liquidationThreshold: '0',
        totalCollateralBase: '0',
        totalDebtBase: '0',
      };
    }

    return {
      healthFactor: aaveUserData.healthFactor || '0',
      loanToValue: aaveUserData.ltv || '0',
      availableBorrows: aaveUserData.availableBorrowsBase || '0',
      liquidationThreshold: aaveUserData.currentLiquidationThreshold || '0',
      totalCollateralBase: aaveUserData.totalCollateralBase || '0',
      totalDebtBase: aaveUserData.totalDebtBase || '0',
    };
  }, [aaveUserData]);

  // Format balances and metrics
  const formattedBalances = useMemo(() => {
    const baseBalances = {
      usdcBalance: formatUnits(usdcBalance, 6), // USDC has 6 decimals
      aTokenBalance: formatUnits(aTokenBalance, 6), // aUSDC has 6 decimals
      totalSupplied: formatUnits(aTokenBalance, 6), // Same as aTokenBalance for now
      healthFactor: Number(formattedUserData.healthFactor) || 0,
      loanToValue: Number(formattedUserData.loanToValue) || 0,
      availableBorrows: formattedUserData.availableBorrows,
      liquidationThreshold: Number(formattedUserData.liquidationThreshold) || 0,
      totalCollateralBase: formattedUserData.totalCollateralBase,
      totalDebtBase: formattedUserData.totalDebtBase,
    };

    return baseBalances;
  }, [usdcBalance, aTokenBalance, formattedUserData]);

  // Write contract
  const { writeContractAsync } = useWriteContract();

  // Combined loading state
  const isLoading = isAaveDataLoading || isSupplying || isWithdrawing;

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
          address as Address, // onBehalfOf
          0 as const, // referralCode
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
          address as Address, // to
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

  // Combined refetch function
  const refetch = async () => {
    await Promise.all([
      refetchUsdcBalance(),
      refetchATokenBalance(),
      refetchAaveData(),
    ]);
  };

  // Use watch to monitor transaction hashes
  useWatchTransactionReceipt({
    hash: supplyHash,
    onSuccess: () => {
      refetch();
    },
  });

  useWatchTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      refetch();
    },
  });

  return {
    // Balances and metrics
    usdcBalance: formattedBalances.usdcBalance,
    aTokenBalance: formattedBalances.aTokenBalance,
    totalSupplied: formattedBalances.totalSupplied,
    
    // Health metrics
    healthFactor: formattedBalances.healthFactor,
    loanToValue: formattedBalances.loanToValue,
    availableBorrows: formattedBalances.availableBorrows,
    liquidationThreshold: formattedBalances.liquidationThreshold,
    totalCollateralBase: formattedBalances.totalCollateralBase,
    totalDebtBase: formattedBalances.totalDebtBase,
    
    // Loading states
    isSupplying,
    isWithdrawing,
    isLoading,
    
    // Transaction hashes
    supplyHash: supplyHash || undefined,
    withdrawHash: withdrawHash || undefined,
    
    // Actions
    supply,
    withdraw,
    refetch,
    
    // Errors
    error: error,
  };
}