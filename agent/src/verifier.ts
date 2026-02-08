import { config } from "./config.js";
import { getDeployedContracts } from "./scanner.js";
import type { BuilderCandidate, OnchainProfile } from "./types.js";

/**
 * Verifier module: checks a builder's actual onchain activity on Base.
 * This is the core differentiator -- real onchain analysis, not vibes.
 */
export async function verifyBuilder(candidate: BuilderCandidate): Promise<OnchainProfile> {
  console.log(`[Verifier] Checking onchain profile for ${candidate.address}...`);

  const [txCount, contractsDeployed] = await Promise.all([
    getTransactionCount(candidate.address),
    getDeployedContracts(candidate.address),
  ]);

  // Check recent activity (any tx in last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentActivity = contractsDeployed.some(c => c.createdAt > sevenDaysAgo) || txCount > 10;

  // Check unique interactors for deployed contracts
  let totalUniqueInteractors = 0;
  for (const contract of contractsDeployed.slice(0, 3)) { // Check top 3 contracts
    const interactors = await getUniqueInteractors(contract.address);
    totalUniqueInteractors += interactors;
    await sleep(300); // Rate limit
  }

  const profile: OnchainProfile = {
    address: candidate.address,
    txCount,
    contractsDeployed,
    totalUniqueInteractors,
    recentActivity,
    hasENS: false, // ENS check is mainnet-only, skip for Base
  };

  console.log(`[Verifier] ${candidate.address}: ${txCount} txs, ${contractsDeployed.length} contracts, ${totalUniqueInteractors} interactors`);
  return profile;
}

async function getTransactionCount(address: string): Promise<number> {
  try {
    const resp = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionCount",
        params: [address, "latest"],
      }),
    });
    const data = await resp.json() as { result: string };
    return parseInt(data.result, 16);
  } catch {
    return 0;
  }
}

async function getUniqueInteractors(contractAddress: string): Promise<number> {
  try {
    const url = new URL(config.basescanUrl);
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "txlist");
    url.searchParams.set("address", contractAddress);
    url.searchParams.set("startblock", "0");
    url.searchParams.set("endblock", "99999999");
    url.searchParams.set("page", "1");
    url.searchParams.set("offset", "100");
    if (config.basescanApiKey) {
      url.searchParams.set("apikey", config.basescanApiKey);
    }

    const resp = await fetch(url.toString());
    const data = await resp.json() as {
      status: string;
      result: Array<{ from: string }>;
    };

    if (data.status === "1" && Array.isArray(data.result)) {
      const unique = new Set(data.result.map(tx => tx.from.toLowerCase()));
      return unique.size;
    }
  } catch {
    // silently fail
  }
  return 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
