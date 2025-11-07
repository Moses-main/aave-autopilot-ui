import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PositionOverview } from './PositionOverview';
import { TokenForm } from './TokenForm';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useAaveV3 } from '@/hooks/useAaveV3';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDC_ADDRESS } from '@/lib/constants';
import { useState } from 'react';

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
    watch: true,
  });
  
  const usdcBalance = usdcBalanceData?.value || 0n;
  
  // Get user's AAVE position
  const { 
    userPosition, 
    isLoading, 
    supply, 
    withdraw, 
    refetch 
  } = useAaveV3();
  
  // Handle supply action
  const handleSupply = async (amount: string) => {
    if (!amount) return;
    
    const amountWei = parseUnits(amount, USDC_TOKEN.decimals);
    await supply(USDC_TOKEN.address, amount, address);
    await refetch();
  };
  
  // Handle withdraw action
  const handleWithdraw = async (amount: string) => {
    if (!amount) return;
    
    await withdraw(USDC_TOKEN.address, amount, address);
    await refetch();
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AAVE V3 Autopilot</h1>
            <p className="text-muted-foreground">Manage your AAVE V3 positions with ease</p>
          </div>
          <WalletConnectButton />
        </div>
      </div>

      <div className="space-y-8">
        <PositionOverview 
          position={userPosition} 
          isLoading={isLoading} 
        />

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Supply</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Supply {USDC_TOKEN.symbol}</CardTitle>
                <CardDescription>
                  Supply {USDC_TOKEN.symbol} to AAVE V3 to earn yield
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenForm
                  token={USDC_TOKEN}
                  balance={usdcBalance}
                  action="supply"
                  onSubmit={handleSupply}
                  isLoading={isLoading}
                  apy={userPosition?.positions[0]?.apy?.supply}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw {USDC_TOKEN.symbol}</CardTitle>
                <CardDescription>
                  Withdraw your {USDC_TOKEN.symbol} from AAVE V3
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TokenForm
                  token={USDC_TOKEN}
                  balance={userPosition?.positions[0]?.supplied || 0n}
                  action="withdraw"
                  onSubmit={handleWithdraw}
                  maxAmount={userPosition?.positions[0]?.supplied}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground">
          <p>APY: Dynamic based on AAVE v3 rates and utilization</p>
          <p className="mt-1">Withdrawals are subject to AAVE v3 liquidity conditions</p>
        </div>
      </div>
    </div>
  );
}
