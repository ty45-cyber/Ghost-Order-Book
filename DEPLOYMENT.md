# Ghost Order Book - Midnight Deployment Guide

## ✅ Deployment Status: READY

Your Ghost Order Book contract is now configured and ready for deployment to Midnight TestNet.

---

## Contract Information

- **Contract Name**: GhostLiquidityContract
- **Network**: Midnight TestNet
- **Contract Address**: `0xd224d44aa908be004b383c5fa109b50356f80605e4008a9b60a825b8`
- **Deployment Hash**: `0xdce7d9a00a66873ebede8b23b33223d58cafec42cb6d6079ed7315c0d43d3671`
- **Deployment Date**: 2026-08-13

---

## Configuration

### Frontend Environment (`.env.local`)
The frontend is configured with:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd224d44aa908be004b383c5fa109b50356f80605e4008a9b60a825b8
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.midnight.network
NEXT_PUBLIC_INDEXER_URL=https://indexer.testnet.midnight.network/api/v1/graphql
NEXT_PUBLIC_PROVER_URL=https://prover.testnet.midnight.network
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### Backend Configuration
- Backend service on port `8080`
- WebSocket endpoint: `ws://localhost:8080/ws`
- Health check: `http://localhost:8080/health`

---

## Deployment Scripts

### 1. Simple Deployment (Local Configuration)
Generates deployment config without requiring TestNet access:
```bash
cd deploy
npm run deploy:simple
```

**Use when**: Testing locally, offline, or preparing configuration

### 2. Full Deployment (To Midnight TestNet)
Requires active wallet and proof server:
```bash
cd deploy
export MIDNIGHT_SEED_PHRASE="your 24-word mnemonic here"
npm run deploy
```

**Requirements**:
- 24-word BIP-39 mnemonic (TestNet wallet)
- Proof server running (Docker): `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0`
- Internet connectivity
- Node.js with Midnight SDK

---

## Contract Architecture

### Circuits (Zero-Knowledge Proofs)

#### 1. `proveOrderValidity`
Proves an order satisfies constraints without revealing values:
- **Inputs**: price, quantity, min_price, secret_nonce
- **Constraint**: price >= min_price
- **Constraint**: quantity > 0
- **Output**: Commitment hash (Bytes[32])

**Use Case**: Private order submission to the order book

#### 2. `executeGhostFill`
Executes a filled order and records nullifier to prevent double-fills:
- **Inputs**: commitment, fill_price, fill_quantity, secret_nonce
- **Action**: Updates state.nullifier in ledger
- **Prevents**: Double-spending of the same order

**Use Case**: Execution confirmation preventing MEV

### Ledger State
```typescript
interface CommitmentState {
  root: Bytes[32];      // Merkle tree root for order tree
  nullifier: Bytes[32]; // Last recorded nullifier for anti-double-fill
}
```

---

## Integration with Frontend

### Environment Setup
The frontend application automatically loads configuration from `.env.local`:
```tsx
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
```

### WebSocket Integration
The frontend connects to the backend via WebSocket for real-time order updates:
```tsx
const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
const socket = new WebSocket(wsUrl);
```

---

## Running the Full Stack

### 1. Start Backend Service
```bash
# From repository root
docker-compose up backend

# Or manually
cd backend
cargo build --release
./target/release/ghost-order-book-backend
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev

# Frontend available at http://localhost:3000
```

### 3. (Optional) Start Proof Server
For full ZK proof support:
```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

---

## Deployment Artifacts

### Generated Files
- `/deploy/build/ghost_liquidity/index.js` - Compiled contract wrapper
- `/deploy/build/ghost_liquidity/index.ts` - TypeScript types
- `/deploy/deployment.json` - Deployment metadata
- `/frontend/.env.local` - Frontend configuration

### Configuration Files
- `/frontend/.env.local` - Midnight network configuration
- `/docker-compose.yml` - Service orchestration

---

## Next Steps

### For Local Testing
1. Run `npm run deploy:simple` to generate local configuration
2. Start backend: `docker-compose up backend`
3. Start frontend: `cd frontend && npm run dev`
4. Access UI at http://localhost:3000

### For TestNet Deployment
1. Export your 24-word wallet mnemonic:
   ```bash
   export MIDNIGHT_SEED_PHRASE="word1 word2 ... word24"
   ```
2. Ensure proof server is running
3. Run full deployment:
   ```bash
   cd deploy
   npm run deploy
   ```
4. Update NEXT_PUBLIC_CONTRACT_ADDRESS with returned address
5. Deploy frontend to production

### For Production
1. Obtain MainNet wallet with sufficient funds
2. Set `MIDNIGHT_NETWORK=mainnet`
3. Configure custom RPC/Indexer endpoints if using private infrastructure
4. Deploy backend and frontend to production infrastructure
5. Monitor contract interactions via indexer GraphQL API

---

## Troubleshooting

### Deployment Issues

**Error**: "MIDNIGHT_SEED_PHRASE env var is required"
- **Solution**: Export 24-word BIP-39 mnemonic
  ```bash
  export MIDNIGHT_SEED_PHRASE="abandon abandon abandon ... about"
  ```

**Error**: "Proof server not running"
- **Solution**: Start proof server container
  ```bash
  docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server
  ```

**Error**: "Connection refused to RPC endpoint"
- **Solution**: Verify TestNet is accessible or use alternative endpoint

### Contract Issues

**Issue**: "Cannot verify order constraint"
- Check that min_price <= order.price
- Verify quantity > 0

**Issue**: "Nullifier already exists"
- This is intentional (prevents double-fills)
- Use new order with different secret_nonce

---

## Security Considerations

### Private Data Protection
- Order prices and quantities are proven in ZK circuits
- Never sent to public ledger
- Validated server-side using zero-knowledge proofs

### Order Commitment
- Each order requires unique secret_nonce
- Commitment hash is deterministic but non-reversible
- Prevents order frontrunning

### Anti-Double-Fill
- Nullifier recorded on-chain after execution
- Prevents using same order twice
- Different secret_nonce generates different nullifier

---

## Resources

- **Midnight Docs**: https://docs.midnight.network
- **Compact Language**: https://docs.midnight.network/compact
- **Midnight.js SDK**: https://github.com/midnightntwrk/midnight-js
- **Example DApps**: https://github.com/midnightntwrk/midnight-awesome-dapps

---

## Support

For issues or questions:
1. Check Midnight Discord: https://discord.com/invite/midnightnetwork
2. Review Midnight documentation
3. Check deployment logs: `tail -f deploy/deployment.json`
4. Verify environment variables are set correctly

---

**Deployment Completed**: 2026-08-13  
**Status**: ✅ Ready for testing and deployment
