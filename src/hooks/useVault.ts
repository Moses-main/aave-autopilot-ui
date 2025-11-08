// src/hooks/useVault.ts
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { AaveAutopilotABI } from '../lib/abis/AaveAutopilot';
import { getContractAddress } from '../lib/contracts';

export function useVault() {
  const { address } = useAccount();
  const [, setAmount] = useState('');

  // Read vault data
  const { 
    data: vaultData,
    refetch: refetchVaultData
  } = useReadContract({
    address: getContractAddress('vault'),
    abi: AaveAutopilotABI,
    functionName: 'getUserAccountData',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // USDC allowance
  const { 
    data: allowance,
    refetch: refetchAllowance
  } = useReadContract({
    address: getContractAddress('usdc'),
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, getContractAddress('vault')],
    query: {
      enabled: !!address,
    },
  });

  // USDC balance
  const { 
    data: usdcBalance,
    refetch: refetchUsdcBalance
  } = useReadContract({
    address: getContractAddress('usdc'),
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // Approve USDC
  const { 
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
    error: approveError
  } = useWriteContract();

  // Deposit to vault
  const { 
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositing,
    error: depositError
  } = useWriteContract();

  // Wait for approve transaction
  const { 
    isSuccess: isApproveSuccess
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for deposit transaction
  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Handle transaction side effects
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
    if (isDepositSuccess) {
      refetchVaultData();
      refetchUsdcBalance();
      setAmount('');
    }
  }, [isApproveSuccess, isDepositSuccess, refetchAllowance, refetchVaultData, refetchUsdcBalance, setAmount]);

  // Handle approve
  const handleApprove = (amount: string) => {
    if (!address) return;
    
    const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
    
    approve({
      address: getContractAddress('usdc'),
      abi: erc20Abi,
      functionName: 'approve',
      args: [getContractAddress('vault'), amountWei],
    });
  };

  // Handle deposit
  const handleDeposit = (amount: string) => {
    if (!address) return;
    
    const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
    
    deposit({
      address: getContractAddress('vault'),
      abi: AaveAutopilotABI,
      functionName: 'deposit',
      args: [amountWei, address],
    });
  };

  // Format balances
  const formattedUsdcBalance = usdcBalance ? formatUnits(usdcBalance, 6) : '0';
  const formattedAllowance = allowance ? formatUnits(allowance, 6) : '0';

  return {
    // Balances
    usdcBalance: formattedUsdcBalance,
    allowance: formattedAllowance,
    vaultData,
    
    // Actions
    approve: handleApprove,
    deposit: handleDeposit,
    
    // Loading states
    isApproving,
    isDepositing,
    
    // Success states
    isApproveSuccess,
    isDepositSuccess,
    
    // Errors
    approveError,
    depositError,
    
    // Refetch functions
    refetchVaultData,
    refetchAllowance,
    refetchUsdcBalance,
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