import { TwitterApi } from "twitter-api-v2";
import { config } from "./config.js";
import type { GrantRecord } from "./types.js";

/**
 * Reporter module: posts grant announcements to Twitter/X and Farcaster.
 * Falls back to console logging if APIs are not configured.
 */

let twitterClient: TwitterApi | null = null;

function getTwitterClient(): TwitterApi | null {
  if (twitterClient) return twitterClient;
  if (!config.twitter.enabled) return null;

  twitterClient = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
  });
  return twitterClient;
}

export async function postGrantAnnouncement(grant: GrantRecord): Promise<string | null> {
  const shortAddr = `${grant.recipient.slice(0, 6)}...${grant.recipient.slice(-4)}`;
  const txUrl = `${config.basescanExplorer}/tx/${grant.txHash}`;

  const text = [
    `Funded ${shortAddr} with ${grant.amount} ETH`,
    ``,
    `Score: ${grant.evaluation.total}/100`,
    grant.evaluation.summary,
    ``,
    txUrl,
    ``,
    `#BuildOnBase`,
  ].join("\n");

  console.log("\n[Reporter] Grant announcement:");
  console.log("\u2500".repeat(50));
  console.log(text);
  console.log("\u2500".repeat(50));

  // Post to both platforms
  const results = await Promise.allSettled([
    postToTwitter(text),
    postToFarcaster(text),
  ]);

  // Return first successful ID
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
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
    `Round ${roundId} complete.`,
    ``,
    `${grants.length} grants, ${totalEth.toFixed(4)} ETH sent to builders.`,
    `${evaluated} addresses evaluated onchain.`,
    ``,
    topGrant ? `Top score: ${topAddr} at ${topGrant.evaluation.total}/100` : "",
    ``,
    `Treasury: ${treasuryBalance} ETH remaining.`,
    ``,
    `#BuildOnBase`,
  ].filter(Boolean).join("\n");

  console.log("\n[Reporter] Round summary:");
  console.log("\u2500".repeat(50));
  console.log(text);
  console.log("\u2500".repeat(50));

  const results = await Promise.allSettled([
    postToTwitter(text),
    postToFarcaster(text),
  ]);

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }
  return null;
}

export async function postAgentLive(treasuryAddress: string): Promise<string | null> {
  const text = [
    `Online.`,
    ``,
    `Scanning Base for builders shipping real contracts.`,
    `Evaluating their work. Funding the good ones directly.`,
    ``,
    `No applications. No committees. Just code judging code.`,
    ``,
    `${config.basescanExplorer}/address/${treasuryAddress}`,
    ``,
    `#BuildOnBase`,
  ].join("\n");

  console.log("\n[Reporter] Launch announcement:");
  console.log("\u2500".repeat(50));
  console.log(text);
  console.log("\u2500".repeat(50));

  const results = await Promise.allSettled([
    postToTwitter(text),
    postToFarcaster(text),
  ]);

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }
  return null;
}

/**
 * Post a standalone tweet (for manual/ad-hoc posts).
 */
export async function tweet(text: string): Promise<string | null> {
  console.log("\n[Reporter] Posting to Twitter:");
  console.log("\u2500".repeat(50));
  console.log(text);
  console.log("\u2500".repeat(50));
  return postToTwitter(text);
}

async function postToTwitter(text: string): Promise<string | null> {
  const client = getTwitterClient();
  if (!client) {
    console.log("[Reporter] Twitter not configured, skipping.");
    return null;
  }

  try {
    // Twitter has 280 char limit - truncate if needed
    const tweetText = text.length > 280
      ? text.slice(0, 277) + "..."
      : text;

    const result = await client.v2.tweet(tweetText);
    console.log(`[Reporter] Posted to Twitter: ${result.data.id}`);
    return result.data.id;
  } catch (err: any) {
    console.error("[Reporter] Twitter error:", err?.data || err?.message || err);
    return null;
  }
}

async function postToFarcaster(text: string): Promise<string | null> {
  if (!config.neynarApiKey) return null;

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
