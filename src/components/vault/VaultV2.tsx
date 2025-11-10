import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DepositFormV2 } from './DepositFormV2';

// ETH token configuration
export const ETH_TOKEN = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`,
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
};

export function VaultV2() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<Error | null>(null);
  
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
  }, [address]);

  // Handle deposit submission
  const handleDeposit = async (amount: string) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsDepositing(true);
      setDepositError(null);
      
      // Simulate approval and deposit
      console.log('Approving deposit of', amount, 'ETH');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDepositing(false);
      setIsDepositProcessing(true);
      
      console.log('Depositing', amount, 'ETH');
      // In a real implementation, this would call your contract
      // await contract.deposit(amount);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error('Deposit error:', err);
      const error = err instanceof Error ? err : new Error('Failed to process deposit');
      setDepositError(error);
      throw error;
    } finally {
      setIsDepositing(false);
      setIsDepositProcessing(false);
    }
  };

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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect your wallet to continue</h2>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit ETH</CardTitle>
                </CardHeader>
                <CardContent>
                  <DepositFormV2 
                    onDeposit={handleDeposit}
                    isDepositing={isDepositing}
                    isDepositProcessing={isDepositProcessing}
                    depositError={depositError}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="withdraw">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw ETH</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Withdrawal functionality coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
