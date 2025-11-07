import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVault } from '@/hooks/useVault';
import { parseUnits } from 'viem';

export function DepositForm() {
  const [amount, setAmount] = useState('');
  const { 
    usdcBalance, 
    allowance, 
    approve, 
    deposit, 
    isApproving, 
    isDepositing,
    sharePrice
  } = useVault();

  const needsApproval = parseFloat(amount) > 0 && 
    (BigInt(allowance) === 0n || (allowance && parseUnits(amount, 6) > BigInt(allowance)));

  const handleMax = () => {
    setAmount(usdcBalance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      if (needsApproval) {
        await approve(amount);
      } else {
        await deposit(amount);
        setAmount('');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="deposit-amount">Amount (USDC)</Label>
          <span className="text-sm text-muted-foreground">
            Balance: {usdcBalance} USDC
          </span>
        </div>
        <div className="relative">
          <Input
            id="deposit-amount"
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
              {(parseFloat(amount) / parseFloat(sharePrice || '1')).toFixed(6)} shares
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
        disabled={!amount || parseFloat(amount) <= 0 || isApproving || isDepositing}
      >
        {isApproving ? (
          'Approving...'
        ) : isDepositing ? (
          'Depositing...'
        ) : needsApproval ? (
          'Approve USDC'
        ) : (
          'Deposit'
        )}
      </Button>
    </form>
  );
}
