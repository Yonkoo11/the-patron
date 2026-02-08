import { config } from "./config.js";
import type { GrantRecord } from "./types.js";

/**
 * Reporter module: posts grant announcements to Farcaster via Neynar API.
 * Falls back to console logging if Neynar is not configured.
 */

export async function postGrantAnnouncement(grant: GrantRecord): Promise<string | null> {
  const shortAddr = `${grant.recipient.slice(0, 6)}...${grant.recipient.slice(-4)}`;
  const txUrl = `${config.basescanExplorer}/tx/${grant.txHash}`;

  const text = [
    `Grant #${grant.grantId} | Round ${grant.roundId}`,
    ``,
    `Recipient: ${shortAddr}`,
    `Amount: ${grant.amount} ETH`,
    `Score: ${grant.evaluation.total}/100`,
    ``,
    grant.evaluation.summary,
    ``,
    `Tx: ${txUrl}`,
    ``,
    `#ThePatron #BuildOnBase #AutonomousGrants`,
  ].join("\n");

  console.log("\n[Reporter] Grant announcement:");
  console.log("─".repeat(50));
  console.log(text);
  console.log("─".repeat(50));

  // Post to Farcaster if configured
  if (config.neynarApiKey) {
    return await postToFarcaster(text);
  }

  return null;
}

export async function postRoundSummary(
  roundId: number,
  theme: string,
  grants: GrantRecord[],
  treasuryBalance: string,
  evaluated: number
): Promise<string | null> {
  const totalEth = grants.reduce((sum, g) => sum + parseFloat(g.amount), 0);
  const topGrant = grants.sort((a, b) => b.evaluation.total - a.evaluation.total)[0];
  const topAddr = topGrant
    ? `${topGrant.recipient.slice(0, 6)}...${topGrant.recipient.slice(-4)}`
    : "none";

  const text = [
    `Round ${roundId} Complete: "${theme}"`,
    ``,
    `${grants.length} grants disbursed | ${totalEth.toFixed(4)} ETH total`,
    `${evaluated} addresses evaluated`,
    `Treasury remaining: ${treasuryBalance} ETH`,
    ``,
    topGrant ? `Top grant: ${topAddr} (${topGrant.evaluation.total}/100)` : "",
    ``,
    `All decisions verifiable onchain.`,
    ``,
    `#ThePatron #BuildOnBase`,
  ].filter(Boolean).join("\n");

  console.log("\n[Reporter] Round summary:");
  console.log("─".repeat(50));
  console.log(text);
  console.log("─".repeat(50));

  if (config.neynarApiKey) {
    return await postToFarcaster(text);
  }

  return null;
}

export async function postAgentLive(treasuryAddress: string): Promise<string | null> {
  const text = [
    `The Patron is live.`,
    ``,
    `I'm an autonomous AI agent that discovers builders on Base,`,
    `evaluates their onchain work, and sends them ETH micro-grants.`,
    ``,
    `No human in the loop. Every decision verifiable onchain.`,
    ``,
    `Treasury: ${config.basescanExplorer}/address/${treasuryAddress}`,
    ``,
    `#ThePatron #BuildOnBase #AutonomousGrants`,
  ].join("\n");

  console.log("\n[Reporter] Launch announcement:");
  console.log("─".repeat(50));
  console.log(text);
  console.log("─".repeat(50));

  if (config.neynarApiKey) {
    return await postToFarcaster(text);
  }

  return null;
}

async function postToFarcaster(text: string): Promise<string | null> {
  try {
    const resp = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": config.neynarApiKey,
      },
      body: JSON.stringify({ text, signer_uuid: process.env.NEYNAR_SIGNER_UUID }),
    });

    if (!resp.ok) {
      console.error(`[Reporter] Farcaster post failed: ${resp.status} ${resp.statusText}`);
      return null;
    }

    const data = await resp.json() as { cast?: { hash: string } };
    console.log(`[Reporter] Posted to Farcaster: ${data.cast?.hash}`);
    return data.cast?.hash || null;
  } catch (err) {
    console.error("[Reporter] Farcaster error:", err);
    return null;
  }
}
