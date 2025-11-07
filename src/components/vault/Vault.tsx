import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PositionOverview } from './PositionOverview';
import { TokenForm } from './TokenForm';
import { useAaveV3 } from '@/hooks/useAaveV3';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { USDC_ADDRESS } from '@/lib/constants';
import { useState } from 'react';
import { VaultState } from '@/types/aave';

// USDC token on Sepolia
export const USDC_TOKEN = {
  address: USDC_ADDRESS as `0x${string}`,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
};

export function Vault() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('deposit');
  
  // Get user's USDC balance
  const { data: usdcBalanceData } = useBalance({
    address,
    token: USDC_TOKEN.address,
  });
  
  const walletUsdcBalance = usdcBalanceData?.value || 0n;
  
  // Get user's AAVE position
  const { 
    supply, 
    withdraw,
    isSupplying,
    isWithdrawing,
    aTokenBalance,
    totalSupplied,
    healthFactor,
    isLoading: isAaveLoading
  } = useAaveV3();
  
  // Format values for display
  const formattedWalletBalance = walletUsdcBalance;
  
  // Create position object for PositionOverview
  const position: VaultState = {
    positions: [{
      asset: USDC_TOKEN,
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
    totalSuppliedUSD: totalSupplied,
    totalBorrowedUSD: '0',
    healthFactor: parseFloat(healthFactor) || 0,
    currentLiquidationThreshold: 0.8, // Default value, should be fetched from AAVE
    loanToValue: 0,
    availableBorrowsUSD: '0',
  };
  
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

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AAVE V3 Autopilot</h1>
          <ConnectButton />
        </div>
      
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit USDC</CardTitle>
                <CardDescription>
                  Deposit USDC to earn yield on AAVE V3
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenForm 
                  token={USDC_TOKEN}
                  balance={formattedWalletBalance}
                  action="supply"
                  onSubmit={handleSupply}
                  isLoading={isSupplying}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw USDC</CardTitle>
                <CardDescription>
                  Withdraw USDC from your AAVE V3 position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenForm 
                  token={USDC_TOKEN}
                  balance={BigInt(aTokenBalance || '0')}
                  action="withdraw"
                  onSubmit={handleWithdraw}
                  isLoading={isWithdrawing}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <PositionOverview 
            position={position}
            isLoading={isAaveLoading}
          />
        </div>
      </div>
    </div>
  );
}
