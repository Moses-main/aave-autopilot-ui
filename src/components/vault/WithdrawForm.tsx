import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVault } from '@/hooks/useVault';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function WithdrawForm() {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { 
    aTokenBalance,
    handleWithdraw,
    isWithdrawing,
    isWithdrawProcessing,
    isWithdrawSuccess,
    error: withdrawError
  } = useVault();
  
  const vaultBalance = aTokenBalance || '0';
  const sharePrice = '1.0';

  const handleMax = () => {
    setAmount(vaultBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(vaultBalance)) {
      setError('Insufficient balance');
      return;
    }

    try {
      await handleWithdraw(amount);
      setAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process withdrawal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="withdraw-amount">Amount (aUSDC)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Balance: {vaultBalance}
            </span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleMax}
              disabled={!vaultBalance || parseFloat(vaultBalance) <= 0}
            >
              Max
            </Button>
          </div>
        </div>
        <div className="relative">
          <Input
            id="withdraw-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pr-20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
            onClick={handleMax}
          >
            MAX
          </Button>
        </div>
      </div>

      {parseFloat(amount) > 0 && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">You'll receive:</span>
            <span className="font-medium">
              {amount} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange rate:</span>
            <span className="font-medium">1 share = ${sharePrice} USDC</span>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!amount || parseFloat(amount) <= 0 || isWithdrawing || isWithdrawProcessing}
      >
        {isWithdrawing || isWithdrawProcessing ? 'Processing...' : 'Withdraw'}
      </Button>

      {isWithdrawSuccess && (
        <div className="text-green-500 text-sm">Withdrawal successful!</div>
      )}
      
      {(error || withdrawError) && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || String(withdrawError)}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
