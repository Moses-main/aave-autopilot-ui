# 🚀 Deployment Guide

This guide explains how to deploy the AAVE Autopilot UI to production environments.

## Prerequisites

- Node.js (v18 or later)
- npm (v9+) or yarn
- A Vercel account (for deployment)
- A WalletConnect Project ID

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Fork the repository** to your GitHub account
2. **Import the project** in Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your forked repository

3. **Configure environment variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set `NODE_ENV` to `production`

4. **Deploy!**
   - Vercel will automatically deploy on push to main
   - Or trigger a manual deployment from the dashboard

### Option 2: Static Hosting (Netlify, GitHub Pages, etc.)

1. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Deploy the `dist` folder** to your preferred static hosting service.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_RPC_URL` | Yes | RPC URL for the Ethereum network |
| `VITE_CHAIN_ID` | Yes | Chain ID (11155111 for Sepolia) |
| `VITE_AAVE_POOL_ADDRESS` | Yes | AAVE V3 Pool address |
| `VITE_AAVE_POOL_DATA_PROVIDER` | Yes | AAVE Data Provider address |
| `VITE_USDC_ADDRESS` | Yes | USDC token address |
| `VITE_VAULT_ADDRESS` | Yes | Autopilot Vault contract address |
| `VITE_ATOKEN_ADDRESS` | Yes | aUSDC token address |
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Project ID |

## Continuous Deployment

This project is set up for continuous deployment:

- Pushes to `main` branch trigger production deployment
- Pull requests create preview deployments
- All deployments are automatically built and tested

## Post-Deployment

1. **Verify the deployment** by visiting the provided URL
2. **Test all functionality** with a small amount of testnet funds
3. **Monitor** for any console errors or issues

## Rollback

If needed, you can rollback to a previous deployment:

1. Go to your Vercel dashboard
2. Select the deployment you want to restore
3. Click "Redeploy"

## Troubleshooting

- **Build failures**: Check the build logs in your deployment platform
- **Connection issues**: Verify all contract addresses and RPC URLs
- **Wallet connection**: Ensure your wallet is connected to the correct network
