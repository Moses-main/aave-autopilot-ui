import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther, parseEther, type Address } from 'viem';

interface DepositFormV2Props {
  onDeposit: (amount: string) => Promise<void>;
  isDepositing: boolean;
  isDepositProcessing: boolean;
  depositError: Error | null;
}

export function DepositFormV2({
  onDeposit,
  isDepositing,
  isDepositProcessing,
  depositError,
}: DepositFormV2Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // Get the native ETH balance
  const { 
    data: balanceData, 
    error: balanceError,
    isPending: isLoadingBalance,
    refetch: refetchBalance
  } = useBalance({
    address: address as Address,
    chainId: 11155111, // Sepolia
  });

  // Format the balance for display
  const formattedBalance = useMemo(() => {
    if (!balanceData) return '0.0000';
    return Number(formatEther(balanceData.value)).toFixed(4);
  }, [balanceData]);

  // Handle max button click
  const handleMax = () => {
    if (!balanceData) return;
    setAmount(Number(formatEther(balanceData.value)).toFixed(6));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await onDeposit(amount);
      setAmount('');
      // Refresh balance after successful deposit
      refetchBalance();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process deposit';
      setError(errorMessage);
      console.error('Deposit error:', error);
    }
  };

  // Log balance data for debugging
  useEffect(() => {
    console.log('DepositFormV2 - Balance Data:', {
      address,
      chainId,
      balance: balanceData ? formatEther(balanceData.value) : null,
      formattedBalance,
      isLoadingBalance,
      balanceError: balanceError?.message,
    });
  }, [address, chainId, balanceData, formattedBalance, isLoadingBalance, balanceError]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="deposit-amount">Amount to Deposit</Label>
          <div className="text-sm text-muted-foreground">
            {isLoadingBalance ? (
              'Loading balance...'
            ) : (
              <>
                Balance: {formattedBalance} ETH
                {balanceData && (
                  <button
                    type="button"
                    onClick={handleMax}
                    className="ml-2 text-primary hover:underline"
                    disabled={!isConnected || isLoadingBalance}
                  >
                    Max
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Input
            id="deposit-amount"
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isConnected || isDepositing || isDepositProcessing}
            className="pr-16"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-muted-foreground text-sm">ETH</span>
          </div>
        </div>
      </div>

      {(error || depositError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || depositError?.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={
          !isConnected || 
          !amount || 
          isDepositing || 
          isDepositProcessing || 
          isLoadingBalance
        }
        className="w-full"
      >
        {isDepositing || isDepositProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isDepositing ? 'Approving...' : 'Processing...'}
          </>
        ) : (
          'Deposit ETH'
        )}
      </Button>
    </div>
  );
}
