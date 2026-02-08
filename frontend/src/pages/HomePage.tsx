import { useTreasury } from "../hooks/useTreasury";
import { useGrants } from "../hooks/useGrants";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import { BASESCAN_URL, TREASURY_ADDRESS } from "../lib/contract";

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className={`card p-5 ${accent ? "glow-green border-accent-green/20" : ""}`}>
      <p className="stat-label">{label}</p>
      <p className={`stat-value mt-2 ${accent ? "text-accent-green" : "text-text-primary"}`}>
        {value}
        {unit && (
          <span className="ml-1.5 text-base font-normal text-text-secondary">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { balance, grantCount, totalDisbursed, currentRound, isLoading } =
    useTreasury();
  const { grants } = useGrants();

  const recentGrants = grants.slice(-5).reverse();

  return (
    <div className="fade-in space-y-8">
      {/* Hero */}
      <section className="py-8 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Autonomous Grant Agent
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-text-secondary">
          An AI agent with its own treasury on Base. It evaluates projects,
          makes decisions, and disburses grants on-chain.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Treasury"
          value={isLoading ? "..." : parseFloat(balance).toFixed(4)}
          unit="ETH"
          accent
        />
        <StatCard
          label="Grants Issued"
          value={isLoading ? "..." : String(grantCount)}
        />
        <StatCard
          label="Total Disbursed"
          value={isLoading ? "..." : parseFloat(totalDisbursed).toFixed(4)}
          unit="ETH"
        />
        <StatCard
          label="Current Round"
          value={isLoading ? "..." : String(currentRound)}
        />
      </section>

      {/* Contract Link */}
      <section className="flex justify-center">
        <a
          href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="address inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
        >
          <span>Treasury:</span>
          <span className="font-mono">{truncateAddress(TREASURY_ADDRESS)}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V3.707L6.354 9.854a.5.5 0 1 1-.708-.708L11.793 3H7a.5.5 0 0 1-.5-.5z" />
            <path d="M2 4a2 2 0 0 1 2-2h3.5a.5.5 0 0 1 0 1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5a.5.5 0 0 1 1 0V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
          </svg>
        </a>
      </section>

      {/* Recent Grants */}
      {recentGrants.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-xl font-semibold">
            Recent Grants
          </h2>
          <div className="space-y-3">
            {recentGrants.map((grant) => (
              <div key={grant.id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/10 text-sm font-medium text-accent-green">
                    #{grant.id}
                  </span>
                  <div>
                    <a
                      href={`${BASESCAN_URL}/address/${grant.recipient}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm"
                    >
                      {truncateAddress(grant.recipient)}
                    </a>
                    <p className="text-xs text-text-tertiary">
                      Round {grant.roundId.toString()} &middot;{" "}
                      {timeAgo(Number(grant.timestamp))}
                    </p>
                  </div>
                </div>
                <span className="font-heading text-lg font-semibold text-accent-green">
                  {formatEth(grant.amount)} ETH
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
