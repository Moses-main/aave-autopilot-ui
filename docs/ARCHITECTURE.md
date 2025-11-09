# 🏗️ AAVE Autopilot UI Architecture

## System Overview

### Architecture Diagram

![Frontend Architecture](public/frontend.png)
*Figure 1: Frontend architecture and data flow*

### Component Structure

```mermaid
graph TD
    %% User Layer
    User[User] -->|1. Interacts with| UI[React Frontend]
    
    %% Frontend Components
    subgraph Frontend["Frontend Application"]
        UI -->|2. Manages State| State[State Management]
        UI -->|3. Handles Auth| Auth[Wallet Connection]
        UI -->|4. Makes Calls| Services[Service Layer]
    end

    %% Services
    subgraph Services["Services"]
        AaveService[Aave Service]
        VaultService[Vault Service]
        PriceService[Price Service]
    end

    %% Blockchain
    subgraph Blockchain["Blockchain (Sepolia Testnet)"]
        AaveV3[AAVE V3 Protocol]
        Vault[Autopilot Vault]
        Tokens[ERC20 Tokens]
    end

    %% Data Flows
    Services -->|5. Read/Write| AaveV3
    Services -->|6. Interact with| Vault
    Services -->|7. Fetch Prices| PriceOracle[Chainlink Oracle]
    Auth -->|8. Authenticate| Blockchain

    %% Styling
    classDef frontend fill:#e3f2fd,stroke:#1976d2,color:#000;
    classDef service fill:#e8f5e9,stroke:#388e3c,color:#000;
    classDef blockchain fill:#f3e5f5,stroke:#8e24aa,color:#000;
    
    class UI,State,Auth frontend;
    class AaveService,VaultService,PriceService service;
    class AaveV3,Vault,Tokens,PriceOracle blockchain;
```

## Key Components

### 1. Frontend Application
- Built with React and TypeScript
- Uses Vite for fast development and building
- Implements responsive design with Tailwind CSS
- Features dark/light mode theming

### 2. State Management
- Uses React Context API for global state
- Manages wallet connection state
- Tracks transaction states and user balances

### 3. Wallet Integration
- Supports multiple wallet providers (MetaMask, WalletConnect, etc.)
- Handles chain switching and network validation
- Manages user authentication and session

### 4. Service Layer
- **AaveService**: Handles interactions with AAVE V3 protocol
- **VaultService**: Manages vault operations (deposit/withdraw)
- **PriceService**: Fetches real-time price feeds

## Data Flow

1. User connects their wallet
2. Application fetches user balances and positions
3. User initiates transactions (deposit/withdraw)
4. Transactions are signed and sent to the blockchain
5. UI updates to reflect the new state

## Security Considerations

- All transactions require explicit user approval
- Contract addresses are validated against the current network
- Sensitive operations are confirmed with user prompts
- Environment variables are used for configuration
