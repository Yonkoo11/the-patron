export interface BuilderCandidate {
  address: string;
  source: "basescan" | "farcaster" | "x";
  socialHandle?: string;
  socialPost?: string;
  discoveredAt: number;
}

export interface OnchainProfile {
  address: string;
  txCount: number;
  contractsDeployed: ContractInfo[];
  totalUniqueInteractors: number;
  recentActivity: boolean; // activity in last 7 days
  hasENS: boolean;
}

export interface ContractInfo {
  address: string;
  bytecodeSize: number;
  isVerified: boolean;
  createdAt: number;
  txHash: string;
}

export interface EvaluationScore {
  novelty: number;     // 0-100
  activity: number;    // 0-100
  quality: number;     // 0-100
  impact: number;      // 0-100
  total: number;       // weighted 0-100
  summary: string;     // human-readable evaluation
}

export interface GrantRecord {
  grantId: number;
  roundId: number;
  recipient: string;
  amount: string;       // ETH as string
  reasonHash: string;
  txHash: string;
  timestamp: number;
  evaluation: EvaluationScore;
}

export interface RoundInfo {
  roundId: number;
  theme: string;
  grants: GrantRecord[];
  startedAt: number;
}

export interface AgentState {
  grantedAddresses: Set<string>;
  currentRound: number;
  roundGrants: number;
  lastScanTime: number;
}
