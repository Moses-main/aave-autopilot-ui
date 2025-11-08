# 🚀 AAVE Autopilot UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open in Gitpod](https://imgpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Moses-main/aave-autopilot-ui)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)

> **Current Status**: Beta (Sepolia Testnet)
> - **Network**: Ethereum Sepolia (Chain ID: 11155111)
> - **Smart Contract**: [0x4e9A9676b3E24E406a42710A06120561D5A9A045](https://sepolia.etherscan.io/address/0x4e9A9676b3E24E406a42710A06120561D5A9A045)
> - **Last Updated**: 2025-11-08

AAVE Autopilot is a decentralized application that simplifies interacting with the AAVE V3 protocol. It provides an intuitive interface for users to supply and withdraw assets from AAVE V3 with just a few clicks, making DeFi more accessible to everyone.

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [Development Guide](docs/DEVELOPMENT.md) - Local setup and testing
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [Smart Contracts](https://github.com/Moses-main/aave-autopilot) - Smart contract repository

## ✨ Features

- **Wallet Connection**: Seamlessly connect with popular Web3 wallets (MetaMask, WalletConnect, etc.)
- **AAVE V3 Integration**: Direct interaction with AAVE V3 protocol on Sepolia testnet
- **Real-time Balances**: View your wallet and AAVE V3 positions in real-time
- **Simple Interface**: Clean and intuitive UI for managing your DeFi positions
- **Secure**: Non-custodial solution - you maintain control of your assets
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Eye-friendly dark theme for extended usage

## 🚀 Live Demo

Check out the live demo at [https://moses-main.github.io/aave-autopilot-ui](https://moses-main.github.io/aave-autopilot-ui)

## 🛠️ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9+) or [yarn](https://yarnpkg.com/)
- A Web3 wallet (like [MetaMask](https://metamask.io/))
- Testnet ETH (get some from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Moses-main/aave-autopilot-ui.git
   cd aave-autopilot-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**:
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your configuration:
   ```env
   # Required
   VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   VITE_CHAIN_ID=11155111
   VITE_AAVE_POOL_ADDRESS=0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
   VITE_AAVE_POOL_DATA_PROVIDER=0x3e9708d80f7B3e431180130bF846E7cC0aBcC163
   VITE_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   VITE_VAULT_ADDRESS=0xA076ecA49434a4475a9FF716c2E9f20ccc453c20
   VITE_ATOKEN_ADDRESS=0x16dA4541aD1807f4443d92D26044C1147406EB80
   VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

   > **Note**: For production, make sure to replace the testnet addresses with mainnet addresses.

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN UI components
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAaveV3.ts    # AAVE V3 integration
│   └── useVault.ts     # Vault contract interaction
├── lib/                # Utility functions
├── pages/              # Page components
├── store/              # State management
└── App.tsx             # Main application component
```

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Beautiful, accessible components

### Web3 & Blockchain
- **Wagmi** - React Hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **viem** - TypeScript interface for Ethereum
- **AAVE V3 Protocol** - Decentralized lending protocol
- **Ethers.js** - Ethereum wallet implementation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD pipeline

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form validation
- **Zod** - Schema validation

### UI Components
- **ShadCN UI** - High-quality, accessible components
  - Pre-configured in `src/components/ui/`
  - Includes: Avatar, Button, Card, Form, Input, and more
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications
- **Framer Motion** - Animation library

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [AAVE Team](https://aave.com/) for the amazing protocol
- [Vite](https://vitejs.dev/) for the amazing development experience
- [ShadCN UI](https://ui.shadcn.com/) for the beautiful components
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection

## 📞 Contact

Project Link: [https://github.com/Moses-main/aave-autopilot-ui](https://github.com/Moses-main/aave-autopilot-ui)

## ⚠️ Disclaimer

This project is for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses or damages.
- **Arcane Fable Font** - Beautiful custom font for headings
- **Optimized Colors** - Carefully selected palette for accessibility and readability

## Smart Contract Integration

The application interacts with the following smart contracts:

- **AAVE V3 Pool**: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` (Sepolia)
- **AAVE V3 Pool Data Provider**: `0x3e9708d80f7B3e431180130bF846E7cC0aBcC163`
- **USDC Token**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Sepolia)
- **aUSDC Token**: `0x16dA4541aD1807f4443d92D26044C1147406EB80`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Moses Main - [@MosesMain](https://github.com/Moses-main)

Project Link: [https://github.com/Moses-main/aave-autopilot-ui](https://github.com/Moses-main/aave-autopilot-ui)

## Acknowledgements

- [AAVE Protocol](https://aave.com/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [ShadCN UI](https://ui.shadcn.com/)
```typescript
import MorphoABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyABI from '@/abis/SkyCompounderStrategyFactory.json';
import YieldABI from '@/abis/YieldDonatingTokenizedStrategy.json';
```

## Project Structure

```
src/
├── abis/                # Smart contract ABIs
│   ├── MorphoCompounderStrategyFactory.json
│   ├── SkyCompounderStrategyFactory.json
│   └── YieldDonatingTokenizedStrategy.json
├── components/
│   └── ui/              # ShadCN UI components
├── pages/               # Your app pages/routes
│   ├── About.tsx
│   └── [add more here]
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── store.ts             # Zustand global state
├── App.tsx              # Routes and app shell
└── main.tsx             # App entry point
```

## Development Guide

### Exploring Components
The homepage displays all 17 pre-built components:
- Interactive demos you can test immediately
- See how each component looks and behaves
- All components are styled for the dark theme

### Adding New Pages
1. Create a new file in `src/pages/` (e.g., `Dashboard.tsx`)
2. Add route in `src/App.tsx`:
```tsx
<Route path="dashboard" element={<Dashboard />} />
```

### Using Zustand State
```tsx
import { useCounterStore } from '@/store';

function MyComponent() {
  const { count, increment } = useCounterStore();
  return <button onClick={increment}>{count}</button>;
}
```

### Using ShadCN Components
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Card>
  <Button>Click me</Button>
</Card>
```

### Using Smart Contract ABIs
```tsx
import MorphoABI from '@/abis/MorphoCompounderStrategyFactory.json';
import { useReadContract } from 'wagmi';

function MyComponent() {
  const { data } = useReadContract({
    address: '0x...', // Contract address
    abi: MorphoABI,
    functionName: 'createStrategy',
    args: [/* your args */]
  });

  return <div>{/* Your component */}</div>;
}
```

### Styling with Tailwind
Use utility classes directly in JSX:
```tsx
<div className="flex items-center gap-4 rounded-lg border p-6">
  <h1 className="text-2xl font-bold">Hello</h1>
</div>
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready to deploy to any static hosting service.

## Customization

### Add More ShadCN Components
Visit [ui.shadcn.com](https://ui.shadcn.com) and use their CLI:
```bash
npx shadcn@latest add [component-name]
```

### Modify Tailwind Config
Edit `tailwind.config.js` for custom colors, fonts, etc.

### Configure Build
Edit `vite.config.ts` for build optimizations.

## Tips for Hackathons

1. **Focus on features** - UI components are ready, just build your logic
2. **Use Zustand** for simple global state - no Redux boilerplate
3. **Leverage Tailwind** for rapid styling - no CSS files needed
4. **ShadCN components** are accessible and mobile-responsive out of the box
5. **TypeScript** helps catch bugs early - use it!
