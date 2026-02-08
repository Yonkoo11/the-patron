import { useGrants } from "../hooks/useGrants";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import { BASESCAN_URL } from "../lib/contract";

export default function GrantsPage() {
  const { grants, count, isLoading } = useGrants();

  const sortedGrants = [...grants].reverse();

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">All Grants</h1>
        <span className="text-sm text-text-secondary">
          {count} grant{count !== 1 ? "s" : ""} issued
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-green" />
        </div>
      ) : sortedGrants.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-text-secondary">No grants yet</p>
          <p className="mt-1 text-sm text-text-tertiary">
            The Patron hasn't disbursed any grants from this treasury.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGrants.map((grant) => (
            <div key={grant.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/10 text-sm font-semibold text-accent-green">
                    #{grant.id}
                  </span>
                  <div>
                    <a
                      href={`${BASESCAN_URL}/address/${grant.recipient}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm font-medium"
                    >
                      {truncateAddress(grant.recipient)}
                    </a>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                      <span>Round {grant.roundId.toString()}</span>
                      <span>{timeAgo(Number(grant.timestamp))}</span>
                    </div>
                  </div>
                </div>
                <span className="font-heading text-xl font-semibold text-accent-green">
                  {formatEth(grant.amount)} ETH
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary">
                <span>Reason hash:</span>
                <code className="font-mono text-text-secondary">
                  {grant.reasonHash.slice(0, 18)}...
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
