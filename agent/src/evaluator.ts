import { config } from "./config.js";
import type { OnchainProfile, EvaluationScore } from "./types.js";

/**
 * Evaluator module: scores a builder's work on 4 dimensions.
 * Uses rule-based scoring (fast, deterministic) with optional AI enhancement.
 */
export function evaluateBuilder(profile: OnchainProfile): EvaluationScore {
  console.log(`[Evaluator] Scoring ${profile.address}...`);

  const novelty = scoreNovelty(profile);
  const activity = scoreActivity(profile);
  const quality = scoreQuality(profile);
  const impact = scoreImpact(profile);

  const total = Math.round(
    novelty * config.weights.novelty +
    activity * config.weights.activity +
    quality * config.weights.quality +
    impact * config.weights.impact
  );

  const summary = generateSummary(profile, { novelty, activity, quality, impact, total });

  const score: EvaluationScore = {
    novelty,
    activity,
    quality,
    impact,
    total,
    summary,
  };

  console.log(`[Evaluator] ${profile.address}: ${total}/100 (N:${novelty} A:${activity} Q:${quality} I:${impact})`);
  return score;
}

function scoreNovelty(profile: OnchainProfile): number {
  let score = 0;

  // Multiple contracts = more likely to be building something complex
  const contractCount = profile.contractsDeployed.length;
  if (contractCount >= 5) score += 40;
  else if (contractCount >= 3) score += 30;
  else if (contractCount >= 2) score += 20;
  else if (contractCount >= 1) score += 10;

  // Larger bytecode = more complex contracts (not just hello world)
  const maxBytecode = Math.max(...profile.contractsDeployed.map(c => c.bytecodeSize), 0);
  if (maxBytecode > 10000) score += 35;
  else if (maxBytecode > 5000) score += 25;
  else if (maxBytecode > 2000) score += 15;
  else if (maxBytecode > 500) score += 5;

  // Variety in contract sizes suggests a system, not a single contract
  if (contractCount >= 2) {
    const sizes = profile.contractsDeployed.map(c => c.bytecodeSize);
    const variance = Math.max(...sizes) - Math.min(...sizes);
    if (variance > 3000) score += 25;
    else if (variance > 1000) score += 15;
  }

  return Math.min(100, score);
}

function scoreActivity(profile: OnchainProfile): number {
  let score = 0;

  // Transaction count
  if (profile.txCount > 100) score += 30;
  else if (profile.txCount > 50) score += 25;
  else if (profile.txCount > 20) score += 20;
  else if (profile.txCount > 10) score += 15;
  else if (profile.txCount > 5) score += 10;

  // Recent activity bonus
  if (profile.recentActivity) score += 25;

  // Unique interactors (real usage)
  if (profile.totalUniqueInteractors > 50) score += 30;
  else if (profile.totalUniqueInteractors > 20) score += 25;
  else if (profile.totalUniqueInteractors > 10) score += 20;
  else if (profile.totalUniqueInteractors > 5) score += 15;
  else if (profile.totalUniqueInteractors > 0) score += 10;

  // Multiple contracts deployed recently
  const recentContracts = profile.contractsDeployed.filter(
    c => c.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;
  if (recentContracts >= 3) score += 15;
  else if (recentContracts >= 1) score += 10;

  return Math.min(100, score);
}

function scoreQuality(profile: OnchainProfile): number {
  let score = 0;

  // Verified contracts (serious builders verify their code)
  const verifiedCount = profile.contractsDeployed.filter(c => c.isVerified).length;
  if (verifiedCount >= 3) score += 40;
  else if (verifiedCount >= 2) score += 30;
  else if (verifiedCount >= 1) score += 20;

  // Non-trivial bytecode (> 500 bytes = not a toy)
  const substantialContracts = profile.contractsDeployed.filter(c => c.bytecodeSize > config.grant.minBytecodeSize).length;
  if (substantialContracts >= 3) score += 30;
  else if (substantialContracts >= 2) score += 20;
  else if (substantialContracts >= 1) score += 10;

  // Max bytecode size (complexity indicator)
  const maxBytecode = Math.max(...profile.contractsDeployed.map(c => c.bytecodeSize), 0);
  if (maxBytecode > 8000) score += 20;
  else if (maxBytecode > 4000) score += 15;
  else if (maxBytecode > 2000) score += 10;

  // Transaction history depth (experienced deployer)
  if (profile.txCount > 50) score += 10;

  return Math.min(100, score);
}

function scoreImpact(profile: OnchainProfile): number {
  let score = 0;

  // User adoption (unique interactors)
  if (profile.totalUniqueInteractors > 100) score += 40;
  else if (profile.totalUniqueInteractors > 50) score += 35;
  else if (profile.totalUniqueInteractors > 20) score += 25;
  else if (profile.totalUniqueInteractors > 10) score += 20;
  else if (profile.totalUniqueInteractors > 5) score += 15;
  else if (profile.totalUniqueInteractors > 0) score += 10;

  // Multiple contracts = ecosystem contribution
  if (profile.contractsDeployed.length >= 5) score += 30;
  else if (profile.contractsDeployed.length >= 3) score += 20;
  else if (profile.contractsDeployed.length >= 2) score += 15;
  else if (profile.contractsDeployed.length >= 1) score += 10;

  // Sustained activity
  if (profile.recentActivity && profile.txCount > 20) score += 20;
  else if (profile.recentActivity) score += 10;

  // High tx count = many interactions
  if (profile.txCount > 200) score += 10;

  return Math.min(100, score);
}

function generateSummary(
  profile: OnchainProfile,
  scores: { novelty: number; activity: number; quality: number; impact: number; total: number }
): string {
  const parts: string[] = [];

  const contractCount = profile.contractsDeployed.length;
  const verifiedCount = profile.contractsDeployed.filter(c => c.isVerified).length;
  const maxBytecode = Math.max(...profile.contractsDeployed.map(c => c.bytecodeSize), 0);

  parts.push(`Deployed ${contractCount} contract${contractCount !== 1 ? "s" : ""} on Base`);

  if (verifiedCount > 0) {
    parts.push(`${verifiedCount} verified on Basescan`);
  }

  if (maxBytecode > 5000) {
    parts.push(`largest contract is ${(maxBytecode / 1024).toFixed(1)}KB (substantial complexity)`);
  }

  if (profile.totalUniqueInteractors > 0) {
    parts.push(`${profile.totalUniqueInteractors} unique users interacted with their contracts`);
  }

  if (profile.recentActivity) {
    parts.push("active in the last 7 days");
  }

  parts.push(`${profile.txCount} total transactions`);

  return parts.join(". ") + `. Score: ${scores.total}/100.`;
}

/**
 * Calculate grant amount based on score (0.001 - 0.005 ETH)
 */
export function calculateGrantAmount(score: number): number {
  const range = config.grant.maxAmount - config.grant.minAmount;
  const normalized = (score - config.grant.minScore) / (100 - config.grant.minScore);
  return config.grant.minAmount + range * Math.min(1, Math.max(0, normalized));
}
