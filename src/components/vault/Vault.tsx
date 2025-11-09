import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PositionOverview } from './PositionOverview';
import { TokenForm } from './TokenForm';
import { useAaveV3 } from '@/hooks/useAaveV3';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { VaultState } from '@/types/aave';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// ETH token configuration
export const ETH_TOKEN = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`,
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
};

export function Vault() {
  const { address } = useAccount();
  // Get user's ETH balance with error handling
  const { 
    data: ethBalanceData, 
    isLoading: isBalanceLoading,
    error: balanceError 
  } = useBalance({
    address,
    chainId: 11155111, // Sepolia chain ID
  });
  
  const walletEthBalance = ethBalanceData?.value || 0n;
  
  // Get user's AAVE position with error handling
  const { 
    supply, 
    withdraw,
    isSupplying,
    isWithdrawing,
    aTokenBalance,
    totalSupplied,
    healthFactor,
    isLoading: isAaveLoading,
    error: aaveError
  } = useAaveV3();
  
  // Track if we're still loading initial data
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Track any errors
  const [error, setError] = useState<string | null>(null);
  
  // Set loading state based on all loading states
  useEffect(() => {
    if (!isAaveLoading && !isBalanceLoading) {
      setIsInitialLoading(false);
    }
  }, [isAaveLoading, isBalanceLoading]);
  
  // Handle errors
  useEffect(() => {
    if (balanceError) {
      setError(`Failed to load wallet balance: ${balanceError.message}`);
    } else if (aaveError) {
      setError(`Failed to load AAVE data: ${aaveError}`);
    } else {
      setError(null);
    }
  }, [balanceError, aaveError]);
  
  // Format values for display
  const formattedWalletBalance = walletEthBalance;
  
  // Create vault state with proper typing and null checks
  const vaultState: VaultState = (() => {
    // Default empty state
    const defaultState: VaultState = {
      positions: [{
        asset: ETH_TOKEN,
        supplied: BigInt(0),
        suppliedUSD: '0',
        borrowed: BigInt(0),
        borrowedUSD: '0',
        availableToBorrow: BigInt(0),
        availableToBorrowUSD: '0',
        apy: {
          supply: 0,
          variableBorrow: 0,
          stableBorrow: 0,
        }
      }],
      totalSuppliedUSD: '0',
      totalBorrowedUSD: '0',
      healthFactor: 0,
      currentLiquidationThreshold: 0.8,
      loanToValue: 0,
      availableBorrowsUSD: '0',
    };
    
    if (isAaveLoading || isBalanceLoading) {
      return defaultState;
    }
    
    // Parse health factor safely
    let parsedHealthFactor = 0;
    try {
      parsedHealthFactor = typeof healthFactor === 'string' 
        ? parseFloat(healthFactor) 
        : (healthFactor || 0);
    } catch (e) {
      console.error('Error parsing health factor:', e);
    }
    
    return {
      ...defaultState,
      positions: [{
        ...defaultState.positions[0],
        supplied: BigInt(aTokenBalance || '0'),
        suppliedUSD: totalSupplied || '0',
      }],
      totalSuppliedUSD: totalSupplied || '0',
      healthFactor: parsedHealthFactor,
    };
  })();

  // We'll use the full vaultState for the PositionOverview component
  
  // Handle supply action
  const handleSupply = async (amount: string) => {
    if (!amount) return;
    await supply(amount);
  };
  
  // Handle withdraw action
  const handleWithdraw = async (amount: string) => {
    if (!amount) return;
    await withdraw(amount);
  };

  // Show loading skeleton
  if (isInitialLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  // Show error message if any
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AAVE V3 Autopilot</h1>
            <p className="text-muted-foreground">Earn yield on your ETH with AAVE V3</p>
          </div>
          <ConnectButton />
        </div>

        <Tabs 
          defaultValue="deposit" 
          className="w-full max-w-2xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Deposit ETH</h3>
                    <p className="text-sm text-muted-foreground">
                      Deposit ETH to start earning yield on AAVE V3
                    </p>
                  </div>

                  <TokenForm
                    token={ETH_TOKEN}
                    balance={formattedWalletBalance}
                    action="supply"
                    onSubmit={handleSupply}
                    isLoading={isSupplying}
                    apy={1.8} // Example APY for ETH, replace with actual value
                  />
                </div>
              </CardContent>
            </Card>

            <PositionOverview 
              position={vaultState}
              isLoading={isAaveLoading}
            />
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">Withdraw ETH</h3>
                  <p className="text-sm text-muted-foreground">
                    Withdraw ETH from your AAVE V3 position
                  </p>
                </div>
                <TokenForm
                  token={ETH_TOKEN}
                  balance={BigInt(aTokenBalance || 0)}
                  action="withdraw"
                  onSubmit={handleWithdraw}
                  maxAmount={BigInt(totalSupplied || 0)}
                  isLoading={isWithdrawing}
                  apy={1.8} // Example APY for ETH, replace with actual value
                />
              </CardContent>
            </Card>

            <PositionOverview 
              position={vaultState}
              isLoading={isAaveLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
