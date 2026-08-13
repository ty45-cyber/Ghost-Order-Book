#!/usr/bin/env bash
set -euo pipefail

# Visual status output helpers
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   Ghost Order Book Engine: Launch & Test Suite    ${NC}"
echo -e "${CYAN}====================================================${NC}\n"

# 1. Environment & Prerequisites Check
echo -e "${YELLOW}--> [1/5] Checking system toolchain dependencies...${NC}"

for cmd in docker cargo npm; do
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}Error: Required command '$cmd' is not installed or not in PATH.${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✓ Prerequisite CLI tools detected.${NC}\n"

# 2. Build and Test Rust + C++ AVX-512 Backend Kernel
echo -e "${YELLOW}--> [2/5] Compiling C++ SIMD routines & running Rust backend tests...${NC}"
(
  cd backend
  cargo test --release -- --nocapture
)
echo -e "${GREEN}✓ Rust/C++ AVX-512 backend tests passed.${NC}\n"

# 3. Validate Compact ZK Smart Contracts
echo -e "${YELLOW}--> [3/5] Validating Midnight Compact ZK circuit syntax...${NC}"
if command -v compact &> /dev/null; then
  compact check contracts/ghost_liquidity.compact
  echo -e "${GREEN}✓ Compact ZK circuits verified successfully.${NC}\n"
else
  echo -e "${YELLOW}! 'compact' compiler CLI not found locally. Skipping local check (handled in container).${NC}\n"
fi

# 4. Install & Build Next.js Frontend
echo -e "${YELLOW}--> [4/5] Installing dependencies and building Next.js dashboard...${NC}"
(
  cd frontend
  npm install --silent
  npm run build
)
echo -e "${GREEN}✓ Next.js production bundle created.${NC}\n"

# 5. Launch Infrastructure via Docker Compose
echo -e "${YELLOW}--> [5/5] Spinning up Docker Compose services...${NC}"
docker compose up --build -d

echo -e "\n${CYAN}====================================================${NC}"
echo -e "${GREEN}  Ghost Order Book Stack Active & Running!          ${NC}"
echo -e "  Frontend Dashboard : ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend Health     : ${CYAN}http://localhost:8080/health${NC}"
echo -e "  100Hz WS Stream    : ${CYAN}ws://localhost:8080/ws${NC}"
echo -e "${CYAN}====================================================${NC}\n"

# Stream initial logs to verify runtime boot
docker compose logs -f --tail=20