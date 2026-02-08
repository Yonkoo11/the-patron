# the-patron

Autonomous AI agent that discovers Base builders, evaluates their onchain work, and sends them ETH micro-grants. No human in the loop.

## Skills

### scan-builders
Scan Base for recent contract deployers and evaluate them as grant candidates.

```bash
cd agent && npm run scan
```

### evaluate
Evaluate a specific address's onchain activity and score their work.

```bash
cd agent && npm run evaluate -- <address>
```

### disburse-grant
Evaluate an address and disburse an ETH grant if they meet the threshold.

```bash
cd agent && npm run disburse -- <address>
```

### start-round
Begin a new themed grant round.

```bash
cd agent && npm run round -- "<theme>"
```

### status
Show treasury balance, grants disbursed, current round.

```bash
cd agent && npm run status
```

### run-autonomous
Start the fully autonomous loop. The agent scans, evaluates, funds, and reports on its own.

```bash
cd agent && npm run start
```

## How It Works

1. **SCAN** - Find builders who deployed contracts on Base (via Basescan/RPC)
2. **VERIFY** - Check their onchain activity (tx count, contracts, bytecode, verification)
3. **EVALUATE** - Score on 4 dimensions: Novelty (30%), Activity (25%), Quality (25%), Impact (20%)
4. **DECIDE** - Select candidates scoring >= 60/100
5. **FUND** - Disburse 0.001-0.005 ETH via PatronTreasury contract
6. **REPORT** - Post grant announcement with tx proof

## Setup

1. Deploy PatronTreasury contract to Base (see `contracts/`)
2. Copy `agent/.env.example` to `agent/.env` and fill in values
3. Fund the agent wallet with ETH
4. Run `npm run start` to begin autonomous operation

## Architecture

- **PatronTreasury.sol** - Onchain treasury that tracks every grant with reasoning hashes
- **Scanner** - Finds builders by scanning recent blocks for contract deployers
- **Verifier** - Checks tx count, deployed contracts, bytecode size, verification status
- **Evaluator** - Rule-based scoring on novelty, activity, quality, impact
- **Funder** - Calls PatronTreasury.disburse() with ETH
- **Reporter** - Posts grant announcements to Farcaster

## Requirements

- Node.js 20+
- Foundry (for contract deployment)
- ETH on Base (for grants + gas)
- Basescan API key (free tier)
- Neynar API key (for Farcaster posting, optional)
