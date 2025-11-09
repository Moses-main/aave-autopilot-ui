import { useAccount, useWriteContract, usePublicClient, useReadContract, useBalance } from 'wagmi';
import { erc20Abi, parseEther, formatEther, formatUnits, Address } from 'viem';
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
  ethBalance: string;
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

  // Read ETH balance
  const { 
    data: ethBalanceData,
    refetch: refetchEthBalance,
  } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
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
  
  // Format ETH balance
  const ethBalance = ethBalanceData ? ethBalanceData.value : 0n;

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
      ethBalance: formatEther(ethBalance), // ETH has 18 decimals
      aTokenBalance: formatUnits(aTokenBalance, 18), // aWETH has 18 decimals
      totalSupplied: formatUnits(aTokenBalance, 18), // Same as aTokenBalance for now
      healthFactor: Number(formattedUserData.healthFactor) || 0,
      loanToValue: Number(formattedUserData.loanToValue) || 0,
      availableBorrows: formattedUserData.availableBorrows,
      liquidationThreshold: Number(formattedUserData.liquidationThreshold) || 0,
      totalCollateralBase: formattedUserData.totalCollateralBase,
      totalDebtBase: formattedUserData.totalDebtBase,
    };

    return baseBalances;
  }, [ethBalance, aTokenBalance, formattedUserData]);

  // Get the public client for transaction receipts
  const publicClient = usePublicClient();
  if (!publicClient) {
    throw new Error('Failed to initialize public client');
  }
  
  // Write contract
  const { writeContractAsync } = useWriteContract();

  // Combined loading state
  const isLoading = isAaveDataLoading || isSupplying || isWithdrawing;

  // Handle supply transaction with native ETH
  const supply = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseEther(amount); // ETH has 18 decimals
    setIsSupplying(true);
    setError(null);

    try {
      // Debug logs - Enhanced with more context
      console.log('=== DEBUG INFO ===');
      console.log('Wallet Address:', address);
      console.log('Chain ID:', await publicClient.getChainId());
      console.log('Using RPC URL:', import.meta.env.VITE_RPC_URL);
      console.log('Environment Variables:', {
        VITE_RPC_URL: import.meta.env.VITE_RPC_URL,
        VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
        VITE_AAVE_AUTOPILOT_ADDRESS: import.meta.env.VITE_AAVE_AUTOPILOT_ADDRESS
      });

      // Check ETH balance
      const balance = await publicClient.getBalance({ address });
      console.log('ETH Balance (raw):', balance.toString());
      console.log('ETH Balance (formatted):', formatEther(balance), 'ETH');
      console.log('Amount to deposit (formatted):', formatEther(amountWei), 'ETH');
      console.log('========================');

      if (balance < amountWei) {
        throw new Error('Insufficient ETH balance');
      }

      // Get the AaveAutopilot contract address from environment variables
      const aaveAutopilotAddress = import.meta.env.VITE_AAVE_AUTOPILOT_ADDRESS as Address;
      if (!aaveAutopilotAddress) {
        throw new Error('AaveAutopilot contract address not configured');
      }

      // Deposit ETH into AaveAutopilot vault using depositETH
      const hash = await writeContractAsync({
        address: aaveAutopilotAddress,
        abi: [
          {
            "inputs": [
              {"internalType": "address", "name": "receiver", "type": "address"}
            ],
            "name": "depositETH",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "payable",
            "type": "function"
          }
        ],
        functionName: 'depositETH',
        args: [address],
        value: amountWei, // Send native ETH with the transaction
        gas: BigInt(500000), // Increased gas limit for the vault interaction
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

  // Handle withdraw transaction with ETH
  const withdraw = async (amount: string): Promise<`0x${string}` | undefined> => {
    if (!address) {
      setError(new Error('No wallet connected'));
      return;
    }

    const amountWei = parseEther(amount); // aWETH has 18 decimals
    setIsWithdrawing(true);
    setError(null);

    try {
      const aaveAutopilotAddress = import.meta.env.VITE_AAVE_AUTOPILOT_ADDRESS as Address;
      if (!aaveAutopilotAddress) {
        throw new Error('AaveAutopilot contract address not configured');
      }

      // Withdraw from AaveAutopilot vault
      const hash = await writeContractAsync({
        address: aaveAutopilotAddress,
        abi: [
          {
            "inputs": [
              {"internalType": "uint256", "name": "shares", "type": "uint256"},
              {"internalType": "address", "name": "receiver", "type": "address"},
              {"internalType": "address", "name": "owner", "type": "address"}
            ],
            "name": "withdraw",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
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

  // Combined refetch function
  const refetch = async () => {
    await Promise.all([
      refetchEthBalance(),
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
    ethBalance: formattedBalances.ethBalance,
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