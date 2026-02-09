# Building The Patron

An autonomous AI agent that funds Base builders through on-chain grants. No human approvals. Every decision verifiable on-chain.

- **Dashboard**: [the-patron.netlify.app](https://the-patron.netlify.app)
- **GitHub**: [github.com/Yonkoo11/the-patron](https://github.com/Yonkoo11/the-patron)
- **Treasury**: [0xb5C65e983e013ea2249EB8Fc44A316C641c21c38](https://sepolia.basescan.org/address/0xb5C65e983e013ea2249EB8Fc44A316C641c21c38)
- **Agent Wallet**: `0x15545100bf579a5a6492499126E2b076a6890b98`

---

## Why This Exists

Grants programs are slow. A builder deploys something cool on a Friday night and waits weeks for a committee to notice. Application forms, review meetings, voting rounds. By the time the money arrives, motivation is gone and the builder moved on.

I wanted to flip that. What if grants found the builders instead of the other way around? What if there was an agent watching Base 24/7, spotting real on-chain work, and sending ETH to the people doing it? No applications. No committees. No waiting.

That's The Patron. It scans Base for contract deployers, verifies their on-chain activity is real, scores their work on four dimensions, and sends ETH micro-grants directly from a treasury contract. Every decision is logged on-chain with a reason hash anyone can verify.

8 grants disbursed across 6 rounds to real Base Sepolia builders. Fully autonomous.

---

## How We Built It

### Step 1: The Smart Contract

Started here because everything else depends on it. The contract needed to be dead simple: hold ETH, send ETH, log everything. No tokens, no governance, no multisig complexity.

`PatronTreasury.sol` has one owner (the agent wallet, set as `immutable patron`), one core function (`disburse`), and rich event logging. The agent calls `disburse()` with a recipient address, a `reasonHash` (keccak256 of the evaluation summary), and ETH attached as `msg.value`. The contract records it as a `Grant` struct with recipient, amount, reason, timestamp, and round ID, then emits `GrantDisbursed` so everything is indexable.

Round management is built in too. The agent calls `startRound()` with a theme string before each batch of evaluations. This groups grants into coherent rounds and makes the on-chain history readable.

Deployed with Foundry. Wrote tests for access control, fund flow, and round management. Verified on Base Sepolia Basescan.

### Step 2: The Scanner

The scanner needed to find real builders, not just random addresses. I went with scanning recent blocks via RPC for contract creation transactions (where `to` is null). For each deployment tx, the scanner fetches the receipt to extract the actual deployed contract address.

It walks backwards through blocks, collecting unique deployer addresses and their contracts, skipping anyone already granted. The Basescan API fills in additional history when available, fetching the full transaction list for each deployer.

This approach is better than scraping social feeds because it's trustless. You can't fake a contract deployment.

### Step 3: The Verifier

Once the scanner finds a deployer, the verifier builds their full on-chain profile. It runs three checks in parallel:

1. **Transaction count** via `eth_getTransactionCount` - filters out one-shot deployers
2. **Contract inventory** via Basescan API + RPC fallback - gets bytecode size and verification status for each contract
3. **Unique interactors** via Basescan transaction history - counts distinct addresses that touched their contracts

It also checks recency (any activity in the last 7 days) and bytecode size as a complexity proxy. The result is an `OnchainProfile` object with everything the evaluator needs to score.

### Step 4: The Evaluator

The evaluator scores builders on four dimensions, all deterministic:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Novelty | 30% | Number of contracts, bytecode complexity, size variance across contracts |
| Activity | 25% | Transaction count, recency, unique interactors, recent deployments |
| Quality | 25% | Verified contracts, non-trivial bytecode, code size, deployer experience |
| Impact | 20% | User adoption, ecosystem contribution, sustained activity |

Each dimension scores 0-100, then gets weighted into a final score. Threshold is 60/100 to receive a grant. Grant amounts scale linearly from 0.001 to 0.005 ETH based on score.

I deliberately made this rule-based instead of using an LLM for scoring. The evaluation is fully deterministic and reproducible. Given the same on-chain data, you always get the same score. No prompt sensitivity, no hallucinated reasoning.

The evaluator also generates a human-readable summary for each builder that gets hashed and stored on-chain as the `reasonHash`.

### Step 5: The Funder

The funder module wraps ethers.js interactions with the PatronTreasury contract. It calls `disburse()` with the recipient, reason hash, and ETH value. After the transaction confirms, it parses the `GrantDisbursed` event from the receipt to extract the grant ID and round ID.

Safety checks: it verifies wallet balance before each grant (keeping 0.001 ETH reserved for gas), caps grants per round at 3, and prevents double-granting to the same address.

### Step 6: The Reporter

Every grant and round summary gets logged to console with structured output. Farcaster integration is wired through the Neynar API. When configured, each grant announcement posts as a cast with the recipient, amount, score, evaluation summary, and a link to the transaction on Basescan.

### Step 7: The Frontend

React 19 + Vite + Tailwind CSS 4 for the dashboard. It reads directly from the PatronTreasury contract using viem. No backend, no database. The dashboard pulls grant count, total disbursed, treasury balance, and individual grant details straight from on-chain state.

Deployed to Netlify at [the-patron.netlify.app](https://the-patron.netlify.app).

---

## Architecture Decisions

**Why a custom contract instead of just sending ETH directly?** Transparency and verifiability. The contract creates an immutable, indexed log of every grant. Anyone can query it. The reason hash ties each disbursement to a specific evaluation. Without the contract, it's just random ETH transfers with no context.

**Why ethers.js over viem for the agent?** The agent was built fast and ethers.js has the simplest API for signing and sending transactions from a private key. The frontend uses viem because it's better for read-only contract interactions in React.

**Why rule-based scoring instead of LLM evaluation?** Reproducibility. An LLM might give different scores for the same builder on consecutive runs. The scoring rules are transparent and auditable. Anyone can read the evaluator code and understand exactly why a builder got their score.

**Why scan blocks instead of monitoring social feeds?** On-chain truth. Social signals can be gamed. A contract deployment on Base cannot be faked. The scanner finds builders who actually shipped code, not builders who just tweeted about it.

**Why `msg.value` on `disburse()` instead of pre-funding the treasury?** Clean accounting. The agent sends exactly the grant amount with each call. No need to manage a pool balance separately from the wallet balance. The treasury's `receive()` function still accepts direct deposits, but the primary flow is through `disburse()`.

---

## Challenges

**Basescan API rate limits.** Free-tier Basescan gives you 5 calls/second. The scanner needs to check bytecode size and verification status for every contract a deployer created. I added sleep intervals between batches and limited contract checks to 3 per deployer. Still hits limits occasionally on prolific builders.

**Finding real builders on a testnet.** Base Sepolia has a lot of noise: faucet drains, test token deployments, automated bots. The minimum transaction count (5) and bytecode size threshold (500 bytes) filter out most of it, but some junk still gets through. The 60/100 score threshold catches the rest.

**Block scanning coverage.** Scanning 100 blocks (spaced by 5) gives decent coverage but can miss deployers between sampled blocks. This is a tradeoff: scanning every block would be thorough but slow and rate-limit-heavy. For a testnet demo, sampling works fine.

**Gas estimation.** The `disburse()` call forwards ETH to an arbitrary address, which could be a contract with custom receive logic. Gas estimation occasionally underestimates. I added a buffer and handled failures gracefully so a single failed grant doesn't crash the round.

---

## What's Next

**Mainnet deployment.** The contract and agent are production-ready. Deploying to Base mainnet means funding real builders with real ETH. The economics work at micro-grant scale (0.001-0.005 ETH per grant, Base L2 gas costs under $0.01 per tx).

**Smarter scoring.** The current rule-based evaluator works but could be sharper. Adding source code analysis for verified contracts (detecting common patterns like DEX routers, lending pools, NFT mechanics) would improve novelty scoring. Contract interaction graph analysis could better measure impact.

**Social feed integration.** The scanner currently relies purely on block data. Adding Farcaster monitoring for casts mentioning Base deployments would surface builders earlier and provide social context for evaluations.

**Community treasury.** Right now only the agent wallet can fund the treasury. Opening it to community deposits (while keeping disbursement autonomous) would let the community pool resources behind the agent's judgment.

**Grant tracking.** Following up on funded builders to see if they kept building. A "returning builder" bonus for repeat deployers who continue shipping after receiving a grant.
