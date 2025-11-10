import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

const address = '0xe81e8078f2D284C92D6d97B5d4769af81e0cA11C' as const;

async function checkBalance() {
  try {
    let clientToUse = client;
    
    // Try the primary client first
    try {
      // Test the connection
      await client.getChainId();
      console.log('Using Alchemy RPC endpoint');
    } catch (e) {
      console.log('Primary RPC failed, falling back to public RPC');
      clientToUse = fallbackClient;
    }

    console.log('Checking balance for address:', address);
    console.log('Network:', sepolia.name);
    
    // Get the balance in wei
    const balanceWei = await clientToUse.getBalance({
      address,
      blockTag: 'latest'
    });

    // Convert wei to ETH
    const balanceEth = formatEther(balanceWei);

    console.log('Balance:', balanceEth, 'ETH');
    
    // Get transaction count (nonce)
    const transactionCount = await clientToUse.getTransactionCount({
      address,
      blockTag: 'latest'
    });
    
    console.log('Transaction count:', transactionCount);
    
    // Get chain ID to verify network
    const chainId = await clientToUse.getChainId();
    console.log('Chain ID:', chainId);
    
    // Get block number to verify connectivity
    const blockNumber = await clientToUse.getBlockNumber();
    console.log('Latest block number:', Number(blockNumber));
    
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

checkBalance();
