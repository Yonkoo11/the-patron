import { config } from "./config.js";
import type { BuilderCandidate, ContractInfo } from "./types.js";

/**
 * Scanner module: finds builders by scanning Basescan for recent contract deployers.
 * This is the primary discovery method -- it finds real onchain activity directly.
 */

interface BasescanTx {
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  timeStamp: string;
  isError: string;
}

export async function scanBasescanDeployers(
  grantedAddresses: Set<string>,
  maxResults = 20
): Promise<BuilderCandidate[]> {
  console.log("[Scanner] Scanning Basescan for recent contract deployers...");

  // Get recent contract creation transactions from the latest blocks
  const candidates: BuilderCandidate[] = [];
  const seen = new Set<string>();

  try {
    // Strategy: Get recent internal transactions that created contracts
    // Use Basescan API to find contract creation txs
    const url = new URL(config.basescanUrl);
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "txlist");
    url.searchParams.set("address", "0x4200000000000000000000000000000000000006"); // WETH -- high traffic
    url.searchParams.set("startblock", "0");
    url.searchParams.set("endblock", "99999999");
    url.searchParams.set("page", "1");
    url.searchParams.set("offset", "100");
    url.searchParams.set("sort", "desc");
    if (config.basescanApiKey) {
      url.searchParams.set("apikey", config.basescanApiKey);
    }

    // Alternative: scan recent blocks for contract creations
    const blockUrl = new URL(config.basescanUrl);
    blockUrl.searchParams.set("module", "proxy");
    blockUrl.searchParams.set("action", "eth_blockNumber");
    if (config.basescanApiKey) {
      blockUrl.searchParams.set("apikey", config.basescanApiKey);
    }

    const blockResp = await fetch(blockUrl.toString());
    const blockData = await blockResp.json() as { result: string };
    const latestBlock = parseInt(blockData.result, 16);
    const startBlock = latestBlock - 5000; // ~2.5 hours of blocks

    // Get transactions in recent blocks and filter for contract creations
    // Use the "txlistinternal" to find contract creation events
    const internalUrl = new URL(config.basescanUrl);
    internalUrl.searchParams.set("module", "account");
    internalUrl.searchParams.set("action", "txlistinternal");
    internalUrl.searchParams.set("startblock", startBlock.toString());
    internalUrl.searchParams.set("endblock", latestBlock.toString());
    internalUrl.searchParams.set("page", "1");
    internalUrl.searchParams.set("offset", "100");
    internalUrl.searchParams.set("sort", "desc");
    if (config.basescanApiKey) {
      internalUrl.searchParams.set("apikey", config.basescanApiKey);
    }

    // Also try: get verified contracts list (these are the serious builders)
    const verifiedUrl = new URL(config.basescanUrl);
    verifiedUrl.searchParams.set("module", "contract");
    verifiedUrl.searchParams.set("action", "listcontracts");
    verifiedUrl.searchParams.set("page", "1");
    verifiedUrl.searchParams.set("offset", "50");
    if (config.basescanApiKey) {
      verifiedUrl.searchParams.set("apikey", config.basescanApiKey);
    }

    // Fetch deployer addresses from recent contract creations
    // For now, use the RPC directly to find recent deployers
    const rpcResp = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBlockByNumber",
        params: [`0x${latestBlock.toString(16)}`, true],
      }),
    });
    const rpcData = await rpcResp.json() as {
      result: {
        transactions: Array<{ from: string; to: string | null; hash: string; creates?: string }>;
      };
    };

    if (rpcData.result?.transactions) {
      for (const tx of rpcData.result.transactions) {
        // Contract creation: to is null
        if (tx.to === null || tx.to === "0x" || tx.creates) {
          const addr = tx.from.toLowerCase();
          if (!seen.has(addr) && !grantedAddresses.has(addr)) {
            seen.add(addr);
            candidates.push({
              address: addr,
              source: "basescan",
              discoveredAt: Date.now(),
            });
          }
        }
      }
    }

    // Scan a few more recent blocks
    for (let i = 1; i <= 10 && candidates.length < maxResults; i++) {
      const blockNum = latestBlock - i * 100;
      try {
        const resp = await fetch(config.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: i + 1,
            method: "eth_getBlockByNumber",
            params: [`0x${blockNum.toString(16)}`, true],
          }),
        });
        const data = await resp.json() as {
          result: {
            transactions: Array<{ from: string; to: string | null; hash: string }>;
          };
        };
        if (data.result?.transactions) {
          for (const tx of data.result.transactions) {
            if (tx.to === null || tx.to === "0x") {
              const addr = tx.from.toLowerCase();
              if (!seen.has(addr) && !grantedAddresses.has(addr)) {
                seen.add(addr);
                candidates.push({
                  address: addr,
                  source: "basescan",
                  discoveredAt: Date.now(),
                });
              }
            }
          }
        }
      } catch {
        // Skip failed block fetches
      }
      // Rate limit
      await sleep(200);
    }
  } catch (err) {
    console.error("[Scanner] Error scanning Basescan:", err);
  }

  console.log(`[Scanner] Found ${candidates.length} unique deployer candidates`);
  return candidates.slice(0, maxResults);
}

/**
 * Get contracts deployed by a specific address using Basescan API
 */
export async function getDeployedContracts(address: string): Promise<ContractInfo[]> {
  const contracts: ContractInfo[] = [];

  try {
    const url = new URL(config.basescanUrl);
    url.searchParams.set("module", "account");
    url.searchParams.set("action", "txlist");
    url.searchParams.set("address", address);
    url.searchParams.set("startblock", "0");
    url.searchParams.set("endblock", "99999999");
    url.searchParams.set("page", "1");
    url.searchParams.set("offset", "100");
    url.searchParams.set("sort", "desc");
    if (config.basescanApiKey) {
      url.searchParams.set("apikey", config.basescanApiKey);
    }

    const resp = await fetch(url.toString());
    const data = await resp.json() as { status: string; result: BasescanTx[] };

    if (data.status === "1" && Array.isArray(data.result)) {
      for (const tx of data.result) {
        // Contract creation: to is empty and contractAddress is set
        if (tx.contractAddress && tx.contractAddress !== "" && tx.isError === "0") {
          // Get bytecode size
          const bytecodeSize = await getContractBytecodeSize(tx.contractAddress);
          const isVerified = await isContractVerified(tx.contractAddress);

          contracts.push({
            address: tx.contractAddress,
            bytecodeSize,
            isVerified,
            createdAt: parseInt(tx.timeStamp) * 1000,
            txHash: tx.hash,
          });
        }
      }
    }
  } catch (err) {
    console.error(`[Scanner] Error fetching contracts for ${address}:`, err);
  }

  return contracts;
}

async function getContractBytecodeSize(contractAddress: string): Promise<number> {
  try {
    const resp = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [contractAddress, "latest"],
      }),
    });
    const data = await resp.json() as { result: string };
    // bytecode is hex, 2 chars per byte, minus "0x" prefix
    return data.result ? Math.floor((data.result.length - 2) / 2) : 0;
  } catch {
    return 0;
  }
}

async function isContractVerified(contractAddress: string): Promise<boolean> {
  try {
    const url = new URL(config.basescanUrl);
    url.searchParams.set("module", "contract");
    url.searchParams.set("action", "getabi");
    url.searchParams.set("address", contractAddress);
    if (config.basescanApiKey) {
      url.searchParams.set("apikey", config.basescanApiKey);
    }

    const resp = await fetch(url.toString());
    const data = await resp.json() as { status: string };
    return data.status === "1"; // status 1 = verified
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
