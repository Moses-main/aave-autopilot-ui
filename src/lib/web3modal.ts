import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { sepolia } from 'wagmi/chains';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Create wagmiConfig
const metadata = {
  name: 'AAVE Autopilot',
  description: 'AAVE V3 Autopilot Interface',
  url: 'https://aave-autopilot.xyz', // Update with your domain
  icons: ['https://aave.com/favicon.ico']
};

const chains = [sepolia];

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// 3. Create modal
export const web3modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent-color': '#7c3aed', // Purple-600
    '--w3m-background-color': '#7c3aed',
    '--w3m-overlay-backdrop-filter': 'blur(8px)',
  },
});
