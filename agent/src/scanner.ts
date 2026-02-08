import { config } from "./config.js";
import type { BuilderCandidate, ContractInfo } from "./types.js";

/**
 * Scanner module: finds builders by scanning Base blocks for contract deployers.
 * Gets transaction receipts to extract the actual deployed contract addresses.
 */

interface BasescanTx {
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  timeStamp: string;
  isError: string;
}

interface DeployerInfo {
  address: string;
  contractAddresses: string[];
  txHashes: string[];
}

export async function scanBasescanDeployers(
  grantedAddresses: Set<string>,
  maxResults = 20
): Promise<BuilderCandidate[]> {
  console.log("[Scanner] Scanning recent blocks for contract deployers...");

  const deployers = new Map<string, DeployerInfo>();

  try {
    // Get latest block number
    const blockResp = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    const blockData = await blockResp.json() as { result: string };
    const latestBlock = parseInt(blockData.result, 16);

    // Scan recent blocks for contract creation transactions (to=null)
    for (let i = 0; i < 100 && deployers.size < maxResults; i++) {
      const blockNum = latestBlock - i * 5;
      try {
        const resp = await fetch(config.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: i + 2,
            method: "eth_getBlockByNumber",
            params: [`0x${blockNum.toString(16)}`, true],
          }),
        });
        const data = await resp.json() as {
          result: {
            timestamp: string;
            transactions: Array<{ from: string; to: string | null; hash: string }>;
          };
        };

        if (data.result?.transactions) {
          for (const tx of data.result.transactions) {
            if (tx.to === null || tx.to === "0x") {
              const addr = tx.from.toLowerCase();
              if (grantedAddresses.has(addr)) continue;

              // Get receipt to find the deployed contract address
              const contractAddr = await getContractFromReceipt(tx.hash);

              if (!deployers.has(addr)) {
                deployers.set(addr, { address: addr, contractAddresses: [], txHashes: [] });
              }
              const info = deployers.get(addr)!;
              info.txHashes.push(tx.hash);
              if (contractAddr) {
                info.contractAddresses.push(contractAddr);
              }
            }
          }
        }
      } catch {
        // Skip failed block fetches
      }

      // Rate limit
      if (i % 10 === 9) await sleep(300);
    }
  } catch (err) {
    console.error("[Scanner] Error scanning blocks:", err);
  }

  const candidates: BuilderCandidate[] = [];
  for (const [, info] of deployers) {
    candidates.push({
      address: info.address,
      source: "basescan",
      discoveredAt: Date.now(),
      knownContracts: info.contractAddresses,
    });
  }

  console.log(`[Scanner] Found ${candidates.length} unique deployers with ${candidates.reduce((sum, c) => sum + (c.knownContracts?.length || 0), 0)} contracts`);
  return candidates.slice(0, maxResults);
}

/**
 * Get the deployed contract address from a transaction receipt
 */
async function getContractFromReceipt(txHash: string): Promise<string | null> {
  try {
    const resp = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      }),
    });
    const data = await resp.json() as {
      result: { contractAddress: string | null; status: string } | null;
    };
    if (data.result?.status === "0x1" && data.result.contractAddress) {
      return data.result.contractAddress.toLowerCase();
    }
  } catch {
    // silently fail
  }
  return null;
}

/**
 * Get contracts deployed by a specific address.
 * Uses Basescan API first, falls back to known contracts from scanning.
 */
export async function getDeployedContracts(
  address: string,
  knownContracts?: string[]
): Promise<ContractInfo[]> {
  const contracts: ContractInfo[] = [];

  // Try Basescan API first
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
        if (tx.contractAddress && tx.contractAddress !== "" && tx.isError === "0") {
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
    console.error(`[Scanner] Basescan API error for ${address}:`, err);
  }

  // If Basescan returned nothing, use known contracts from block scanning
  if (contracts.length === 0 && knownContracts && knownContracts.length > 0) {
    console.log(`[Scanner] Using ${knownContracts.length} contracts from block scan for ${address}`);
    for (const contractAddr of knownContracts) {
      const bytecodeSize = await getContractBytecodeSize(contractAddr);
      const isVerified = await isContractVerified(contractAddr);
      contracts.push({
        address: contractAddr,
        bytecodeSize,
        isVerified,
        createdAt: Date.now(), // approximate
        txHash: "",
      });
      await sleep(200);
    }
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
    return data.result ? Math.floor((data.result.length - 2) / 2) : 0;
  } catch {
    return 0;
  }
}

async function isContractVerified(contractAddress: string): Promise<boolean> {
  if (!config.basescanApiKey) return false;
  try {
    const url = new URL(config.basescanUrl);
    url.searchParams.set("module", "contract");
    url.searchParams.set("action", "getabi");
    url.searchParams.set("address", contractAddress);
    url.searchParams.set("apikey", config.basescanApiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json() as { status: string };
    return data.status === "1";
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
