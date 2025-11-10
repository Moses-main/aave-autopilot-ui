import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export function BalanceTest() {
  const { address, isConnected } = useAccount();
  
  // Direct balance fetch with minimal configuration
  const { data: balanceData, error, isLoading } = useBalance({
    address,
    chainId: 11155111, // Sepolia
    watch: true,
  });

  console.log('Balance Test Component:', {
    address,
    isConnected,
    balanceData,
    error,
    isLoading,
    timestamp: new Date().toISOString()
  });

  return (
    <div style={{ 
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      zIndex: 9999
    }}>
      <h3>Balance Test</h3>
      <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
      <div>Address: {address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'Not connected'}</div>
      {isLoading && <div>Loading balance...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {balanceData && (
        <div>
          Balance: {formatEther(balanceData.value)} {balanceData.symbol}
        </div>
      )}
    </div>
  );
}
