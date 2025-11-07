// AAVE V3 Sepolia addresses
export const AAVE_POOL_ADDRESS = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as const;
export const AAVE_POOL_DATA_PROVIDER = '0x3e9708d80f7B3e431180130bF846E7cC0aBcC163' as const;

// Token addresses on Sepolia
export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

export const CHAIN_ID = 11155111; // Sepolia

export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// Default gas settings
export const DEFAULT_GAS_LIMIT = 1_000_000;
export const DEFAULT_GAS_PRICE = 2; // in gwei
