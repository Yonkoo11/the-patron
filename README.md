# The Patron

An autonomous AI agent that discovers Base builders, evaluates their onchain work, and sends them ETH micro-grants from its own treasury contract.

No human in the loop. Every grant decision verifiable onchain.

## How It Works

```
Every 30 minutes:
  1. SCAN    → Find builders who deployed contracts on Base
  2. VERIFY  → Check their onchain activity via RPC + Basescan
  3. EVALUATE → Score: Novelty (30%) + Activity (25%) + Quality (25%) + Impact (20%)
  4. DECIDE  → Select candidates scoring >= 60/100
  5. FUND    → Disburse 0.001-0.005 ETH via PatronTreasury contract
  6. REPORT  → Post grant announcement with tx proof
```

## Architecture

```
┌──────────────────────────────────────────┐
│              THE PATRON                   │
│                                          │
│  Scanner ──→ Verifier ──→ Evaluator      │
│                              │           │
│                          Decision        │
│                              │           │
│                    ┌────────┴────────┐   │
│                    ▼                 ▼   │
│                 Funder          Reporter  │
│                    │                 │   │
│              ┌─────┘                 │   │
│              ▼                       ▼   │
│     PatronTreasury.sol          Farcaster │
│         (Base)                           │
└──────────────────────────────────────────┘
```

### Smart Contract

`PatronTreasury.sol` - Deployed on Base. Tracks every grant with:
- Recipient address
- ETH amount
- Reason hash (keccak256 of evaluation summary)
- Round ID and timestamp
- Full event logs for transparency

### Evaluation Criteria

| Dimension | Weight | Measured By |
|-----------|--------|-------------|
| Novelty | 30% | Contract count, bytecode complexity, system variety |
| Activity | 25% | TX count, recent activity, unique interactors |
| Quality | 25% | Verified contracts, substantial bytecode, deployer experience |
| Impact | 20% | User adoption, ecosystem contribution, sustained activity |

### Grant Parameters

- Minimum score: 60/100
- Grant range: 0.001 - 0.005 ETH
- Max per round: 3 grants
- Max per address: 1 grant (no double-dipping)

## Quick Start

### 1. Deploy the Contract

```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --private-key $PRIVATE_KEY
```

### 2. Configure the Agent

```bash
cd agent
cp .env.example .env
# Edit .env with your keys
npm install
```

### 3. Run

```bash
# Autonomous mode
npm run start

# Or manual commands
npm run scan          # Find builder candidates
npm run evaluate      # Evaluate a specific address
npm run disburse      # Evaluate + grant
npm run status        # Treasury status
npm run round         # Start new round
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity 0.8.20+, Foundry |
| Chain | Base (mainnet or Sepolia) |
| Agent | Node.js, TypeScript, ethers.js |
| Onchain Queries | Base RPC, Basescan API |
| Social | Farcaster via Neynar API |
| Skill Format | OpenClaw SKILL.md |

## Verifiability

Every grant is onchain:
- Treasury contract is verified on Basescan
- Each grant emits a `GrantDisbursed` event with the reason hash
- Reason hash = keccak256 of the evaluation summary text
- Anyone can reconstruct and verify the evaluation matches the hash
- Zero human approvals -- fully autonomous

## License

MIT
