import { scanBasescanDeployers } from "./scanner.js";
import { verifyBuilder } from "./verifier.js";
import { evaluateBuilder, calculateGrantAmount } from "./evaluator.js";
import { disburseGrant, startRound, getTreasuryStatus, getWalletBalance, getWalletAddress } from "./funder.js";
import { postGrantAnnouncement, postRoundSummary, postAgentLive } from "./reporter.js";
import { config } from "./config.js";
import type { AgentState, GrantRecord } from "./types.js";

const ROUND_THEMES = [
  "Base Builders",
  "DeFi Innovation",
  "Infrastructure",
  "Consumer Apps",
  "Creative Onchain",
  "Public Goods",
  "Open Source",
  "Ecosystem Tools",
];

/**
 * The Patron: Autonomous grant-giving agent.
 *
 * Loop:
 *   1. SCAN  - Find builders who deployed contracts on Base
 *   2. VERIFY - Check their onchain activity
 *   3. EVALUATE - Score their work
 *   4. DECIDE - Select top candidates meeting threshold
 *   5. FUND  - Disburse grants via PatronTreasury contract
 *   6. REPORT - Post evaluation + tx hash
 */
async function runRound(state: AgentState): Promise<GrantRecord[]> {
  const roundTheme = ROUND_THEMES[state.currentRound % ROUND_THEMES.length];

  console.log("\n" + "=".repeat(60));
  console.log(`ROUND ${state.currentRound + 1}: "${roundTheme}"`);
  console.log("=".repeat(60));

  // 1. Start new round onchain
  try {
    await startRound(roundTheme);
  } catch (err) {
    console.error("[Agent] Failed to start round:", err);
    return [];
  }

  state.currentRound++;
  state.roundGrants = 0;

  // 2. Scan for builders
  const candidates = await scanBasescanDeployers(state.grantedAddresses, 20);
  if (candidates.length === 0) {
    console.log("[Agent] No new candidates found this round.");
    return [];
  }

  // 3. Verify and evaluate each candidate
  const grants: GrantRecord[] = [];
  let evaluated = 0;

  for (const candidate of candidates) {
    if (state.roundGrants >= config.grant.maxPerRound) {
      console.log("[Agent] Max grants per round reached.");
      break;
    }

    // Skip already granted
    if (state.grantedAddresses.has(candidate.address.toLowerCase())) {
      continue;
    }

    try {
      // Verify onchain
      const profile = await verifyBuilder(candidate);

      // Skip if below minimum activity
      if (profile.txCount < config.grant.minTxCount) {
        console.log(`[Agent] ${candidate.address}: too few transactions (${profile.txCount}), skipping`);
        continue;
      }

      if (profile.contractsDeployed.length === 0) {
        console.log(`[Agent] ${candidate.address}: no contracts deployed, skipping`);
        continue;
      }

      evaluated++;

      // Evaluate
      const score = evaluateBuilder(profile);

      // Check threshold
      if (score.total < config.grant.minScore) {
        console.log(`[Agent] ${candidate.address}: score ${score.total}/100 below threshold (${config.grant.minScore}), skipping`);
        continue;
      }

      // Calculate grant amount
      const amount = calculateGrantAmount(score.total);

      // Check wallet balance
      const walletBalance = parseFloat(await getWalletBalance());
      if (walletBalance < amount + 0.001) { // Keep 0.001 for gas
        console.log("[Agent] Insufficient wallet balance. Stopping grants.");
        break;
      }

      // Disburse
      const grant = await disburseGrant(candidate.address, amount, score);
      grants.push(grant);

      // Record
      state.grantedAddresses.add(candidate.address.toLowerCase());
      state.roundGrants++;

      // Report
      await postGrantAnnouncement(grant);

      // Rate limit between grants
      await sleep(2000);
    } catch (err) {
      console.error(`[Agent] Error processing ${candidate.address}:`, err);
    }
  }

  // Post round summary
  try {
    const status = await getTreasuryStatus();
    await postRoundSummary(
      state.currentRound,
      roundTheme,
      grants,
      status.balance,
      evaluated
    );
  } catch (err) {
    console.error("[Agent] Error posting round summary:", err);
  }

  return grants;
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║         THE PATRON - AUTONOMOUS          ║");
  console.log("║      Base Builder Micro-Grant Agent       ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();

  // Check configuration
  if (!config.privateKey) {
    console.error("ERROR: PRIVATE_KEY not set. See .env.example");
    process.exit(1);
  }
  if (!config.treasuryAddress) {
    console.error("ERROR: TREASURY_ADDRESS not set. Deploy the contract first.");
    process.exit(1);
  }

  const walletAddr = getWalletAddress();
  console.log(`Agent wallet: ${walletAddr}`);
  console.log(`Network: ${config.network}`);
  console.log(`Treasury: ${config.treasuryAddress}`);
  console.log(`Explorer: ${config.basescanExplorer}`);

  try {
    const balance = await getWalletBalance();
    console.log(`Wallet balance: ${balance} ETH`);

    const status = await getTreasuryStatus();
    console.log(`Treasury balance: ${status.balance} ETH`);
    console.log(`Grants disbursed: ${status.grantCount}`);
    console.log(`Total disbursed: ${status.totalDisbursed} ETH`);
    console.log(`Current round: ${status.currentRound}`);
  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }

  // Post launch announcement
  await postAgentLive(config.treasuryAddress);

  // Agent state
  const state: AgentState = {
    grantedAddresses: new Set(),
    currentRound: 0,
    roundGrants: 0,
    lastScanTime: 0,
  };

  // Load existing grants to avoid double-granting
  try {
    const status = await getTreasuryStatus();
    state.currentRound = status.currentRound;
  } catch {
    // Fresh start
  }

  // Autonomous loop
  const ROUND_INTERVAL = 30 * 60 * 1000; // 30 minutes between rounds
  console.log(`\nStarting autonomous loop (${ROUND_INTERVAL / 60000} min intervals)...\n`);

  while (true) {
    try {
      const grants = await runRound(state);
      console.log(`\n[Agent] Round complete. ${grants.length} grants disbursed.`);

      // Check if we should stop
      const balance = parseFloat(await getWalletBalance());
      if (balance < 0.002) {
        console.log("[Agent] Wallet balance too low. Stopping.");
        break;
      }
    } catch (err) {
      console.error("[Agent] Round error:", err);
    }

    console.log(`[Agent] Next round in ${ROUND_INTERVAL / 60000} minutes...`);
    await sleep(ROUND_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
