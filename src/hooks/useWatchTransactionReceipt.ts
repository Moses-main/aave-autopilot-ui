import { useEffect } from 'react';
import { usePublicClient } from 'wagmi';

// type TransactionReceipt = {
//   status: 'success' | 'reverted';
//   transactionHash: `0x${string}`;
//   // Add other relevant fields from the receipt
// };

export function useWatchTransactionReceipt({
  hash,
  onSuccess,
  onError,
}: {
  hash?: `0x${string}` | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!hash || !publicClient) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkReceipt = async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash });
        
        if (!isMounted) return;

        if (receipt.status === 'success') {
          onSuccess?.();
        } else {
          onError?.(new Error('Transaction reverted'));
        }
      } catch (error) {
        if (isMounted) {
          // If transaction is not yet mined, check again after a delay
          if ((error as Error).message.includes('Transaction not found')) {
            timeoutId = setTimeout(checkReceipt, 2000);
          } else {
            onError?.(error as Error);
          }
        }
      }
    };

    checkReceipt();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hash, onSuccess, onError, publicClient]);

  return null;
}
