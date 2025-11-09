// src/lib/contracts.ts
import { AaveAutopilotABI } from './abis/AaveAutopilot';

type ContractName = 'aavePool' | 'aaveDataProvider' | 'weth' | 'aWeth' | 'linkToken' | 'keeperRegistry' | 'ethUsdPriceFeed' | 'vault';

interface ContractAddresses {
  [key: string]: `0x${string}`;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  '11155111': {
    aavePool: '0x6Ae43d3271fF6888e7Fc43Fd7321a503fF738951',
    aaveDataProvider: '0x9B2F5546AaE6fC2eE3BEaD55c59eB7eD8648aFe1',
    weth: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    aWeth: '0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830',
    linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    keeperRegistry: '0xE16Df59B887e3Caa439E0b29B42bA2e7976FD8b2',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    vault: '0xeB2dADCEe0B6226A1a4Ae91b18490Cf82eaF6b88'
  }
};

export function getContractAddress(contractName: ContractName): `0x${string}` {
  const chainId = '11155111';
  const address = CONTRACT_ADDRESSES[chainId]?.[contractName];
  if (!address) throw new Error(`No address found for ${contractName} on chain ${chainId}`);
  return address;
}