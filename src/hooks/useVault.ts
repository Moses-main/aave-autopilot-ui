import { useState, useEffect, useMemo } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useBalance,
  useReadContracts,
  useChainId,
} from 'wagmi';
import { formatEther, parseEther, type Address } from 'viem';
import { AaveAutopilotABI } from '../lib/abis/AaveAutopilot';
import { getContractAddress } from '../lib/contracts';

interface VaultData {
  userAddress?: `0x${string}`;
  ethBalance: string;
  aTokenBalance: string;
  totalSupplied: string;
  isLoading: boolean;
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
  const { address } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<Error | null>(null);

  // Get ETH balance
  const { 
    data: ethBalanceData,
    refetch: refetchEthBalance,
    error: ethBalanceError,
    isPending: isLoadingEthBalance
  } = useBalance({
    address: address as Address,
    chainId,
  });

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

  // Format balances
  const ethBalance = useMemo(() => {
    return ethBalanceData ? formatEther(ethBalanceData.value) : '0';
  }, [ethBalanceData]);

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
    if (ethBalanceData) {
      console.log('ETH Balance:', {
        formatted: formatEther(ethBalanceData.value),
        value: ethBalanceData.value.toString(),
        decimals: ethBalanceData.decimals,
        symbol: ethBalanceData.symbol
      });
    }
  }, [ethBalanceData]);

  const isLoading = isLoadingVaultData || isLoadingEthBalance;

  return {
    userAddress: address,
    ethBalance,
    aTokenBalance,
    totalSupplied,
    isLoading,
    isDepositing,
    isWithdrawing,
    isDepositProcessing,
    isWithdrawProcessing,
    depositHash,
    withdrawHash,
    isDepositSuccess,
    isWithdrawSuccess,
    error,
    handleDeposit,
    handleWithdraw,
    refetch: () => {
      refetchVaultData();
      refetchEthBalance();
    },
  };
}