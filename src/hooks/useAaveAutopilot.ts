import React from 'react';
import { 
  useContractRead, 
  useContractWrite, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { getContractAddress } from '../lib/contracts';
import { AaveAutopilotABI } from '../lib/abis/AaveAutopilot';

export function useAaveAutopilot() {
  const vaultAddress = getContractAddress('vault');

  // Read user account data
  const { 
    data: userAccountData,
    refetch: refetchUserData,
    isLoading: isLoadingUserData,
    error: userDataError
  } = useContractRead({
    address: vaultAddress,
    abi: AaveAutopilotABI,
    functionName: 'getUserAccountData',
    args: [],
  });

  // Deposit function
  const { 
    writeContract: deposit, 
    data: depositHash,
    isPending: isDepositing,
    error: depositError
  } = useContractWrite();

  // Withdraw function
  const { 
    writeContract: withdraw, 
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError
  } = useContractWrite();

  // Wait for deposit transaction
  const { 
    isLoading: isDepositProcessing, 
    isSuccess: isDepositSuccess 
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Wait for withdraw transaction
  const { 
    isLoading: isWithdrawProcessing,
    isSuccess: isWithdrawSuccess
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Refetch user data when transactions are successful
  React.useEffect(() => {
    if (isDepositSuccess || isWithdrawSuccess) {
      refetchUserData();
    }
  }, [isDepositSuccess, isWithdrawSuccess, refetchUserData]);

  // Handle deposit
  const handleDeposit = (amount: bigint) => {
    deposit({
      address: vaultAddress,
      abi: AaveAutopilotABI,
      functionName: 'deposit',
      args: [amount],
    });
  };

  // Handle withdraw
  const handleWithdraw = (amount: bigint) => {
    withdraw({
      address: vaultAddress,
      abi: AaveAutopilotABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  return {
    // Account data
    userAccountData,
    isLoadingUserData,
    userDataError,
    refetchUserData,
    
    // Deposit
    deposit: handleDeposit,
    isDepositing,
    isDepositProcessing,
    isDepositSuccess,
    depositError,
    
    // Withdraw
    withdraw: handleWithdraw,
    isWithdrawing,
    isWithdrawProcessing,
    isWithdrawSuccess,
    withdrawError,
  };
}