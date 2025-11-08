// src/components/vault/DepositForm.tsx
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
    isApproveSuccess,
    isDepositSuccess,
    approveError,
    depositError
  } = useVault();

  const needsApproval = parseFloat(amount) > 0 && 
    (BigInt(parseUnits(allowance || '0', 6)) === 0n || 
     parseUnits(amount, 6) > BigInt(parseUnits(allowance || '0', 6)));

  const handleMax = () => {
    setAmount(usdcBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      if (needsApproval) {
        await approve(amount);
      } else {
        await deposit(amount);
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
        <div className="flex space-x-2">
          <Input
            id="deposit-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={handleMax}>
            Max
          </Button>
        </div>
      </div>

      {needsApproval ? (
        <Button type="submit" className="w-full" disabled={isApproving}>
          {isApproving ? 'Approving...' : 'Approve USDC'}
        </Button>
      ) : (
        <Button type="submit" className="w-full" disabled={isDepositing}>
          {isDepositing ? 'Depositing...' : 'Deposit'}
        </Button>
      )}

      {isApproveSuccess && (
        <div className="text-green-500 text-sm">Approval successful! Please confirm the deposit.</div>
      )}
      {isDepositSuccess && (
        <div className="text-green-500 text-sm">Deposit successful!</div>
      )}
      {approveError && (
        <div className="text-red-500 text-sm">Approval error: {approveError.message}</div>
      )}
      {depositError && (
        <div className="text-red-500 text-sm">Deposit error: {depositError.message}</div>
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
