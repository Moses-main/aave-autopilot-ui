import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VaultStats } from './VaultStats';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';
import { useVault } from '@/hooks/useVault';

export function Vault() {
  const { totalAssets, sharePrice, userBalance, usdcBalance, isLoading } = useVault();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AAVE Autopilot Vault</h1>
          <p className="text-muted-foreground">
            Automate your AAVE v3 positions with our ERC-4626 vault
          </p>
        </div>

        <VaultStats 
          totalAssets={totalAssets}
          sharePrice={sharePrice}
          userBalance={userBalance}
          usdcBalance={usdcBalance}
          isLoading={isLoading}
        />

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <Card>
              <CardHeader>
                <CardTitle>Deposit USDC</CardTitle>
                <CardDescription>
                  Deposit USDC to earn yield and borrow against your collateral
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepositForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw USDC</CardTitle>
                <CardDescription>
                  Withdraw your USDC from the vault
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WithdrawForm />
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
