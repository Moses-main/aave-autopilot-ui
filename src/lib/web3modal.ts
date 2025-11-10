import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

// Get chain ID from environment variables or default to Sepolia
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID ? 
  Number(import.meta.env.VITE_CHAIN_ID) : 11155111;

// Configure the chain with custom RPC URL
const appChain = {
  ...sepolia,
  id: CHAIN_ID,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL]
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL]
    }
  }
};

// Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID in .env file');
}

console.log('Initializing Web3Modal with config:', {
  chainId: CHAIN_ID,
  rpcUrl: import.meta.env.VITE_RPC_URL,
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
});

// Create wagmi config
export const config = createConfig({
  chains: [appChain],
  transports: {
    [CHAIN_ID]: http(import.meta.env.VITE_RPC_URL, {
      timeout: 30000, // 30 second timeout
    }),
  },
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '9999'
        }
      }
    }),
  ],
});
