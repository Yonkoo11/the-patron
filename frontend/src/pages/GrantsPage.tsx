import { useState } from "react";
import { useGrants } from "../hooks/useGrants";
import { useTreasury } from "../hooks/useTreasury";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import { BASESCAN_URL } from "../lib/contract";
import { formatEther } from "viem";

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block ml-1 opacity-40 group-hover:opacity-100 transition-opacity"
    >
      <path
        d="M3.5 1.5H10.5V8.5M10.5 1.5L1.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path d="M2.5 4V2C2.5 1.72 2.72 1.5 3 1.5H9C9.28 1.5 9.5 1.72 9.5 2V7C9.5 7.28 9.28 7.5 9 7.5H7M2 4.5H7C7.28 4.5 7.5 4.72 7.5 5V9.5C7.5 9.78 7.28 10 7 10H2C1.72 10 1.5 9.78 1.5 9.5V5C1.5 4.72 1.72 4.5 2 4.5Z" stroke="currentColor" strokeWidth="0.8"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-accent-green">
      <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 border-l-2 border-l-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded shimmer" />
            <div className="h-3 w-48 rounded shimmer" />
          </div>
        </div>
        <div className="h-6 w-24 rounded shimmer" />
      </div>
    </div>
  );
}

/* ─── Amount-based styling helpers ─── */

function getAmountWeight(wei: bigint, allGrants: { amount: bigint }[]): number {
  if (allGrants.length === 0) return 0.5;
  const amounts = allGrants.map(g => parseFloat(formatEther(g.amount)));
  const max = Math.max(...amounts);
  const min = Math.min(...amounts);
  const current = parseFloat(formatEther(wei));
  if (max === min) return 0.5;
  return (current - min) / (max - min);
}

function getAccentOpacity(weight: number): number {
  // Range from 0.15 (smallest) to 0.5 (largest)
  return 0.15 + weight * 0.35;
}

function getAmountFontSize(weight: number): string {
  // Range from text-base (smallest) to text-2xl (largest)
  if (weight > 0.7) return "text-2xl";
  if (weight > 0.4) return "text-xl";
  return "text-lg";
}

export default function GrantsPage() {
  const { grants, isLoading } = useGrants();
  const treasury = useTreasury();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const sortedGrants = [...grants].reverse();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Grant <span className="gradient-text">Explorer</span>
          </h1>
          <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-xl">
            Every grant disbursed by The Patron, recorded on-chain.
            Fully transparent, fully autonomous.
          </p>
        </div>

        {/* Summary pills -- stronger visual presence */}
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5 rounded-lg border border-accent-green/15 bg-accent-green/5 px-4 py-2">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Grants
            </span>
            <span className="font-heading text-sm font-bold text-text-primary tabular-nums">
              {treasury.isLoading ? "--" : treasury.grantCount}
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-accent-green/15 bg-accent-green/5 px-4 py-2">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Disbursed
            </span>
            <span className="font-heading text-sm font-bold text-accent-green tabular-nums">
              {treasury.isLoading
                ? "--"
                : `${parseFloat(treasury.totalDisbursed).toFixed(4)} ETH`}
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Rounds
            </span>
            <span className="font-heading text-sm font-bold text-text-primary tabular-nums">
              {treasury.isLoading ? "--" : treasury.currentRound}
            </span>
          </div>
        </div>
      </div>

      {/* Grant list */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : sortedGrants.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 text-text-tertiary"
          >
            <rect
              x="8"
              y="6"
              width="32"
              height="36"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 18H32M16 24H28M16 30H24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-sm font-heading font-semibold text-text-secondary">
            No grants yet
          </p>
          <p className="mt-1 text-xs text-text-tertiary max-w-sm">
            The Patron hasn't disbursed any grants from this treasury.
            Check back after the next funding round.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedGrants.map((grant, i) => {
            const weight = getAmountWeight(grant.amount, sortedGrants);
            const accentOpacity = getAccentOpacity(weight);
            const amountSize = getAmountFontSize(weight);
            const isCopied = copiedHash === grant.reasonHash;

            return (
              <div
                key={grant.id}
                className={`card p-5 transition-all duration-150 stagger-${Math.min(i + 1, 6)}`}
                style={{
                  borderLeftWidth: "2px",
                  borderLeftColor: `rgba(0, 255, 136, ${accentOpacity})`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Grant number badge -- neutral */}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-xs font-mono font-medium text-text-tertiary">
                      #{grant.id}
                    </span>

                    <div className="min-w-0">
                      {/* Recipient + round */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <a
                          href={`${BASESCAN_URL}/address/${grant.recipient}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group font-mono text-sm font-medium text-text-primary hover:text-accent-green transition-colors"
                        >
                          {truncateAddress(grant.recipient)}
                          <ExternalLinkIcon />
                        </a>
                        <span className="inline-flex items-center rounded-md bg-accent-blue/8 px-2 py-0.5 text-[10px] font-medium text-accent-blue/70">
                          R{grant.roundId.toString()}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <p className="mt-1 text-[11px] text-text-tertiary">
                        {timeAgo(Number(grant.timestamp))}
                      </p>
                    </div>
                  </div>

                  {/* Right side -- amount with weight-based sizing */}
                  <span className={`font-heading ${amountSize} font-bold text-text-primary whitespace-nowrap tabular-nums`}>
                    {formatEth(grant.amount)}
                    <span className="ml-1 text-xs font-normal text-text-tertiary">
                      ETH
                    </span>
                  </span>
                </div>

                {/* Footer row: copy hash icon + tx link */}
                <div className="mt-3 flex items-center justify-between gap-4 text-xs">
                  <button
                    onClick={() => handleCopyHash(grant.reasonHash)}
                    className="flex items-center gap-1.5 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer group/hash"
                    title={`Copy: ${grant.reasonHash}`}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    <span className="shrink-0">
                      {isCopied ? "Copied" : "Verification hash"}
                    </span>
                  </button>
                  <a
                    href={`${BASESCAN_URL}/address/${grant.recipient}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex shrink-0 items-center gap-1 text-text-tertiary hover:text-accent-green transition-colors"
                  >
                    <span>Basescan</span>
                    <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
