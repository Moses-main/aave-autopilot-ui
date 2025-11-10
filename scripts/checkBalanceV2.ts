import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

const address = '0xe81e8078f2D284C92D6d97B5d4769af81e0cA11C' as const;

// Available RPC endpoints
const RPC_ENDPOINTS = [
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://rpc2.sepolia.org'
];

async function checkBalance() {
  // Try each RPC endpoint until one works
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      console.log(`Trying RPC: ${rpcUrl}`);
      
      const client = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl, {
          timeout: 5000, // 5 second timeout
        })
      });

      // Test the connection
      const chainId = await client.getChainId();
      if (chainId !== sepolia.id) {
        throw new Error(`Unexpected chain ID: ${chainId}`);
      }

      console.log('Connected to Sepolia network');
      console.log('RPC Endpoint:', rpcUrl);
      console.log('Checking balance for address:', address);
      
      // Get the balance in wei
      const balanceWei = await client.getBalance({
        address,
        blockTag: 'latest'
      });

      // Convert wei to ETH
      const balanceEth = formatEther(balanceWei);
      console.log('Balance:', balanceEth, 'ETH');
      
      // Get transaction count (nonce)
      const transactionCount = await client.getTransactionCount({
        address,
        blockTag: 'latest'
      });
      
      console.log('Transaction count:', transactionCount);
      
      // Get block number to verify connectivity
      const blockNumber = await client.getBlockNumber();
      console.log('Latest block number:', Number(blockNumber));
      
      return; // Success, exit the function
      
    } catch (error) {
      console.log(`RPC failed: ${error.message}`);
      // Try next RPC endpoint
    }
  }
  
  console.error('All RPC endpoints failed');
}

checkBalance()
  .catch(console.error);
