import { Address } from 'viem';

export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceInUSD?: number;
}

export interface UserPosition {
  asset: Token;
  supplied: bigint;
  suppliedUSD: string;
  borrowed: bigint;
  borrowedUSD: string;
  availableToBorrow: bigint;
  availableToBorrowUSD: string;
  apy: {
    supply: number;
    variableBorrow: number;
    stableBorrow: number;
  };
}

export interface VaultState {
  positions: UserPosition[];
  totalSuppliedUSD: string;
  totalBorrowedUSD: string;
  healthFactor: number;
  currentLiquidationThreshold: number;
  loanToValue: number;
  availableBorrowsUSD: string;
}

export enum ActionType {
  SUPPLY = 'Supply',
  WITHDRAW = 'Withdraw',
  BORROW = 'Borrow',
  REPAY = 'Repay',
}

export interface Action {
  type: ActionType;
  asset: Token;
  amount: string;
  useAsCollateral?: boolean;
  interestRateMode?: number; // 1 for stable, 2 for variable
}
