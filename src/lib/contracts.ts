// // src/lib/contracts.ts
// import { AaveAutopilotABI } from './abis/AaveAutopilot';

// // src/lib/contracts.ts
// type ContractName = 'aavePool' | 'aaveDataProvider' | 'usdc' | 'aUsdc' | 'linkToken' | 'keeperRegistry' | 'ethUsdPriceFeed' | 'vault';

// interface ContractAddresses {
//   [key: string]: `0x${string}`;
// }

// // Sepolia Testnet addresses from your .env
// const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
//   '11155111': { // Sepolia Testnet
//     aavePool: '0x6Ae43d3271fF6888e7Fc43Fd7321a503fF738951',
//     aaveDataProvider: '0x9B2F5546AaE6fC2eE3BEaD55c59eB7eD8648aFe1',
//     usdc: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
//     aUsdc: '0x16dA4541aD1807f4443d92D26044C1147406EB10',
//     linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
//     keeperRegistry: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
//     ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
//     vault: '0xA076ecA49434a4475a9FF716c2E9f20ccc453c20'
//   },
//   // Add other networks as needed
// };

// export function getContractAddress(contractName: ContractName): `0x${string}` {
//   const chainId = '11155111'; // Sepolia Testnet
//   const address = CONTRACT_ADDRESSES[chainId]?.[contractName];
  
//   if (!address) {
//     throw new Error(`No address found for ${contractName} on chain ${chainId}`);
//   }
  
//   return address;
// }

// // Re-export ABI for convenience
// export { AAVE_DATA_PROVIDER_ABI} from './abis/aaveDataProvider';


type ContractName = 'aavePool' | 'aaveDataProvider' | 'usdc' | 'aUsdc' | 'linkToken' | 'keeperRegistry' | 'ethUsdPriceFeed' | 'vault';

interface ContractAddresses {
  [key: string]: `0x${string}`;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  '11155111': {
    aavePool: '0x6Ae43d3271fF6888e7Fc43Fd7321a503fF738951',
    aaveDataProvider: '0x9B2F5546AaE6fC2eE3BEaD55c59eB7eD8648aFe1',
    usdc: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    aUsdc: '0x16dA4541aD1807f4443d92D26044C1147406EB10',
    linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    keeperRegistry: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    vault: '0xA076ecA49434a4475a9FF716c2E9f20ccc453c20'
  }
};

export function getContractAddress(contractName: ContractName): `0x${string}` {
  const chainId = '11155111';
  const address = CONTRACT_ADDRESSES[chainId]?.[contractName];
  if (!address) throw new Error(`No address found for ${contractName} on chain ${chainId}`);
  return address;
}