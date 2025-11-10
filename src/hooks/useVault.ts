import { useState, useEffect, useMemo } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useBalance,
  useReadContracts,
  useChainId,
  type Config,
  type ResolvedRegister
} from 'wagmi';
import { formatEther, parseEther, type Address } from 'viem';
import { AaveAutopilotABI } from '../lib/abis/AaveAutopilot';
import { getContractAddress } from '../lib/contracts';

type UseBalanceParameters = Parameters<typeof useBalance<Config, ResolvedRegister['config']>>[0];

interface VaultData {
  userAddress?: `0x${string}`;
  ethBalance: number;
  aTokenBalance: string;
  totalSupplied: string;
  isLoading: boolean;
  isLoadingEthBalance: boolean;
  isDepositing: boolean;
  isWithdrawing: boolean;
  isDepositProcessing: boolean;
  isWithdrawProcessing: boolean;
  depositHash?: `0x${string}`;
  withdrawHash?: `0x${string}`;
  isDepositSuccess: boolean;
  isWithdrawSuccess: boolean;
  error: Error | null;
  handleDeposit: (amount: string) => Promise<void>;
  handleWithdraw: (amount: string) => Promise<void>;
  refetch: () => void;
}

export function useVault(): VaultData {
  const { address, chain } = useAccount();
  const chainId = useChainId();
  
  // Log wallet connection status
  useEffect(() => {
    const isSepolia = chainId === 11155111;
    console.log('Wallet Status:', {
      isConnected: !!address,
      address,
      chainId,
      chainName: chain?.name,
      isSepolia,
      expectedChainId: 11155111
    });

    // Add warning if connected to wrong network
    if (chain && chain.id !== chainId) {
      console.warn(`Wallet is connected to chain ${chain.id} (${chain.name}), but expected ${chainId} (Sepolia)`);
    }
  }, [address, chain, chainId]);
  const [error, setError] = useState<Error | null>(null);

  // Get the chain ID from environment variables
  const chainId = useMemo(() => {
    const envChainId = import.meta.env.VITE_CHAIN_ID;
    const defaultChainId = 11155111; // Sepolia
    const chainId = envChainId ? Number(envChainId) : defaultChainId;
    
    console.log('Using Chain ID:', {
      fromEnv: import.meta.env.VITE_CHAIN_ID,
      resolved: chainId,
      rpcUrl: import.meta.env.VITE_RPC_URL,
      timestamp: new Date().toISOString()
    });
    
    return chainId;
  }, []);

  // Configure balance query parameters
  const balanceQuery: UseBalanceParameters = {
    address: address as Address,
    chainId: 11155111, // Force Sepolia chain ID
    token: undefined, // Explicitly set to undefined for native token
    unit: 'ether' // Request balance in ETH instead of wei
  };

  // Get native ETH balance with detailed logging
  const { 
    data: ethBalanceData,
    refetch: refetchEthBalance,
    error: ethBalanceError,
    isPending: isLoadingEthBalance
  } = useBalance(balanceQuery);

  // Log balance data when it changes
  useEffect(() => {
    if (!address) return;
    
    console.group('ETH Balance Update');
    console.log('Address:', address);
    console.log('Chain ID:', 11155111);
    console.log('Balance Data:', ethBalanceData);
    console.log('Loading:', isLoadingEthBalance);
    console.log('Error:', ethBalanceError);
    
    if (ethBalanceData) {
      console.log('Balance Details:', {
        value: ethBalanceData.value.toString(),
        formatted: ethBalanceData.formatted,
        symbol: ethBalanceData.symbol,
        decimals: ethBalanceData.decimals
      });
    }
    
    console.groupEnd();
  }, [address, ethBalanceData, isLoadingEthBalance, ethBalanceError]);

  // Log balance data when it changes
  useEffect(() => {
    console.group('ETH Balance Update');
    console.log('Address:', address);
    console.log('Chain ID:', chainId);
    console.log('Balance Data:', ethBalanceData);
    console.log('Loading:', isLoadingEthBalance);
    console.log('Error:', ethBalanceError);
    console.groupEnd();
  }, [ethBalanceData, isLoadingEthBalance, ethBalanceError, address, chainId]);
  
  // Debug: Log RPC configuration
  useEffect(() => {
    console.log('RPC Configuration:', {
      rpcUrl: import.meta.env.VITE_RPC_URL,
      chainId,
      address,
      hasEthBalanceData: !!ethBalanceData,
      timestamp: new Date().toISOString()
    });
  }, [address, chainId, ethBalanceData]);

  // Debug: Log balance data when it changes
  useEffect(() => {
    if (ethBalanceData) {
      console.log('ETH Balance Data:', {
        value: ethBalanceData.value.toString(),
        formatted: formatEther(ethBalanceData.value),
        decimals: ethBalanceData.decimals,
        symbol: ethBalanceData.symbol,
        hasAddress: !!address,
        address,
        chainId
      });
    }
  }, [ethBalanceData, address, chainId]);

  // Debug logging
  useEffect(() => {
    console.log('Balance Debug:', {
      address,
      chainId,
      balance: ethBalanceData,
      formattedBalance: ethBalance,
      error: ethBalanceError,
      isConnected: !!address,
      timestamp: new Date().toISOString()
    });
  }, [address, chainId, ethBalanceData, ethBalanceError, ethBalance]);

  // Read vault data
  const { 
    data: vaultData,
    refetch: refetchVaultData,
    isPending: isLoadingVaultData,
    error: vaultDataError
  } = useReadContracts({
    contracts: [
      {
        address: getContractAddress('vault'),
        abi: AaveAutopilotABI,
        functionName: 'getUserAccountData',
        args: [address as Address],
      },
      {
        address: getContractAddress('vault'),
        abi: AaveAutopilotABI,
        functionName: 'balanceOf',
        args: [address as Address],
      },
      {
        address: getContractAddress('vault'),
        abi: AaveAutopilotABI,
        functionName: 'totalSupply',
      }
    ],
    query: {
      enabled: !!address,
      select: (data) => ({
        userBalance: data[1].result as bigint,
        totalSupply: data[2].result as bigint,
      }),
    },
  });

  // Format ETH balance with enhanced error handling and type safety
  const ethBalance = useMemo(() => {
    const logContext = {
      timestamp: new Date().toISOString(),
      hasAddress: !!address,
      hasBalanceData: !!ethBalanceData,
      address,
      chainId: 11155111,
      rawBalance: ethBalanceData,
      error: ethBalanceError
    };

    if (!address) {
      console.log('No wallet connected', logContext);
      return 0;
    }

    if (ethBalanceError) {
      console.error('Error fetching balance:', ethBalanceError, logContext);
      return 0;
    }

    if (!ethBalanceData) {
      if (!isLoadingEthBalance) {
        console.log('No balance data available', logContext);
      }
      return 0;
    }

    try {
      // Use the already formatted value from useBalance with unit: 'ether'
      const ethValue = ethBalanceData.value;
      const formattedValue = parseFloat(ethBalanceData.formatted);
      
      console.log('Balance formatted successfully:', {
        ...logContext,
        wei: ethValue.toString(),
        eth: formattedValue,
        formatted: formattedValue.toFixed(6),
        symbol: ethBalanceData.symbol,
        decimals: ethBalanceData.decimals,
        chainId: ethBalanceData.chainId,
        timestamp: new Date().toISOString()
      });
      
      return formattedValue;
    } catch (error) {
      console.error('Error formatting ETH balance:', error, logContext);
      return 0;
    }
  }, [ethBalanceData, address]);

  const aTokenBalance = useMemo(() => {
    if (!vaultData?.userBalance) return '0';
    return formatEther(vaultData.userBalance);
  }, [vaultData]);

  const totalSupplied = useMemo(() => {
    if (!vaultData?.totalSupply) return '0';
    return formatEther(vaultData.totalSupply);
  }, [vaultData]);

  // Deposit ETH to vault
  const { 
    writeContractAsync: depositETH,
    data: depositHash,
    isPending: isDepositing,
    error: depositError
  } = useWriteContract();

  // Withdraw from vault
  const { 
    writeContractAsync: withdrawFromVault,
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError
  } = useWriteContract();

  // Wait for deposit transaction
  const { 
    isLoading: isDepositProcessing,
    isSuccess: isDepositSuccess,
    error: depositReceiptError
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Wait for withdraw transaction
  const { 
    isLoading: isWithdrawProcessing,
    isSuccess: isWithdrawSuccess,
    error: withdrawReceiptError
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Handle transaction side effects
  useEffect(() => {
    if (isDepositSuccess || isWithdrawSuccess) {
      refetchVaultData();
      refetchEthBalance();
      setError(null);
    }
  }, [isDepositSuccess, isWithdrawSuccess, refetchVaultData, refetchEthBalance]);

  // Handle deposit
  const handleDeposit = async (amount: string): Promise<void> => {
    if (!address) throw new Error('No wallet connected');
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    setError(null);
    
    try {
      await depositETH({
        address: getContractAddress('vault'),
        abi: AaveAutopilotABI,
        functionName: 'deposit',
        value: parseEther(amount),
        chainId,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Deposit failed');
      setError(error);
      console.error('Deposit error:', error);
      throw error;
    }
  };

  // Handle withdraw
  const handleWithdraw = async (amount: string): Promise<void> => {
    if (!address) throw new Error('No wallet connected');
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    setError(null);
    
    try {
      await withdrawFromVault({
        address: getContractAddress('vault'),
        abi: AaveAutopilotABI,
        functionName: 'withdraw',
        args: [parseEther(amount)],
        chainId,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Withdrawal failed');
      setError(error);
      console.error('Withdrawal error:', error);
      throw error;
    }
  };

  // Handle errors
  useEffect(() => {
    const error = vaultDataError || ethBalanceError || depositError || withdrawError || depositReceiptError || withdrawReceiptError;
    if (error) {
      console.error('Vault error:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [vaultDataError, ethBalanceError, depositError, withdrawError, depositReceiptError, withdrawReceiptError]);

  // Log balance for debugging
  useEffect(() => {
    console.log('Balance Debug:', {
      timestamp: new Date().toISOString(),
      hasAddress: !!address,
      address,
      chainId,
      isSepolia: chainId === 11155111,
      balanceData: ethBalanceData ? {
        value: ethBalanceData.value.toString(),
        formatted: formatEther(ethBalanceData.value),
        symbol: ethBalanceData.symbol,
        decimals: ethBalanceData.decimals
      } : null,
      isLoading: isLoadingEthBalance,
      error: ethBalanceError ? {
        name: ethBalanceError.name,
        message: ethBalanceError.message,
        stack: ethBalanceError.stack
      } : null,
      finalDisplayBalance: ethBalance,
      isConnected: !!address
    });
    
    // Log any errors from other hooks
    if (vaultDataError) {
      console.error('Vault Data Error:', vaultDataError);
    }
    if (ethBalanceError) {
      console.error('ETH Balance Error:', ethBalanceError);
    }
  }, [
    address, 
    chainId, 
    ethBalanceData, 
    isLoadingEthBalance, 
    ethBalanceError, 
    ethBalance, 
    vaultDataError
  ]);

  // Handle errors
useEffect(() => {
  const error = vaultDataError || ethBalanceError || depositError || withdrawError || depositReceiptError || withdrawReceiptError;
  if (error) {
    console.error('Vault error:', error);
    setError(error instanceof Error ? error : new Error(String(error)));
  }
}, [vaultDataError, ethBalanceError, depositError, withdrawError, depositReceiptError, withdrawReceiptError]);

// Log balance for debugging
useEffect(() => {
  console.log('Balance Debug:', {
    timestamp: new Date().toISOString(),
    hasAddress: !!address,
    address,
    chainId,
    isSepolia: chainId === 11155111,
    balanceData: ethBalanceData ? {
      value: ethBalanceData.value.toString(),
      formatted: formatEther(ethBalanceData.value),
      symbol: ethBalanceData.symbol,
      decimals: ethBalanceData.decimals
    } : null,
    isLoading: isLoadingEthBalance,
    error: ethBalanceError ? {
      name: ethBalanceError.name,
      message: ethBalanceError.message,
      stack: ethBalanceError.stack
    } : null,
    finalDisplayBalance: ethBalance,
    isConnected: !!address
  });
  
  // Log any errors from other hooks
  if (vaultDataError) {
    console.error('Vault Data Error:', vaultDataError);
  }
  if (ethBalanceError) {
    console.error('ETH Balance Error:', ethBalanceError);
  }
}, [
  address, 
  chainId, 
  ethBalanceData, 
  isLoadingEthBalance, 
  ethBalanceError, 
  ethBalance, 
  vaultDataError
]);

return {
  userAddress: address,
  ethBalance,
  aTokenBalance,
  totalSupplied,
  isLoading: isLoadingVaultData,
  isLoadingEthBalance,
  isDepositing,
  isWithdrawing,
  isDepositProcessing,
  isWithdrawProcessing,
  depositHash,
  withdrawHash,
  isDepositSuccess,
  isWithdrawSuccess,
  error: error || ethBalanceError || vaultDataError || depositError || withdrawError || depositReceiptError || withdrawReceiptError,
  handleDeposit,
  handleWithdraw,
  refetch: () => {
    refetchVaultData();
    refetchEthBalance();
  },
} as const;
}