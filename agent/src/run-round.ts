import { scanBasescanDeployers } from "./scanner.js";
import { verifyBuilder } from "./verifier.js";
import { evaluateBuilder, calculateGrantAmount } from "./evaluator.js";
import { disburseGrant, startRound, getTreasuryStatus, getWalletBalance } from "./funder.js";
import { postGrantAnnouncement, postRoundSummary } from "./reporter.js";
import { config } from "./config.js";
import type { GrantRecord } from "./types.js";

/**
 * Run a single grant round: scan -> verify -> evaluate -> disburse -> report
 */
async function main() {
  const theme = process.argv[2] || "Base Builders";
  const minScore = config.grant.minScore;

  console.log("╔══════════════════════════════════════════╗");
  console.log(`║  THE PATRON - Round: "${theme}"`);
  console.log(`║  Min score: ${minScore} | Max grants: ${config.grant.maxPerRound}`);
  console.log("╚══════════════════════════════════════════╝\n");

  // Check balance
  const balance = await getWalletBalance();
  console.log(`Wallet balance: ${balance} ETH\n`);

  // Start round onchain
  console.log("Starting round onchain...");
  const roundTxHash = await startRound(theme);
  console.log(`Round TX: ${config.basescanExplorer}/tx/${roundTxHash}\n`);

  // Scan for builders
  console.log("Scanning for builders...\n");
  const candidates = await scanBasescanDeployers(new Set(), 20);

  // Filter out our own address
  const filtered = candidates.filter(
    c => c.address !== "0x15545100bf579a5a6492499126e2b076a6890b98"
  );

  console.log(`\nEvaluating ${filtered.length} candidates...\n`);

  const grants: GrantRecord[] = [];
  let evaluated = 0;

  for (const candidate of filtered) {
    if (grants.length >= config.grant.maxPerRound) {
      console.log("Max grants per round reached.\n");
      break;
    }

    try {
      const profile = await verifyBuilder(candidate);

      if (profile.txCount < config.grant.minTxCount) continue;
      if (profile.contractsDeployed.length === 0) continue;

      evaluated++;
      const score = evaluateBuilder(profile);

      if (score.total < minScore) {
        console.log(`  SKIP: ${candidate.address} (${score.total}/100)\n`);
        continue;
      }

      const amount = calculateGrantAmount(score.total);

      // Check wallet balance
      const currentBalance = parseFloat(await getWalletBalance());
      if (currentBalance < amount + 0.0005) {
        console.log("Insufficient balance. Stopping.\n");
        break;
      }

      // Disburse!
      console.log(`\n  >>> DISBURSING ${amount.toFixed(4)} ETH to ${candidate.address} (score: ${score.total}/100)`);
      const grant = await disburseGrant(candidate.address, amount, score);
      grants.push(grant);

      await postGrantAnnouncement(grant);
      console.log();

      // Rate limit
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  Error with ${candidate.address}:`, err);
    }
  }

  // Round summary
  console.log("\n" + "=".repeat(60));
  const status = await getTreasuryStatus();
  await postRoundSummary(status.currentRound, theme, grants, status.balance, evaluated);

  console.log(`\nRound complete: ${grants.length} grants disbursed`);
  console.log(`Treasury: ${config.basescanExplorer}/address/${config.treasuryAddress}`);

  for (const g of grants) {
    console.log(`  Grant #${g.grantId}: ${g.recipient} | ${g.amount} ETH | ${g.evaluation.total}/100`);
    console.log(`  TX: ${config.basescanExplorer}/tx/${g.txHash}`);
  }
}

main().catch(console.error);
