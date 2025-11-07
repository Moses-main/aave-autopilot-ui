import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatUnits, parseUnits } from 'viem';
import { Token } from '@/types/aave';
import { formatNumber, formatUSD } from '@/lib/utils';

interface TokenFormProps {
  token: Token;
  balance: bigint;
  action: 'supply' | 'withdraw';
  onSubmit: (amount: string) => Promise<void>;
  maxAmount?: bigint;
  isLoading?: boolean;
  apy?: number;
}

export function TokenForm({
  token,
  balance,
  action,
  onSubmit,
  maxAmount,
  isLoading = false,
  apy,
}: TokenFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const balanceFormatted = formatUnits(balance, token.decimals);
  const maxAmountFormatted = maxAmount ? formatUnits(maxAmount, token.decimals) : balanceFormatted;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(amount);
      setAmount('');
    } catch (error) {
      console.error(`Error ${action}ing ${token.symbol}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMax = () => {
    setAmount(maxAmountFormatted);
  };

  const buttonText = isSubmitting 
    ? 'Processing...' 
    : `${action === 'supply' ? 'Supply' : 'Withdraw'} ${token.symbol}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="amount">Amount</Label>
          <div className="text-sm text-muted-foreground">
            Balance: {formatNumber(balanceFormatted, 6)} {token.symbol}
          </div>
        </div>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="any"
            min="0"
            max={maxAmountFormatted}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`0.00 ${token.symbol}`}
            className="pr-20 text-lg py-6"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
            onClick={handleMax}
          >
            MAX
          </Button>
        </div>
        {apy !== undefined && (
          <div className="text-sm text-muted-foreground">
            APY: {formatNumber(apy, 2)}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {action === 'supply' ? 'You will supply' : 'You will receive'}
          </span>
          <span className="font-medium">
            {amount || '0'} {token.symbol}
          </span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full py-6 text-base"
        disabled={!amount || isSubmitting || isLoading}
      >
        {buttonText}
      </Button>
    </form>
  );
}
