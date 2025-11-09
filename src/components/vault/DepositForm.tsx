// src/components/vault/DepositForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVault } from '@/hooks/useVault';
import { parseEther } from 'viem';

export function DepositForm() {
  const [amount, setAmount] = useState('');
  const { 
    ethBalance,
    handleDeposit, 
    isDepositing,
    isDepositProcessing,
    isDepositSuccess,
    error: depositError
  } = useVault();

  const handleMax = () => {
    if (ethBalance) {
      setAmount(ethBalance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (ethBalance && parseFloat(amount) > parseFloat(ethBalance)) {
      setError('Insufficient balance');
      return;
    }

    try {
      await handleDeposit(amount);
    } catch (error) {
      console.error('Deposit failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process deposit');
    }
  };

  // Check if the deposit amount is valid
  const isAmountValid = () => {
    if (!amount) return false;
    const amountWei = parseEther(amount);
    const balanceWei = parseEther(ethBalance || '0');
    return amountWei > 0n && amountWei <= balanceWei;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="deposit-amount">Amount (ETH)</Label>
          <span className="text-sm text-muted-foreground">
            Balance: {ethBalance} ETH
          </span>
        </div>
        <div className="flex space-x-2">
          <Input
            id="deposit-amount"
            type="number"
            step="0.000000000000000001"
            min="0"
            max={ethBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleMax}
            disabled={!ethBalance || parseFloat(ethBalance) <= 0}
          >
            Max
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!isAmountValid() || isDepositing}
      >
        {isDepositing || isDepositProcessing ? 'Processing...' : 'Deposit ETH'}
      </Button>

      {isDepositSuccess && (
        <div className="text-green-500 text-sm">Deposit successful!</div>
      )}
      {depositError && (
        <div className="text-red-500 text-sm">
          Error: {depositError.message || 'Transaction failed'}
        </div>
      )}
    </form>
  );
}

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useVault } from '@/hooks/useVault';
// import { parseUnits } from 'viem';

// export function DepositForm() {
//   const [amount, setAmount] = useState('');
//   const { 
//     usdcBalance, 
//     allowance, 
//     approve, 
//     deposit, 
//     isApproving, 
//     isDepositing,
//     sharePrice
//   } = useVault();

//   const needsApproval = parseFloat(amount) > 0 && 
//     (BigInt(allowance) === 0n || (allowance && parseUnits(amount, 6) > BigInt(allowance)));

//   const handleMax = () => {
//     setAmount(usdcBalance.toString());
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!amount || parseFloat(amount) <= 0) return;

//     try {
//       if (needsApproval) {
//         await approve(amount);
//       } else {
//         await deposit(amount);
//         setAmount('');
//       }
//     } catch (error) {
//       console.error('Transaction failed:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label htmlFor="deposit-amount">Amount (USDC)</Label>
//           <span className="text-sm text-muted-foreground">
//             Balance: {usdcBalance} USDC
//           </span>
//         </div>
//         <div className="relative">
//           <Input
//             id="deposit-amount"
//             type="number"
//             step="0.01"
//             min="0"
//             placeholder="0.00"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="pr-20"
//           />
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
//             onClick={handleMax}
//           >
//             MAX
//           </Button>
//         </div>
//       </div>

//       {parseFloat(amount) > 0 && (
//         <div className="rounded-lg bg-muted p-3 text-sm">
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">You'll receive:</span>
//             <span className="font-medium">
//               {(parseFloat(amount) / parseFloat(sharePrice || '1')).toFixed(6)} shares
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">Exchange rate:</span>
//             <span className="font-medium">1 share = ${sharePrice} USDC</span>
//           </div>
//         </div>
//       )}

//       <Button 
//         type="submit" 
//         className="w-full"
//         disabled={!amount || parseFloat(amount) <= 0 || isApproving || isDepositing}
//       >
//         {isApproving ? (
//           'Approving...'
//         ) : isDepositing ? (
//           'Depositing...'
//         ) : needsApproval ? (
//           'Approve USDC'
//         ) : (
//           'Deposit'
//         )}
//       </Button>
//     </form>
//   );
// }
