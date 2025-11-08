// AAVE V3 Sepolia addresses
export const AAVE_POOL_ADDRESS = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as const;
export const AAVE_POOL_DATA_PROVIDER = '0x9B2F5546AaE6fC2eE3BEaD55c59eB7eD8648aFe1' as const;

// Token addresses on Sepolia
export const USDC_ADDRESS = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8' as const;

export const CHAIN_ID = 11155111; // Sepolia

export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// Default gas settings
export const DEFAULT_GAS_LIMIT = 1_000_000;
export const DEFAULT_GAS_PRICE = 2; // in gwei
