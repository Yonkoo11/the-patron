import "dotenv/config";

export const config = {
  privateKey: process.env.PRIVATE_KEY || "",
  network: (process.env.NETWORK || "base-sepolia") as "base" | "base-sepolia",
  treasuryAddress: process.env.TREASURY_ADDRESS || "",
  basescanApiKey: process.env.BASESCAN_API_KEY || "",
  neynarApiKey: process.env.NEYNAR_API_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",

  get rpcUrl() {
    return this.network === "base"
      ? (process.env.BASE_RPC_URL || "https://mainnet.base.org")
      : (process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org");
  },

  get basescanUrl() {
    return this.network === "base"
      ? "https://api.basescan.org/api"
      : "https://api-sepolia.basescan.org/api";
  },

  get basescanExplorer() {
    return this.network === "base"
      ? "https://basescan.org"
      : "https://sepolia.basescan.org";
  },

  // Grant parameters
  grant: {
    minScore: 60,
    maxPerRound: 3,
    minAmount: 0.001,  // ETH
    maxAmount: 0.005,  // ETH
    minTxCount: 5,
    minBytecodeSize: 500,
  },

  // Scoring weights
  weights: {
    novelty: 0.30,
    activity: 0.25,
    quality: 0.25,
    impact: 0.20,
  },
};

export const TREASURY_ABI = [
  "function patron() view returns (address)",
  "function grantCount() view returns (uint256)",
  "function currentRound() view returns (uint256)",
  "function totalDisbursed() view returns (uint256)",
  "function totalGrantedTo(address) view returns (uint256)",
  "function treasuryBalance() view returns (uint256)",
  "function startRound(string theme)",
  "function disburse(address recipient, bytes32 reasonHash) payable",
  "function getGrant(uint256 id) view returns (tuple(address recipient, uint256 amount, bytes32 reasonHash, uint256 timestamp, uint256 roundId))",
  "event GrantDisbursed(uint256 indexed grantId, uint256 indexed roundId, address indexed recipient, uint256 amount, bytes32 reasonHash)",
  "event RoundStarted(uint256 indexed roundId, string theme)",
  "event TreasuryFunded(address indexed funder, uint256 amount)",
] as const;
