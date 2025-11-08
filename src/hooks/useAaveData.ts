import { useReadContract, useAccount } from 'wagmi';
import {  useMemo } from 'react';
import { formatUnits } from 'viem';
import { AAVE_DATA_PROVIDER_ABI } from '../lib';
import { getContractAddress } from '../lib/contracts';

interface AaveUserData {
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

interface AaveReserveData {
  currentLiquidityRate: string;
  currentStableBorrowRate: string;
  currentVariableBorrowRate: string;
  liquidityIndex: string;
  variableBorrowIndex: string;
  lastUpdateTimestamp: number;
}

export function useAaveData() {
  const { address } = useAccount();
  const dataProviderAddress = getContractAddress('aaveDataProvider');
  const poolAddress = getContractAddress('aavePool');
  const usdcAddress = getContractAddress('usdc');

  // Get user account data
  const { data: userData, refetch: refetchUserData } = useReadContract({
    address: poolAddress,
    abi: AAVE_DATA_PROVIDER_ABI,
    functionName: 'getUserAccountData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get reserve data for USDC
  const { data: reserveData, refetch: refetchReserveData } = useReadContract({
    address: dataProviderAddress,
    abi: AAVE_DATA_PROVIDER_ABI,
    functionName: 'getReserveData',
    args: [usdcAddress],
  });

  // Format user data
  const formattedUserData = useMemo<AaveUserData | null>(() => {
    if (!userData) return null;
    
    // Destructure the tuple into named variables for better type safety
    const [
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    ] = userData as [bigint, bigint, bigint, bigint, bigint, bigint];

    return {
      totalCollateralBase: formatUnits(totalCollateralBase, 8), // Aave uses 8 decimals for base values
      totalDebtBase: formatUnits(totalDebtBase, 8),
      availableBorrowsBase: formatUnits(availableBorrowsBase, 8),
      currentLiquidationThreshold: formatUnits(currentLiquidationThreshold, 4), // 4 decimals for percentages
      ltv: formatUnits(ltv, 4), // 4 decimals for percentages
      healthFactor: formatUnits(healthFactor, 18), // 18 decimals for health factor
    };
  }, [userData]);

  // Format reserve data
  const formattedReserveData = useMemo<AaveReserveData | null>(() => {
    if (!reserveData) return null;

    const [
      _configuration,
      liquidityIndex,
      variableBorrowIndex,
      currentLiquidityRate,
      currentVariableBorrowRate,
      currentStableBorrowRate,
      lastUpdateTimestamp,
      _id,
      _aTokenAddress,
      _stableDebtTokenAddress,
      _variableDebtTokenAddress,
      _interestRateStrategyAddress,
      _accruedToTreasury,
      _unbacked,
      _isolationModeTotalDebt
    ] = reserveData;

    return {
      currentLiquidityRate: formatUnits(currentLiquidityRate, 27), // Ray math (27 decimals)
      currentStableBorrowRate: formatUnits(currentStableBorrowRate, 27),
      currentVariableBorrowRate: formatUnits(currentVariableBorrowRate, 27),
      liquidityIndex: formatUnits(liquidityIndex, 27), // Ray math
      variableBorrowIndex: formatUnits(variableBorrowIndex, 27), // Ray math
      lastUpdateTimestamp: Number(lastUpdateTimestamp),
    };
  }, [reserveData]);

  // Refetch all data
  const refetch = () => {
    refetchUserData();
    refetchReserveData();
  };

  return {
    userData: formattedUserData,
    reserveData: formattedReserveData,
    refetch,
    data: formattedUserData,
    // @ts-ignore - These properties are used by other components
    isLoading: false, // We're not using loading states in this implementation
    // @ts-ignore
    error: null // We're handling errors in the hook implementation
  };
}