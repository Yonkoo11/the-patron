import { Link } from "react-router-dom";
import { useTreasury } from "../hooks/useTreasury";
import { useGrants } from "../hooks/useGrants";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import {
  BASESCAN_URL,
  TREASURY_ADDRESS,
  PATRON_ADDRESS,
} from "../lib/contract";

const PIPELINE_STEPS = [
  { num: "01", label: "Scan", desc: "Find builders" },
  { num: "02", label: "Verify", desc: "Check on-chain" },
  { num: "03", label: "Evaluate", desc: "Score impact" },
  { num: "04", label: "Decide", desc: "Accept / reject" },
  { num: "05", label: "Fund", desc: "Disburse ETH" },
  { num: "06", label: "Report", desc: "Publish proof" },
];

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-text-tertiary"
    >
      <path
        d="M7 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M6.5 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V3.707L6.354 9.854a.5.5 0 1 1-.708-.708L11.793 3H7a.5.5 0 0 1-.5-.5z" />
      <path d="M2 4a2 2 0 0 1 2-2h3.5a.5.5 0 0 1 0 1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5a.5.5 0 0 1 1 0V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
    </svg>
  );
}

export default function HomePage() {
  const { balance, grantCount, totalDisbursed, currentRound, isLoading } =
    useTreasury();
  const { grants } = useGrants();

  const recentGrants = grants.slice(-5).reverse();

  return (
    <div className="fade-in space-y-16">
      {/* ─── Hero Section ─── */}
      <section className="relative py-16 text-center">
        {/* Radial glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, rgba(0,255,136,0.02) 40%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div className="stagger-1 mb-8 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-green/20 bg-accent-green/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-accent-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
            </span>
            Live on Base Sepolia
          </span>
        </div>

        {/* Title */}
        <h1 className="stagger-2 font-heading text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="gradient-text">THE PATRON</span>
        </h1>

        <p className="stagger-3 mx-auto mt-4 max-w-md text-lg text-text-secondary">
          Autonomous AI Grant Agent on Base
        </p>

        {/* Treasury balance */}
        <div className="stagger-4 mt-10">
          <p className="stat-label mb-2">Treasury Balance</p>
          <p
            className="font-mono text-6xl font-bold tabular-nums text-accent-green sm:text-7xl"
            style={{
              textShadow:
                "0 0 30px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)",
            }}
          >
            {isLoading ? (
              <span className="inline-block h-16 w-48 rounded shimmer" />
            ) : (
              <>
                {parseFloat(balance).toFixed(4)}
                <span className="ml-3 text-2xl font-normal text-text-secondary sm:text-3xl">
                  ETH
                </span>
              </>
            )}
          </p>
        </div>
      </section>

      {/* ─── Stats Row ─── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Treasury */}
        <div className="card stagger-1 border-l-2 border-l-accent-green p-5">
          <p className="stat-label">Treasury</p>
          <p className="stat-value mt-2 text-text-primary">
            {isLoading ? "..." : parseFloat(balance).toFixed(4)}
            <span className="ml-1.5 text-base font-normal text-text-secondary">
              ETH
            </span>
          </p>
        </div>

        {/* Grants */}
        <div className="card stagger-2 border-l-2 border-l-accent-blue p-5">
          <p className="stat-label">Grants Issued</p>
          <p className="stat-value mt-2 text-text-primary">
            {isLoading ? "..." : String(grantCount)}
          </p>
        </div>

        {/* Disbursed */}
        <div className="card stagger-3 border-l-2 border-l-accent-amber p-5">
          <p className="stat-label">Total Disbursed</p>
          <p className="stat-value mt-2 text-text-primary">
            {isLoading ? "..." : parseFloat(totalDisbursed).toFixed(4)}
            <span className="ml-1.5 text-base font-normal text-text-secondary">
              ETH
            </span>
          </p>
        </div>

        {/* Round */}
        <div className="card stagger-4 border-l-2 border-l-text-primary p-5">
          <p className="stat-label">Current Round</p>
          <p className="stat-value mt-2 text-text-primary">
            {isLoading ? "..." : String(currentRound)}
          </p>
        </div>
      </section>

      {/* ─── Pipeline Visualization ─── */}
      <section className="stagger-5">
        <h2 className="font-heading mb-6 text-center text-sm font-medium uppercase tracking-widest text-text-tertiary">
          Grant Pipeline
        </h2>

        {/* Desktop: single row */}
        <div className="hidden md:flex md:items-center md:justify-center md:gap-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-mono font-semibold transition-colors ${
                    i < 4
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-border text-text-tertiary"
                  }`}
                >
                  {step.num}
                </div>
                <span
                  className={`text-xs font-medium ${
                    i < 4 ? "text-text-primary" : "text-text-tertiary"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {step.desc}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="mb-8">
                  <ArrowIcon />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: 3x2 grid */}
        <div className="grid grid-cols-3 gap-4 md:hidden">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.num} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-mono font-semibold ${
                  i < 4
                    ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                    : "border-border text-text-tertiary"
                }`}
              >
                {step.num}
              </div>
              <span
                className={`text-xs font-medium ${
                  i < 4 ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Recent Grants ─── */}
      <section className="stagger-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">
            Recent Activity
          </h2>
          <Link
            to="/grants"
            className="flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            View All
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </Link>
        </div>

        {recentGrants.length === 0 && !isLoading && (
          <div className="card flex items-center justify-center p-12 text-text-tertiary">
            <p>No grants disbursed yet. The Patron is watching.</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="shimmer h-12 rounded" />
              </div>
            ))}
          </div>
        )}

        {recentGrants.length > 0 && (
          <div className="space-y-3">
            {recentGrants.map((grant) => (
              <div
                key={grant.id}
                className="card flex items-center justify-between p-4 transition-all hover:border-accent-green/20"
              >
                <div className="flex items-center gap-4">
                  {/* Green numbered badge */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-green/10 text-sm font-semibold text-accent-green">
                    {grant.id}
                  </span>

                  <div>
                    <a
                      href={`${BASESCAN_URL}/address/${grant.recipient}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-sm text-text-primary transition-colors hover:text-accent-green"
                    >
                      {truncateAddress(grant.recipient)}
                      <ExternalIcon size={10} />
                    </a>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      Round {grant.roundId.toString()} &middot;{" "}
                      {timeAgo(Number(grant.timestamp))}
                    </p>
                  </div>
                </div>

                <span className="font-heading text-lg font-semibold tabular-nums text-accent-green">
                  {formatEth(grant.amount)}
                  <span className="ml-1 text-sm font-normal text-text-secondary">
                    ETH
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── CTA / Verifiability Section ─── */}
      <section className="stagger-6">
        <div
          className="relative overflow-hidden rounded-lg p-px"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,255,136,0.3), rgba(59,130,246,0.2), rgba(0,255,136,0.1))",
          }}
        >
          <div className="rounded-[7px] bg-surface px-6 py-10 text-center sm:px-10">
            {/* Decorative icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent-green/20 bg-accent-green/5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent-green"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <h3 className="font-heading text-lg font-semibold text-text-primary">
              Every grant decision is verifiable on-chain
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              No committees. No gatekeepers. Just an autonomous agent, a
              treasury, and a public ledger.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Treasury Contract
                <ExternalIcon size={10} />
              </a>

              <a
                href={`${BASESCAN_URL}/address/${PATRON_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Patron Agent
                <ExternalIcon size={10} />
              </a>

              <a
                href="https://github.com/Yonkoo11/the-patron"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Source Code
                <ExternalIcon size={10} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
