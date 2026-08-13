# 🌙 Ghost Order Book - Midnight ZK Liquidity Protocol

**A high-frequency trading engine for privacy-preserving ghost orders on Midnight Network**

> DevPost Hackathon Submission | Midnight Network Compact | Zero-Knowledge Cryptography

---

## 🎯 Overview

Ghost Order Book is a decentralized exchange mechanism that enables traders to submit orders while keeping order details (price, quantity) private through zero-knowledge proofs. Only the commitment hash is revealed on-chain, preventing front-running and market manipulation.

### Key Features

- 🔐 **Zero-Knowledge Proofs** - Order details proven private without revealing amounts
- ⚡ **HFT-Grade Backend** - Rust + Axum with AVX-512 SIMD optimizations
- 🛡️ **Privacy-First Design** - Shielded addresses on Midnight Network
- 📊 **Real-Time Dashboard** - Next.js frontend with WebSocket updates
- 🚀 **Ready for TestNet** - Fully deployed on Midnight TestNet

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ghost Order Book                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Next.js 14)     │    Backend (Rust Axum)        │
│  ├─ MetricsDashboard       │    ├─ Order Book Management   │
│  ├─ Order Submission       │    ├─ WebSocket Server        │
│  └─ Midnight Wallet        │    └─ Contract Listener       │
│                            │                               │
│  WebSocket (ws://localhost:8080/ws)                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│               Midnight Network (TestNet)                   │
│  ├─ Compact Smart Contract                                 │
│  ├─ ZK Circuit Verification                                │
│  ├─ Order Commitment State                                 │
│  └─ Shielded Address Privacy                               │
├─────────────────────────────────────────────────────────────┤
│              On-Chain Components                            │
│  ├─ RPC: https://rpc.testnet.midnight.network              │
│  ├─ Indexer: https://indexer.testnet.midnight.network      │
│  ├─ Prover: https://prover.testnet.midnight.network        │
│  └─ Contract: 0x4dacbcb588568d8227506090159e557...         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
Ghost-Order-Book/
├── backend/                  # Rust HFT Engine
│   ├── src/
│   │   ├── main.rs          # Axum server & WebSocket
│   │   ├── ffi.rs           # C++ FFI for AVX-512
│   │   └── cxx/             # C++ order book kernel
│   ├── Cargo.toml           # Rust dependencies
│   ├── build.rs             # Build script
│   └── Dockerfile           # Container config
│
├── frontend/                # Next.js Dashboard
│   ├── app/                 # Pages & layouts
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── package.json         # npm dependencies
│   └── Dockerfile           # Container config
│
├── contracts/               # Midnight Compact
│   ├── Compact.toml         # Contract manifest
│   └── ghost_liquidity.compact  # ZK circuits
│
├── deploy/                  # TestNet Deployment
│   ├── deploy.ts            # Full deployment script
│   ├── deploy-simple.js     # Offline deployment
│   ├── generate-wallet.js   # Wallet generator
│   └── build/               # Generated wrappers
│
├── docker-compose.yml       # Service orchestration
├── DEPLOYMENT.md            # Full deployment guide
├── TESTNET_DEPLOYMENT.md    # Quick start guide
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Rust 1.75+
- Docker & Docker Compose (optional)
- Midnight Testnet wallet with DUST tokens

### 1. Generate Wallet (First Time Only)

```bash
cd deploy
node generate-wallet.js
```

**Output**: `wallet-generated.json` with your TestNet wallet

**⚠️ Important**: Save the seed phrase securely! It's your private key.

### 2. Fund Your Wallet

Visit the [Midnight TestNet Faucet](https://testnet-faucet.midnight.network/) and send DUST tokens to:

```
mn_dust_test1wvzcuyyayc9mja7rk6dsvp6p6m8nep0fpu8xa0zprkx437et8x2qsj8rn02
```

Wait 2-5 minutes for confirmation.

### 3. Start Services

**Option A: Native (Recommended for Development)**

```bash
# Terminal 1: Start Backend
cd backend
cargo build --release
./target/release/ghost-order-book-backend

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

**Option B: Docker Compose**

```bash
docker-compose up
```

### 4. Access Application

Open http://localhost:3000 in your browser

---

## 📋 Deploy to TestNet

### Automatic Deployment

```bash
cd deploy
npm install
npm run deploy:simple    # Offline (recommended)
npm run deploy          # Full TestNet deployment
```

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

---

## 🔐 ZK Circuits

### Order Commitment Proof
```
Inputs: price, quantity, min_price, secret_nonce
Proves: price >= min_price AND quantity > 0
Output: Commitment hash (Bytes[32])
```

Prevents invalid orders without revealing values.

### Execution Prevention
```
Inputs: commitment, fill_price, fill_quantity
Action: Records nullifier to prevent double-execution
Output: State update on ledger
```

---

## 🛠️ Technology Stack

### Backend
- **Language**: Rust 1.75+
- **Framework**: Axum 0.7 (async web)
- **WebSocket**: Tokio for async runtime
- **Optimization**: C++ AVX-512 kernel via CXX FFI

### Frontend
- **Framework**: Next.js 14.2
- **Styling**: Tailwind CSS 3.4
- **Runtime**: Node.js 20
- **WebSocket**: Native WebSocket API

### Contracts
- **Language**: Midnight Compact
- **Runtime**: Compact 0.16.0
- **Network**: Midnight TestNet
- **Proof System**: Plonk ZK proofs

---

## 📊 API Reference

### Backend Endpoints

**GET `/health`**
- Health check
- Returns: `200 OK`

**WS `/ws`**
- WebSocket for real-time order updates
- Messages: Order submissions, executions, metrics

**GET `/metrics`**
- Current order book metrics
- Returns: JSON with order counts, volumes, spreads

### Frontend Environment Variables

```bash
# Midnight Network
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.midnight.network
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet.midnight.network/api/v1/graphql
NEXT_PUBLIC_PROVER_URL=https://prover.testnet.midnight.network

# Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4dacbcb588568d8227506090159e557187d028100493f1ba8761acc6
NEXT_PUBLIC_NETWORK=testnet

# Backend Connection
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
cargo test --release
```

### Frontend Tests
```bash
cd frontend
npm run lint
npm run build  # Verify build succeeds
```

### Integration Testing
1. Start both services
2. Visit http://localhost:3000
3. Submit a test order
4. Verify order appears in real-time dashboard

---

## 🌐 Network Configuration

### Midnight TestNet Endpoints
| Service | URL |
|---------|-----|
| RPC | https://rpc.testnet.midnight.network |
| Indexer | https://indexer.testnet.midnight.network/api/v1/graphql |
| Prover | https://prover.testnet.midnight.network |
| Faucet | https://testnet-faucet.midnight.network/ |

### Local Services
| Service | Port | URL |
|---------|------|-----|
| Backend | 8080 | http://localhost:8080 |
| Frontend | 3000 | http://localhost:3000 |
| WebSocket | 8080 | ws://localhost:8080/ws |

---

## 🔑 Wallet Management

### Your TestNet Wallet

**Seed** (Hex Format):
```
722b68a27544505c2201124f880f5c08c62940eaa232b6791c8c25244c8fb17d
```

**Shielded Address** (Private Orders):
```
mn_shield-addr_test1nfp6zfg2khl9cqxg7f34zpcyxjsz7jv238l83atxze3dm7kxhay9s8y528hv6pap27eyre6xfq58qchd3r4z0p6p7xvl653jgyfmlkcej2fsy
```

**Dust Address** (Transaction Fees):
```
mn_dust_test1wvzcuyyayc9mja7rk6dsvp6p6m8nep0fpu8xa0zprkx437et8x2qsj8rn02
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 8080 is free
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Check Rust version
rustc --version  # Must be 1.75+
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:8080/health

# Check WebSocket connection in browser console
# DevTools → Console → Should see WebSocket messages
```

### Contract deployment fails
```bash
# Verify wallet is funded
# Check balance at https://testnet-faucet.midnight.network/

# Review logs
cat deploy/deployment.json  # Check contract address
```

---

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [TESTNET_DEPLOYMENT.md](./TESTNET_DEPLOYMENT.md) - Quick start summary
- [Midnight Docs](https://docs.midnight.network) - Official documentation
- [Compact Language Guide](https://docs.midnight.network/compact) - ZK circuit writing

---

## 🎓 Learning Resources

### Zero-Knowledge Proofs
- Midnight's Compact Language: https://docs.midnight.network/compact
- ZK Fundamentals: https://docs.midnight.network/fundamentals

### Rust Web Development
- Axum Framework: https://github.com/tokio-rs/axum
- Tokio Runtime: https://tokio.rs

### Next.js Frontend
- Next.js Documentation: https://nextjs.org/docs
- React Hooks: https://react.dev/reference/react

---

## 🤝 Contributing

This is a hackathon submission. Feel free to fork and extend!

### Future Enhancements
- [ ] Multi-chain support
- [ ] Advanced order types (conditional, time-weighted)
- [ ] Liquidity mining rewards
- [ ] DEX aggregation
- [ ] Advanced charting UI
- [ ] Mobile app

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

Built for DevPost Hackathon with ❤️

**Midnight Network Resources**:
- Website: https://midnight.network
- Discord: https://discord.com/invite/midnightnetwork
- GitHub: https://github.com/midnightntwrk

---

## 🙏 Acknowledgments

- Midnight Network team for the Compact language & SDK
- Rust & Tokio communities for excellent frameworks
- Next.js for the modern frontend framework

---

**Ready to trade privately on Midnight?** Start with the Quick Start section above! 🚀
