import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isAddress } from 'viem';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shortens an Ethereum address for display
 * @param address The address to shorten
 * @param chars Number of characters to show at the start and end
 * @returns Formatted address (e.g., 0x1234...5678)
 */
export function shortenAddress(address?: string, chars = 4): string {
  if (!address || !isAddress(address)) return '0x0...0';
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

/**
 * Format a number with commas and fixed decimal places
 * @param value The number to format (can be number, string, or bigint)
 * @param decimals Number of decimal places to show
 * @returns Formatted number string
 */
export function formatNumber(value: number | string | bigint, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a value as USD currency
 * @param value The value to format
 * @param decimals Number of decimal places to show
 * @returns Formatted USD string
 */
export function formatUSD(value: number | string | bigint, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}
