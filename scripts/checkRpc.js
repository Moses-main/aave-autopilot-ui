const fetch = require('node-fetch');

async function checkRpc() {
  const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/igSo1TQOzun0wSumQjuIM';
  
  const payload = {
    jsonrpc: "2.0",
    method: "eth_chainId",
    params: [],
    id: 1
  };

  try {
    console.log('Testing RPC URL:', RPC_URL);
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('RPC Response:', JSON.stringify(data, null, 2));
    
    if (data.result) {
      const chainId = parseInt(data.result, 16);
      console.log(`Chain ID: ${chainId} (${chainId === 11155111 ? 'Sepolia' : 'Unknown'})`);
    }
    
  } catch (error) {
    console.error('RPC Test Failed:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

checkRpc();
