import { ethers } from "ethers";
import { config, TREASURY_ABI } from "./config.js";
import type { GrantRecord, EvaluationScore } from "./types.js";

/**
 * Funder module: disburses grants via the PatronTreasury contract.
 */

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let treasury: ethers.Contract | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }
  return provider;
}

function getWallet(): ethers.Wallet {
  if (!wallet) {
    if (!config.privateKey) throw new Error("PRIVATE_KEY not set");
    wallet = new ethers.Wallet(config.privateKey, getProvider());
  }
  return wallet;
}

function getTreasury(): ethers.Contract {
  if (!treasury) {
    if (!config.treasuryAddress) throw new Error("TREASURY_ADDRESS not set");
    treasury = new ethers.Contract(config.treasuryAddress, TREASURY_ABI, getWallet());
  }
  return treasury;
}

export async function startRound(theme: string): Promise<string> {
  console.log(`[Funder] Starting new round: "${theme}"...`);
  const tx = await getTreasury().startRound(theme);
  const receipt = await tx.wait();
  console.log(`[Funder] Round started. Tx: ${receipt.hash}`);
  return receipt.hash;
}

export async function disburseGrant(
  recipient: string,
  amountEth: number,
  evaluation: EvaluationScore
): Promise<GrantRecord> {
  console.log(`[Funder] Disbursing ${amountEth} ETH to ${recipient}...`);

  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(evaluation.summary));
  const amountWei = ethers.parseEther(amountEth.toFixed(6));

  const tx = await getTreasury().disburse(recipient, reasonHash, { value: amountWei });
  const receipt = await tx.wait();

  // Parse event to get grantId
  const iface = new ethers.Interface(TREASURY_ABI);
  let grantId = 0;
  let roundId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === "GrantDisbursed") {
        grantId = Number(parsed.args[0]);
        roundId = Number(parsed.args[1]);
        break;
      }
    } catch {
      // Not our event
    }
  }

  const record: GrantRecord = {
    grantId,
    roundId,
    recipient,
    amount: amountEth.toFixed(6),
    reasonHash,
    txHash: receipt.hash,
    timestamp: Date.now(),
    evaluation,
  };

  console.log(`[Funder] Grant #${grantId} disbursed. Tx: ${receipt.hash}`);
  return record;
}

export async function getTreasuryStatus(): Promise<{
  balance: string;
  grantCount: number;
  totalDisbursed: string;
  currentRound: number;
  patronAddress: string;
}> {
  const t = getTreasury();
  const [balance, grantCount, totalDisbursed, currentRound, patronAddress] = await Promise.all([
    t.treasuryBalance(),
    t.grantCount(),
    t.totalDisbursed(),
    t.currentRound(),
    t.patron(),
  ]);

  return {
    balance: ethers.formatEther(balance),
    grantCount: Number(grantCount),
    totalDisbursed: ethers.formatEther(totalDisbursed),
    currentRound: Number(currentRound),
    patronAddress,
  };
}

export async function getWalletBalance(): Promise<string> {
  const balance = await getProvider().getBalance(getWallet().address);
  return ethers.formatEther(balance);
}

export function getWalletAddress(): string {
  return getWallet().address;
}
