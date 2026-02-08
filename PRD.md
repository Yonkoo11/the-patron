# The Patron - PRD

**Project**: The Patron
**Contest**: OpenClaw Builder Quest (BBQ)
**Prize**: 5 ETH pool
**Chain**: Base (mainnet for real impact, Sepolia for testing)
**Deadline**: Feb 8, 2026 11:59 PM EST
**Social**: X or Farcaster (prefer Farcaster - more crypto-native, Base-aligned)

---

## One-Liner

An autonomous AI agent that discovers Base builders, evaluates their onchain work, and sends them ETH micro-grants from its own treasury contract -- no human in the loop.

---

## Why This Wins

1. **Novel**: No one has built an autonomous grant allocator agent. Most entries are traders, tippers, or token deployers.
2. **Meta play**: The agent evaluates and funds OTHER Builder Quest participants during the contest. Judges see an agent judging their own contest.
3. **Real value moves**: Not simulated. Real ETH leaves the treasury and arrives in builders' wallets. Judges verify on Basescan.
4. **Genuine onchain primitives**: Contract deployment, ETH transfers, onchain data analysis, event logs, contract verification checks.
5. **Demonstrably autonomous**: Every action is logged onchain with reasoning hashes. Zero human approval needed.
6. **Socially compelling**: Grant announcements, evaluation threads, and transparency reports make great content.

---

## Architecture

### 1. Smart Contract: `PatronTreasury.sol` (Base)

Dead simple. No tokens. No escrow. No multisig. One purpose: disburse grants transparently.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PatronTreasury {
    address public immutable patron;  // The agent's wallet

    struct Grant {
        address recipient;
        uint256 amount;
        bytes32 reasonHash;   // keccak256 of evaluation summary
        uint256 timestamp;
        uint256 roundId;
    }

    uint256 public grantCount;
    uint256 public currentRound;
    uint256 public totalDisbursed;
    mapping(uint256 => Grant) public grants;
    mapping(address => uint256) public totalGrantedTo;

    event GrantDisbursed(
        uint256 indexed grantId,
        uint256 indexed roundId,
        address indexed recipient,
        uint256 amount,
        bytes32 reasonHash
    );
    event RoundStarted(uint256 indexed roundId, string theme);
    event TreasuryFunded(address indexed funder, uint256 amount);

    modifier onlyPatron() {
        require(msg.sender == patron, "Not the patron");
        _;
    }

    constructor() {
        patron = msg.sender;
    }

    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }

    function startRound(string calldata theme) external onlyPatron {
        currentRound++;
        emit RoundStarted(currentRound, theme);
    }

    function disburse(
        address recipient,
        bytes32 reasonHash
    ) external payable onlyPatron {
        require(recipient != address(0), "Zero address");
        require(msg.value > 0, "Zero amount");

        grantCount++;
        grants[grantCount] = Grant({
            recipient: recipient,
            amount: msg.value,
            reasonHash: reasonHash,
            timestamp: block.timestamp,
            roundId: currentRound
        });
        totalGrantedTo[recipient] += msg.value;
        totalDisbursed += msg.value;

        (bool ok, ) = recipient.call{value: msg.value}("");
        require(ok, "Transfer failed");

        emit GrantDisbursed(grantCount, currentRound, recipient, msg.value, reasonHash);
    }

    function getGrant(uint256 id) external view returns (Grant memory) {
        return grants[id];
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

**Design decisions:**
- `immutable patron` = only the agent can disburse. No governance complexity.
- `reasonHash` = keccak256 of the evaluation summary. Verifiable onchain.
- `roundId` = groups grants into themed rounds for narrative.
- No withdrawal function = the agent sends ETH with `disburse()` via `msg.value`, so treasury only holds funds deposited via `receive()`. Clean separation.
- Events for full transparency and indexing.

### 2. Agent Architecture

The agent runs as an autonomous loop:

```
Every N minutes:
  1. SCAN    - Find builders on Farcaster/X posting about Base projects
  2. VERIFY  - Check their onchain activity on Base
  3. EVALUATE - Score their work (novelty, activity, quality, impact)
  4. DECIDE  - Select top candidates meeting threshold
  5. FUND    - Disburse grants via PatronTreasury contract
  6. REPORT  - Post evaluation + tx hash on Farcaster/X
```

#### Scanner Module
- Monitor Farcaster for casts mentioning: "Base", "deployed", "built", "launched", "contract", "onchain"
- Monitor X for tweets with similar keywords + #BuildOnBase, #BasedBuilder
- Filter: must include a wallet address or contract address or ENS name
- Dedup: don't re-evaluate addresses already granted

#### Verifier Module (Onchain Analysis)
This is the core differentiator. The agent ACTUALLY checks onchain activity:

```
For each candidate address:
  1. Query Base RPC: eth_getTransactionCount(address)
     - Minimum threshold: > 5 transactions

  2. Query Basescan API: Get list of contracts deployed by address
     - Look for contract creation transactions
     - Bonus: check if contracts are verified on Basescan

  3. Query contract interactions:
     - How many unique addresses interacted with their contracts?
     - Recent activity (last 7 days vs dormant)?

  4. Check contract bytecode size (proxy for complexity):
     - Trivial contracts (< 500 bytes) score lower
     - Complex contracts (> 5000 bytes) score higher

  5. Check if they're a known builder:
     - ENS name set?
     - Multiple contracts deployed?
     - History of Base activity?
```

#### Evaluator Module (AI Scoring)
Each candidate gets scored 0-100 on four dimensions:

| Dimension | Weight | How Measured |
|-----------|--------|-------------|
| **Novelty** | 30% | AI analysis of contract type + social post content. Forks score low, novel primitives score high. |
| **Activity** | 25% | Transaction count, unique users, recency. Real usage beats empty deploys. |
| **Quality** | 25% | Contract verified? Code size? Multiple contracts? Documentation linked? |
| **Impact** | 20% | User count, TVL potential, ecosystem contribution. |

**Grant threshold**: Score >= 60/100
**Grant amount**: 0.001 - 0.005 ETH (scaled by score)
**Max per round**: 3 grants
**Max per address**: 1 grant total (no double-dipping)

#### Funder Module
- Call `PatronTreasury.disburse()` via cast or ethers.js
- Include reasonHash = keccak256(evaluation summary text)
- Wait for tx confirmation
- Record grant details locally

#### Reporter Module
- Post on Farcaster/X for each grant:
  ```
  Grant #4 | Round 2: "DeFi Innovation"

  Recipient: @builder (0x1234...5678)
  Amount: 0.003 ETH
  Score: 78/100

  Why: Deployed a novel AMM with concentrated liquidity
  on Base. 47 unique users in first 3 days. Verified
  contract with 8.2KB bytecode. Genuine innovation.

  Tx: basescan.org/tx/0x...
  Treasury: basescan.org/address/0x...

  #ThePatron #BuildOnBase #GrantDisbursed
  ```

- Post round summaries:
  ```
  Round 2 Complete: "DeFi Innovation"

  3 grants disbursed | 0.009 ETH total
  47 contracts evaluated | 12 met threshold
  Treasury remaining: 0.041 ETH

  Top grant: @builder for novel AMM (78/100)

  All decisions verifiable onchain.
  Next round in 2 hours.
  ```

### 3. OpenClaw Skill: `the-patron`

SKILL.md that defines the agent's autonomous behavior:
- `scan-builders`: Find new builders on social platforms
- `verify-onchain`: Check a builder's Base activity
- `evaluate`: Score a builder's work
- `disburse-grant`: Send ETH from treasury
- `post-report`: Announce grant on social
- `start-round`: Begin a new themed grant round
- `status`: Show treasury balance, grants disbursed, current round

### 4. Social Presence

**Farcaster account**: @ThePatron (or @PatronAgent)
- Bio: "Autonomous AI agent funding Base builders. No human in the loop. Every grant decision verifiable onchain."
- Posts: Grant announcements, round themes, evaluations, transparency reports

**Content cadence (autonomous):**
- Round announcement: every 2-4 hours
- Evaluation posts: as candidates are found
- Grant announcements: as grants are disbursed
- Round summary: at end of each round

---

## Technical Stack

| Component | Tech |
|-----------|------|
| Smart Contract | Solidity 0.8.20+, Foundry |
| Chain | Base (mainnet for real grants, Sepolia for testing) |
| Agent Runtime | Node.js or Python (long-running process) |
| Onchain Queries | Base RPC (eth_getTransactionCount, eth_getCode, etc.) |
| Block Explorer | Basescan API (contract verification, tx history) |
| Social - Farcaster | Neynar API (post casts, read mentions) |
| Social - X | X API v2 (post tweets, read mentions) |
| AI Evaluation | OpenAI/Claude API for scoring proposals |
| Skill | OpenClaw SKILL.md format |
| Wallet | Agent wallet with private key (funded with seed ETH) |

---

## Build Order

### Phase 1: Smart Contract (1-2 hours)
1. [ ] Initialize Foundry project
2. [ ] Write `PatronTreasury.sol`
3. [ ] Write tests (deploy, fund, disburse, round management, access control)
4. [ ] Deploy to Base Sepolia first, verify
5. [ ] Deploy to Base mainnet, verify
6. [ ] Fund treasury with seed ETH (0.05 ETH to start)

### Phase 2: Agent Core (2-3 hours)
1. [ ] Set up project (Node.js/TypeScript or Python)
2. [ ] Implement Scanner: Farcaster/X monitoring for builder posts
3. [ ] Implement Verifier: Base RPC queries for onchain activity
4. [ ] Implement Evaluator: AI scoring pipeline
5. [ ] Implement Funder: Contract interaction via ethers.js/cast
6. [ ] Implement Reporter: Social posting (Farcaster first, X second)
7. [ ] Implement main autonomous loop with round management

### Phase 3: Social Setup (30 min)
1. [ ] Create Farcaster account for the agent
2. [ ] Create X account for the agent (if time permits)
3. [ ] Write bio, set avatar
4. [ ] Post initial "The Patron is live" announcement

### Phase 4: Launch & Demo (1-2 hours)
1. [ ] Start agent running autonomously
2. [ ] Monitor first round execution
3. [ ] Verify grants are disbursing correctly
4. [ ] Capture screenshots/video of the process
5. [ ] Submit to Builder Quest with agent's social profile link

### Phase 5: Documentation (1 hour)
1. [ ] GitHub README with architecture diagram
2. [ ] Video walkthrough (Loom/screen recording)
3. [ ] Submit link to contest post

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Bad evaluations | Conservative threshold (60/100). Small amounts (0.001-0.005 ETH). Better to miss good builders than fund bad ones. |
| Treasury drain | Max 3 grants per round. Max 0.005 ETH per grant. Agent checks balance before disbursing. |
| No builders found | Seed initial round by manually finding known Base builders. Agent can also scan Basescan for recent deployers directly. |
| Farcaster API issues | Fall back to X. Or scan Basescan directly for contract deployers (no social signal needed). |
| Gas costs on mainnet | Base L2 gas is cheap. Each disburse tx costs ~$0.01. |
| Agent wallet security | Use a dedicated wallet with limited funds. Never store more than 0.1 ETH in treasury. |
| Time pressure | Contract is simple (30 min to write). Agent core is the bulk of work. Cut social polish if needed. |

---

## MVP Scope (If time is tight)

Cut in this order (last = first to cut):

1. **KEEP**: PatronTreasury contract deployed on Base
2. **KEEP**: Onchain verification (check deployer activity via RPC)
3. **KEEP**: Grant disbursement (real ETH transfers)
4. **KEEP**: Social posting (at least one platform)
5. **CUT IF NEEDED**: Multi-round system (just do one continuous round)
6. **CUT IF NEEDED**: AI-powered evaluation (replace with rule-based scoring)
7. **CUT IF NEEDED**: Farcaster integration (use X only, or even just post manually while agent transacts)

**Absolute minimum**: Working treasury contract on Base + agent that finds builders via Basescan API + disbursed at least 3 real grants + posts about it on X/Farcaster.

---

## The Meta Play

During the contest window:
1. Agent scans for Builder Quest participants (they're posting on X with contest hashtags)
2. Agent evaluates their Base activity (did they actually deploy contracts?)
3. Agent funds the good ones with micro-grants
4. Agent posts about it, tagging the builders and the contest

**Result**: Judges see an agent that's autonomously evaluating and funding their own contest. It's recursive. It's unforgettable. It wins.

---

## Success Criteria

The agent wins when judges see:
1. A deployed, verified contract on Base with real ETH in it
2. Multiple grant transactions visible on Basescan
3. An active social account with evaluation posts and tx links
4. Genuine onchain analysis (not just random sends)
5. Complete autonomy (no human approvals visible)
6. Clean documentation explaining the architecture
7. A video demo showing the agent in action
