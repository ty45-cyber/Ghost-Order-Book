#!/usr/bin/env node
/**
 * Midnight Wallet Generator
 * 
 * Generates a new Midnight TestNet wallet with seed phrase,
 * derives keys, and outputs addresses for deployment.
 * 
 * Run: node generate-wallet.js
 */

import { generateRandomSeed, HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import {
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  UnshieldedAddress,
  DustAddress,
  MidnightBech32m,
} from '@midnight-ntwrk/wallet-sdk';
import * as fs from 'fs';
import * as path from 'path';

async function generateWallet() {
  console.log('\n🌙  Midnight TestNet Wallet Generator\n');
  console.log('─'.repeat(60));

  // Step 1: Generate random seed
  console.log('\n📝  Generating random seed phrase...');
  const seed = Buffer.from(generateRandomSeed()).toString('hex');
  
  // Convert hex seed to mnemonic-like format (simpler representation)
  const seedBuffer = Buffer.from(seed, 'hex');
  const seedWords = [];
  for (let i = 0; i < seedBuffer.length; i += 2) {
    const word = ((seedBuffer[i] << 8) | seedBuffer[i + 1]).toString(16).padStart(4, '0');
    seedWords.push(word);
  }
  
  console.log('✅  Seed generated (hex format):\n');
  console.log(`   ${seed}\n`);

  // Step 2: Derive HD Wallet
  console.log('🔑  Deriving HD Wallet keys...');
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  console.log('✅  Keys derived for roles: Zswap, NightExternal, Dust\n');

  // Step 3: Generate TestNet Addresses
  console.log('📍  Generating TestNet addresses...\n');
  const networkId = 'test';

  // Shielded address
  const shieldedKeys = ledger.ZswapSecretKeys.fromSeed(
    derivationResult.keys[Roles.Zswap]
  );
  const shieldedAddress = MidnightBech32m.encode(
    networkId,
    new ShieldedAddress(
      new ShieldedCoinPublicKey(Buffer.from(shieldedKeys.coinPublicKey, 'hex')),
      new ShieldedEncryptionPublicKey(Buffer.from(shieldedKeys.encryptionPublicKey, 'hex'))
    )
  ).toString();

  // Dust address (for transaction fees)
  const dustSecretKey = ledger.DustSecretKey.fromSeed(
    derivationResult.keys[Roles.Dust]
  );
  const dustAddress = MidnightBech32m.encode(
    networkId,
    new DustAddress(dustSecretKey.publicKey)
  ).toString();

  // Clear sensitive material
  hdWallet.hdWallet.clear();

  // Display addresses
  console.log('🛡️   Shielded Address (Private):');
  console.log(`   ${shieldedAddress}\n`);
  
  console.log('💰  Dust Address (Fees):');
  console.log(`   ${dustAddress}\n`);

  // Step 4: Save wallet info
  const walletInfo = {
    generated: new Date().toISOString(),
    network: 'Midnight TestNet',
    networkId: 'test',
    seed: {
      hex: seed,
      note: 'Keep this seed secure! It controls all funds in this wallet.',
    },
    addresses: {
      shielded: shieldedAddress,
      dust: dustAddress,
    },
    deployment: {
      command: `export MIDNIGHT_SEED_PHRASE="${seed}"`,
      instructions: 'Use this seed for contract deployment to TestNet',
    },
  };

  const walletPath = './wallet-generated.json';
  fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2));

  console.log('─'.repeat(60));
  console.log('\n✅  Wallet generated successfully!\n');
  console.log('📄  Wallet info saved to: wallet-generated.json\n');

  console.log('🚀  Next steps:\n');
  console.log('   1. Fund your Dust address with TestNet DUST from faucet');
  console.log('   2. Convert seed to 24-word mnemonic (BIP39) for backup');
  console.log('   3. Use this seed phrase for contract deployment:\n');
  console.log(`      export MIDNIGHT_SEED_PHRASE="${seed}"\n`);
  console.log('   4. Deploy contract:\n');
  console.log(`      npm run deploy\n`);

  console.log('⚠️   IMPORTANT SECURITY NOTES:\n');
  console.log('   • Store seed securely (not in version control)');
  console.log('   • Never share your seed phrase');
  console.log('   • This is a TestNet wallet - use separate MainNet wallet');
  console.log('   • Delete wallet-generated.json after backing up seed\n');

  console.log('─'.repeat(60) + '\n');

  return walletInfo;
}

generateWallet().catch(err => {
  console.error('❌  Wallet generation failed:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
