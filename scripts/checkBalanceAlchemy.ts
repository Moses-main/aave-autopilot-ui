import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';

const address = '0xe81e8078f2D284C92D6d97B5d4769af81e0cA11C' as const;
const ALCHEMY_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/igSo1TQOzun0wSumQjuIM';

async function checkBalance() {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(ALCHEMY_RPC_URL)
  });

  try {
    console.log('Connected to Sepolia network via Alchemy');
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
    
    // Get chain ID to verify network
    const chainId = await client.getChainId();
    console.log('Chain ID:', chainId);
    
    // Get block number to verify connectivity
    const blockNumber = await client.getBlockNumber();
    console.log('Latest block number:', Number(blockNumber));
    
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

checkBalance();
