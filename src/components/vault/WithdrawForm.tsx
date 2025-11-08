import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVault } from '@/hooks/useVault';

export function WithdrawForm() {
  const [amount, setAmount] = useState('');
  const { 
    usdcBalance,
    // Use deposit as a temporary workaround for withdraw
    deposit: withdraw,
    isDepositing: isWithdrawing,
  } = useVault();
  
  // Use usdcBalance as vaultBalance for now
  const vaultBalance = usdcBalance;
  const sharePrice = '1.0';

  const handleMax = () => {
    setAmount(vaultBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await withdraw(amount);
      setAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
          <span className="text-sm text-muted-foreground">
            Balance: {vaultBalance} shares
          </span>
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
        disabled={!amount || parseFloat(amount) <= 0 || isWithdrawing}
      >
        {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
      </Button>
    </form>
  );
}
