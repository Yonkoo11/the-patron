import { scanBasescanDeployers } from "./scanner.js";
import { verifyBuilder } from "./verifier.js";
import { evaluateBuilder, calculateGrantAmount } from "./evaluator.js";
import { disburseGrant, startRound, getTreasuryStatus, getWalletBalance, getWalletAddress } from "./funder.js";
import { postGrantAnnouncement } from "./reporter.js";
import { config } from "./config.js";

/**
 * CLI interface for manual agent operations.
 * Usage: tsx src/cli.ts <command> [args]
 */

const command = process.argv[2];

async function main() {
  switch (command) {
    case "scan":
      await cmdScan();
      break;
    case "evaluate":
      await cmdEvaluate(process.argv[3]);
      break;
    case "disburse":
      await cmdDisburse(process.argv[3]);
      break;
    case "status":
      await cmdStatus();
      break;
    case "round":
      await cmdRound(process.argv[3]);
      break;
    default:
      console.log("Usage: tsx src/cli.ts <command> [args]");
      console.log("");
      console.log("Commands:");
      console.log("  scan              - Scan Base for builder candidates");
      console.log("  evaluate <addr>   - Evaluate a specific address");
      console.log("  disburse <addr>   - Evaluate and disburse grant to address");
      console.log("  status            - Show treasury and agent status");
      console.log("  round <theme>     - Start a new grant round");
      break;
  }
}

async function cmdScan() {
  console.log("Scanning for builders on Base...\n");
  const candidates = await scanBasescanDeployers(new Set(), 10);
  console.log(`\nFound ${candidates.length} candidates:`);
  for (const c of candidates) {
    console.log(`  ${c.address} (source: ${c.source})`);
  }
}

async function cmdEvaluate(address?: string) {
  if (!address) {
    console.log("Usage: tsx src/cli.ts evaluate <address>");
    return;
  }

  console.log(`Evaluating ${address}...\n`);
  const profile = await verifyBuilder({ address, source: "basescan", discoveredAt: Date.now() });
  const score = evaluateBuilder(profile);

  console.log("\n--- Evaluation Result ---");
  console.log(`Address:    ${address}`);
  console.log(`TX Count:   ${profile.txCount}`);
  console.log(`Contracts:  ${profile.contractsDeployed.length}`);
  console.log(`Verified:   ${profile.contractsDeployed.filter(c => c.isVerified).length}`);
  console.log(`Interactors:${profile.totalUniqueInteractors}`);
  console.log(`Recent:     ${profile.recentActivity ? "Yes" : "No"}`);
  console.log();
  console.log(`Novelty:    ${score.novelty}/100`);
  console.log(`Activity:   ${score.activity}/100`);
  console.log(`Quality:    ${score.quality}/100`);
  console.log(`Impact:     ${score.impact}/100`);
  console.log(`TOTAL:      ${score.total}/100`);
  console.log();
  console.log(`Summary:    ${score.summary}`);

  if (score.total >= config.grant.minScore) {
    const amount = calculateGrantAmount(score.total);
    console.log(`\nGrant eligible: ${amount.toFixed(4)} ETH`);
  } else {
    console.log(`\nBelow grant threshold (${config.grant.minScore})`);
  }
}

async function cmdDisburse(address?: string) {
  if (!address) {
    console.log("Usage: tsx src/cli.ts disburse <address>");
    return;
  }

  console.log(`Evaluating and disbursing to ${address}...\n`);

  const profile = await verifyBuilder({ address, source: "basescan", discoveredAt: Date.now() });
  const score = evaluateBuilder(profile);

  if (score.total < config.grant.minScore) {
    console.log(`Score ${score.total}/100 below threshold (${config.grant.minScore}). No grant.`);
    return;
  }

  const amount = calculateGrantAmount(score.total);
  console.log(`Score: ${score.total}/100. Disbursing ${amount.toFixed(4)} ETH...`);

  const grant = await disburseGrant(address, amount, score);
  await postGrantAnnouncement(grant);

  console.log(`\nGrant #${grant.grantId} disbursed!`);
  console.log(`TX: ${config.basescanExplorer}/tx/${grant.txHash}`);
}

async function cmdStatus() {
  console.log("The Patron - Status\n");

  try {
    const wallet = getWalletAddress();
    const balance = await getWalletBalance();
    console.log(`Wallet:     ${wallet}`);
    console.log(`Balance:    ${balance} ETH`);
    console.log(`Network:    ${config.network}`);
  } catch (err) {
    console.log(`Wallet:     not configured`);
  }

  try {
    const status = await getTreasuryStatus();
    console.log(`\nTreasury:   ${config.treasuryAddress}`);
    console.log(`Balance:    ${status.balance} ETH`);
    console.log(`Grants:     ${status.grantCount}`);
    console.log(`Disbursed:  ${status.totalDisbursed} ETH`);
    console.log(`Round:      ${status.currentRound}`);
    console.log(`Patron:     ${status.patronAddress}`);
    console.log(`Explorer:   ${config.basescanExplorer}/address/${config.treasuryAddress}`);
  } catch (err) {
    console.log(`\nTreasury:   not connected (${err})`);
  }
}

async function cmdRound(theme?: string) {
  if (!theme) {
    console.log("Usage: tsx src/cli.ts round <theme>");
    return;
  }

  console.log(`Starting round: "${theme}"...`);
  const txHash = await startRound(theme);
  console.log(`Round started! TX: ${config.basescanExplorer}/tx/${txHash}`);
}

main().catch(console.error);
