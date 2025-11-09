import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Import components
import { PositionManagement } from './PositionManagement';
import { HealthFactorSettings } from './HealthFactorSettings';
import { KeeperManagement } from './KeeperManagement';
import { AdminControls } from './AdminControls';
import { TokenForm } from './TokenForm';

// ETH token configuration
export const ETH_TOKEN = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`,
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
};

export function Vault() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API/contract calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setError(null);
      } catch (err) {
        setError('Failed to load vault data. Please try again.');
        console.error('Error loading vault data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [address]); // Re-run when address changes

  // Show loading skeleton
  if (isLoading) {
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
  
  // Mock data - these would come from your hooks in a real implementation
  const formattedWalletBalance = 0n;
  const aTokenBalance = '0';
  const totalSupplied = '0';
  const isSupplying = false;
  const isWithdrawing = false;

  // Mock handlers - these would be implemented in your hooks
  const handleSupply = async (amount: string) => {
    try {
      console.log('Depositing:', amount);
      // In a real implementation, this would call your contract
      // await contract.supply(amount);
      return Promise.resolve();
    } catch (err) {
      setError('Failed to process deposit. Please try again.');
      console.error('Deposit error:', err);
      throw err;
    }
  };

  const handleWithdraw = async (amount: string) => {
    try {
      console.log('Withdrawing:', amount);
      // In a real implementation, this would call your contract
      // await contract.withdraw(amount);
      return Promise.resolve();
    } catch (err) {
      setError('Failed to process withdrawal. Please try again.');
      console.error('Withdrawal error:', err);
      throw err;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AAVE V3 Autopilot</h1>
            <p className="text-muted-foreground">Earn yield on your ETH with AAVE V3</p>
          </div>
          <ConnectButton />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!address ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect your wallet to continue</h2>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="position" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="position" className="space-y-6">
              <PositionManagement />
              <div className="grid gap-6 md:grid-cols-2">
                <HealthFactorSettings />
                <KeeperManagement />
              </div>
              <AdminControls />
            </TabsContent>

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
                      apy={1.8}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdraw">
              <Card>
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
                    maxAmount={BigInt(totalSupplied || 0)}
                    onSubmit={handleWithdraw}
                    isLoading={isWithdrawing}
                    apy={1.8}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <HealthFactorSettings />
                <KeeperManagement />
              </div>
              <AdminControls />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
