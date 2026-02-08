import { useGrants } from "../hooks/useGrants";
import { useTreasury } from "../hooks/useTreasury";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import { BASESCAN_URL } from "../lib/contract";

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block ml-1 opacity-50 group-hover:opacity-100 transition-opacity"
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
      <div className="mt-4 flex items-center gap-2">
        <div className="h-3 w-56 rounded shimmer" />
      </div>
    </div>
  );
}

export default function GrantsPage() {
  const { grants, isLoading } = useGrants();
  const treasury = useTreasury();

  const sortedGrants = [...grants].reverse();


  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Grant Explorer
          </h1>
          <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-xl">
            Every grant disbursed by The Patron, recorded on-chain.
            Fully transparent, fully autonomous.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-text-tertiary">
              Grants
            </span>
            <span className="font-heading text-sm font-semibold text-text-primary tabular-nums">
              {treasury.isLoading ? "--" : treasury.grantCount}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-text-tertiary">
              Disbursed
            </span>
            <span className="font-heading text-sm font-semibold text-accent-green tabular-nums">
              {treasury.isLoading
                ? "--"
                : `${parseFloat(treasury.totalDisbursed).toFixed(4)} ETH`}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-text-tertiary">
              Rounds
            </span>
            <span className="font-heading text-sm font-semibold text-text-primary tabular-nums">
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
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4 text-text-tertiary"
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
          <p className="text-lg font-heading font-semibold text-text-secondary">
            No grants yet
          </p>
          <p className="mt-1 text-sm text-text-tertiary max-w-sm">
            The Patron hasn't disbursed any grants from this treasury.
            Check back after the next funding round.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGrants.map((grant, i) => (
            <div
              key={grant.id}
              className={`card border-l-2 border-l-accent-green p-5 hover:border-l-accent-green hover:border-border-hover transition-all duration-150 stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Grant number badge */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-green/10 text-sm font-semibold text-accent-green">
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
                      <span className="inline-flex items-center rounded-md bg-accent-blue/10 px-2 py-0.5 text-xs font-medium text-accent-blue">
                        R{grant.roundId.toString()}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <p className="mt-1 text-xs text-text-tertiary">
                      {timeAgo(Number(grant.timestamp))}
                    </p>
                  </div>
                </div>

                {/* Right side - amount */}
                <span className="font-heading text-xl font-semibold text-accent-green whitespace-nowrap">
                  {formatEth(grant.amount)} ETH
                </span>
              </div>

              {/* Footer row: reason hash + tx link */}
              <div className="mt-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-text-tertiary min-w-0">
                  <span className="shrink-0">Reason:</span>
                  <code className="font-mono text-text-secondary truncate">
                    {grant.reasonHash.slice(0, 18)}...
                  </code>
                </div>
                <a
                  href={`${BASESCAN_URL}/address/${grant.recipient}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex shrink-0 items-center gap-1 text-text-tertiary hover:text-accent-green transition-colors"
                >
                  <span>View on Basescan</span>
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
