// src/hooks/useVault.ts
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { AaveAutopilotABI } from '../lib/abis/AaveAutopilot';
import { getContractAddress } from '../lib/contracts';

export function useVault() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  // Read vault data
  const { 
    data: vaultData,
    refetch: refetchVaultData,
    isLoading: isLoadingVaultData,
    error: vaultDataError
  } = useReadContract({
    address: getContractAddress('vault'),
    abi: AaveAutopilotABI,
    functionName: 'getUserAccountData',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // ETH balance
  const { 
    data: ethBalance,
    refetch: refetchEthBalance,
    isLoading: isLoadingEthBalance,
    error: ethBalanceError
  } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  // Deposit ETH to vault
  const { 
    writeContract: depositETH,
    data: depositHash,
    isPending: isDepositing,
    error: depositError
  } = useWriteContract();

  // Wait for deposit transaction
  const { 
    isSuccess: isDepositSuccess,
    isLoading: isDepositProcessing
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Handle transaction side effects
  useEffect(() => {
    if (isDepositSuccess) {
      refetchVaultData();
      refetchEthBalance();
      setAmount('');
    }
  }, [isDepositSuccess, refetchVaultData, refetchEthBalance]);

  // Handle deposit ETH
  const handleDeposit = (amount: string) => {
    if (!address || !amount) return;
    
    const amountWei = parseEther(amount);
    
    depositETH({
      address: getContractAddress('vault'),
      abi: AaveAutopilotABI,
      functionName: 'depositETH',
      value: amountWei,
      // depositETH doesn't take any arguments, it uses msg.value for the ETH amount
      // and msg.sender for the depositor
    });
  };

  // Format ETH balance for display
  const formatEthBalance = (balance: bigint | undefined) => {
    if (balance === undefined) return '0';
    return formatEther(balance);
  };

  return {
    // User data
    userAddress: address,
    ethBalance: ethBalance ? formatEthBalance(ethBalance.value) : '0',
    vaultData,
    
    // Loading states
    isLoading: isLoadingVaultData || isLoadingEthBalance || isDepositing,
    isDepositing,
    isDepositProcessing,
    
    // Transaction hash
    depositHash,
    
    // Transaction success state
    isDepositSuccess,
    
    // Errors
    error: vaultDataError || ethBalanceError || depositError,
    
    // Actions
    handleDeposit,
    refetchVaultData,
    refetchEthBalance,
  };
}
// import { useState } from 'react';
// import { useAccount, useReadContract, useWriteContract } from 'wagmi';
// import { erc20Abi, formatUnits, parseUnits, Address } from 'viem';
// import { useWatchTransactionReceipt } from './useWatchTransactionReceipt';

// // Vault ABI - simplified for our use case
// const vaultABI = [
//   {
//     inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
//     name: 'balanceOf',
//     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'totalAssets',
//     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'uint256', name: 'amount', type: 'uint256' },
//       { internalType: 'address', name: 'receiver', type: 'address' },
//     ],
//     name: 'deposit',
//     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'uint256', name: 'amount', type: 'uint256' },
//       { internalType: 'address', name: 'receiver', type: 'address' },
//       { internalType: 'address', name: 'owner', type: 'address' },
//     ],
//     name: 'withdraw',
//     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
// ] as const;

// type VaultState = {
//   // Balances
//   usdcBalance: string;
//   vaultBalance: string;
//   totalAssets: string;
//   sharePrice: string;
//   allowance: string;
  
//   // Loading states
//   isApproving: boolean;
//   isDepositing: boolean;
//   isWithdrawing: boolean;
//   isLoading: boolean;
  
//   // Transaction hashes (optional)
//   approveHash?: `0x${string}` | null;
//   depositHash?: `0x${string}` | null;
//   withdrawHash?: `0x${string}` | null;
  
//   // Actions
//   approve: (amount: string) => Promise<`0x${string}` | undefined>;
//   deposit: (amount: string) => Promise<`0x${string}` | undefined>;
//   withdraw: (amount: string) => Promise<`0x${string}` | undefined>;
  
//   // Errors
//   error: Error | null;
// };

// export function useVault(): VaultState {
//   const { address } = useAccount();
//   const vaultAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`;
//   const usdcAddress = (import.meta.env.VITE_USDC_ADDRESS || '') as `0x${string}`;
  
//   // State
//   const [isApproving, setIsApproving] = useState(false);
//   const [isDepositing, setIsDepositing] = useState(false);
//   const [isWithdrawing, setIsWithdrawing] = useState(false);
//   const [error, setError] = useState<Error | null>(null);
//   const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
//   const [depositHash, setDepositHash] = useState<`0x${string}` | null>(null);
//   const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);

//   // Read USDC balance
//   const { 
//     data: usdcBalance = 0n, 
//     refetch: refetchUsdcBalance 
//   } = useReadContract({
//     address: usdcAddress,
//     abi: erc20Abi,
//     functionName: 'balanceOf',
//     args: [address || '0x'],
//     query: { enabled: !!address }
//   });

//   // Read Vault balance
//   const { 
//     data: vaultBalance = 0n, 
//     refetch: refetchVaultBalance 
//   } = useReadContract({
//     address: vaultAddress,
//     abi: vaultABI,
//     functionName: 'balanceOf',
//     args: [address || '0x'],
//     query: { enabled: !!address }
//   });

//   // Read total assets
//   const { 
//     data: totalAssets = 0n, 
//     refetch: refetchTotalAssets 
//   } = useReadContract({
//     address: vaultAddress,
//     abi: vaultABI,
//     functionName: 'totalAssets',
//     query: { enabled: !!address }
//   });

//   // Read allowance
//   const { 
//     data: allowance = 0n, 
//     refetch: refetchAllowance 
//   } = useReadContract({
//     address: usdcAddress,
//     abi: erc20Abi,
//     functionName: 'allowance',
//     args: [address || '0x', vaultAddress],
//     query: { enabled: !!address }
//   });

//   // Write contract
//   const { writeContractAsync } = useWriteContract();

//   // Handle approve transaction
//   const approve = async (amount: string): Promise<`0x${string}` | undefined> => {
//     if (!address) {
//       setError(new Error('No wallet connected'));
//       return;
//     }

//     const amountWei = parseUnits(amount, 6);
//     setIsApproving(true);
//     setError(null);

//     try {
//       const hash = await writeContractAsync({
//         address: usdcAddress as Address,
//         abi: erc20Abi,
//         functionName: 'approve',
//         args: [vaultAddress as Address, amountWei],
//       });

//       setApproveHash(hash);
//       return hash;
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error('Failed to approve');
//       setError(error);
//       throw error;
//     } finally {
//       setIsApproving(false);
//     }
//   };

//   // Handle deposit transaction
//   const deposit = async (amount: string): Promise<`0x${string}` | undefined> => {
//     if (!address) {
//       setError(new Error('No wallet connected'));
//       return;
//     }

//     const amountWei = parseUnits(amount, 6);
//     setIsDepositing(true);
//     setError(null);

//     try {
//       const hash = await writeContractAsync({
//         address: vaultAddress as Address,
//         abi: vaultABI,
//         functionName: 'deposit',
//         args: [amountWei, address as Address],
//       });

//       setDepositHash(hash);
//       return hash;
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error('Deposit failed');
//       setError(error);
//       throw error;
//     } finally {
//       setIsDepositing(false);
//     }
//   };

//   // Handle withdraw transaction
//   const withdraw = async (amount: string): Promise<`0x${string}` | undefined> => {
//     if (!address) {
//       setError(new Error('No wallet connected'));
//       return;
//     }

//     const amountWei = parseUnits(amount, 6);
//     setIsWithdrawing(true);
//     setError(null);

//     try {
//       const hash = await writeContractAsync({
//         address: vaultAddress as Address,
//         abi: vaultABI,
//         functionName: 'withdraw',
//         args: [amountWei, address as Address, address as Address],
//       });

//       setWithdrawHash(hash);
//       return hash;
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error('Withdrawal failed');
//       setError(error);
//       throw error;
//     } finally {
//       setIsWithdrawing(false);
//     }
//   };

//   // Watch for transaction receipts and refetch data
//   useWatchTransactionReceipt({
//     hash: approveHash,
//     onSuccess: () => {
//       refetchAllowance();
//       refetchUsdcBalance();
//     },
//   });

//   useWatchTransactionReceipt({
//     hash: depositHash,
//     onSuccess: () => {
//       refetchUsdcBalance();
//       refetchVaultBalance();
//       refetchTotalAssets();
//     },
//   });

//   useWatchTransactionReceipt({
//     hash: withdrawHash,
//     onSuccess: () => {
//       refetchUsdcBalance();
//       refetchVaultBalance();
//       refetchTotalAssets();
//     },
//   });

//   // Calculate share price (1e18 precision)
//   const sharePrice = totalAssets > 0n && vaultBalance > 0n 
//     ? formatUnits((totalAssets * 10n**18n) / vaultBalance, 18)
//     : '0';

//   return {
//     // Balances
//     usdcBalance: usdcBalance?.toString() || '0',
//     vaultBalance: vaultBalance?.toString() || '0',
//     totalAssets: totalAssets?.toString() || '0',
//     sharePrice: sharePrice?.toString() || '0',
//     allowance: allowance?.toString() || '0',
    
//     // Loading states
//     isApproving,
//     isDepositing,
//     isWithdrawing,
//     isLoading: false, // Simplified for now, can be enhanced with actual loading states if needed
    
//     // Transaction hashes (convert null to undefined)
//     approveHash: approveHash || undefined,
//     depositHash: depositHash || undefined,
//     withdrawHash: withdrawHash || undefined,
    
//     // Actions
//     approve,
//     deposit,
//     withdraw,
    
//     // Errors
//     error,
//   };
// }