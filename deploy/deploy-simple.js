#!/usr/bin/env node
/**
 * Ghost Order Book — Midnight Deployment Script (Simplified)
 * 
 * This version allows deployment setup without requiring:
 * - Active wallet connection
 * - Proof server
 * - TestNet access
 * 
 * Use this to test deployment flow locally or with offline mode
 * 
 * Prerequisites:
 *   Set MIDNIGHT_SEED_PHRASE env var with 24-word mnemonic
 *   
 * Run:
 *   node deploy-simple.js
 */

import fs from 'fs';
import path from 'path';

async function main() {
  const network = process.env.MIDNIGHT_NETWORK ?? 'testnet';
  const seedPhrase = process.env.MIDNIGHT_SEED_PHRASE;

  if (!seedPhrase) {
    console.error('❌  MIDNIGHT_SEED_PHRASE env var is required.');
    console.error('    Export your 24-word TestNet wallet mnemonic:');
    console.error('    set MIDNIGHT_SEED_PHRASE=word1 word2 ... word24');
    process.exit(1);
  }

  const networkConfig = {
    testnet: {
      name: 'Midnight TestNet',
      node: 'https://rpc.testnet.midnight.network',
      indexer: 'https://indexer.testnet.midnight.network/api/v1/graphql',
      prover: 'https://prover.testnet.midnight.network',
    },
    devnet: {
      name: 'Midnight DevNet',
      node: 'https://rpc.devnet.midnight.network',
      indexer: 'https://indexer.devnet.midnight.network/api/v1/graphql',
      prover: 'https://prover.devnet.midnight.network',
    },
  };

  const config = networkConfig[network] || networkConfig.testnet;

  console.log(`\n🌙  Ghost Order Book — Midnight Deployment (Local Mode)`);
  console.log(`    Network  : ${config.name}`);
  console.log(`    Node     : ${config.node}`);
  console.log(`    Indexer  : ${config.indexer}`);
  console.log(`    Prover   : ${config.prover}\n`);

  // Load contract
  console.log('📦  Loading contract...');
  let contract;
  try {
    const { GhostLiquidityContract } = await import('./build/ghost_liquidity/index.js');
    contract = new GhostLiquidityContract();
    console.log('✅  Contract loaded\n');
  } catch (err) {
    console.error('❌  Failed to load contract:', err.message);
    console.error('    Ensure compiled contract exists at ./build/ghost_liquidity/index.js');
    process.exit(1);
  }

  // Mock deployment (local)
  console.log('🚀  Deploying ghost_liquidity contract...');
  const mockProviders = {
    privateStateProvider: () => {},
    publicDataProvider: () => {},
    proofProvider: () => {},
    walletProvider: null,
    midnightProvider: null,
  };

  const deployedContract = await contract.deploy(mockProviders, {
    initialState: {
      root: new Uint8Array(32),
      nullifier: new Uint8Array(32),
    },
  });

  const contractAddress = deployedContract.deployTxData.public.contractAddress;
  const txHash = deployedContract.deployTxData.public.txHash;

  console.log(`\n✅  Contract deployment configured!`);
  console.log(`    Contract Address : ${contractAddress}`);
  console.log(`    Tx Hash (mock)   : ${txHash}\n`);

  // Save deployment info
  const deploymentInfo = {
    network,
    networkName: config.name,
    contractAddress,
    txHash,
    deployedAt: new Date().toISOString(),
    endpoints: {
      node: config.node,
      indexer: config.indexer,
      prover: config.prover,
    },
    status: 'Ready for deployment',
    notes: 'This is a local configuration. To finalize deployment, use the full deploy.ts script.',
  };

  const deploymentPath = './deployment.json';
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄  Deployment info saved to ${deploymentPath}`);

  console.log('\n🎯  Next steps:');
  console.log('   1. Set NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env.local:');
  console.log(`      NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('   2. For full deployment with wallet and proofs, run:');
  console.log('      npx ts-node --esm deploy.ts');
  console.log('\n');
}

main().catch(err => {
  console.error('❌  Deployment failed:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
