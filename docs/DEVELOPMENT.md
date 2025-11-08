# 🛠️ Development Guide

## Prerequisites

- Node.js (v18 or later)
- npm (v9+) or yarn
- Git
- A Web3 wallet (MetaMask recommended)
- Testnet ETH (for Sepolia testnet)

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Moses-main/aave-autopilot-ui.git
cd aave-autopilot-ui
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Required
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CHAIN_ID=11155111
VITE_AAVE_POOL_ADDRESS=0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
VITE_AAVE_POOL_DATA_PROVIDER=0x3e9708d80f7B3e431180130bF846E7cC0aBcC163
VITE_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
VITE_VAULT_ADDRESS=0x4e9A9676b3E24E406a42710A06120561D5A9A045
VITE_ATOKEN_ADDRESS=0x16dA4541aD1807f4443d92D26044C1147406EB80
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Available Scripts

- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build locally
- `lint`: Run ESLint
- `format`: Format code with Prettier

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

Run linter:

```bash
npm run lint
# or
yarn lint
```

Format code:

```bash
npm run format
# or
yarn format
```

## Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
