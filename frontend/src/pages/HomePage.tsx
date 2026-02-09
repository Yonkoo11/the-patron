import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTreasury } from "../hooks/useTreasury";
import { useGrants } from "../hooks/useGrants";
import { formatEth, truncateAddress, timeAgo } from "../lib/formatters";
import {
  BASESCAN_URL,
  TREASURY_ADDRESS,
  PATRON_ADDRESS,
} from "../lib/contract";

/* ─── Animated Counter Hook ─── */

function useCountUp(target: number, duration = 1200, decimals = 4): string {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value.toFixed(decimals);
}

/* ─── Pipeline Data ─── */

const PIPELINE_STEPS = [
  { num: "01", label: "Scan", desc: "Find builders" },
  { num: "02", label: "Verify", desc: "Check on-chain" },
  { num: "03", label: "Evaluate", desc: "Score impact" },
  { num: "04", label: "Decide", desc: "Accept / reject" },
  { num: "05", label: "Fund", desc: "Disburse ETH" },
  { num: "06", label: "Report", desc: "Publish proof" },
];

/* ─── Particle Config ─── */

const PARTICLES = [
  { size: 3, top: "12%", left: "8%", delay: "0s", duration: "7s" },
  { size: 2, top: "22%", left: "85%", delay: "1.2s", duration: "5.5s" },
  { size: 4, top: "60%", left: "92%", delay: "0.6s", duration: "8s" },
  { size: 2, top: "75%", left: "5%", delay: "2s", duration: "6s" },
  { size: 3, top: "40%", left: "15%", delay: "1.5s", duration: "7.5s" },
  { size: 2, top: "30%", left: "78%", delay: "0.3s", duration: "6.5s" },
  { size: 3, top: "85%", left: "50%", delay: "2.5s", duration: "5s" },
  { size: 2, top: "10%", left: "55%", delay: "1.8s", duration: "9s" },
];

/* ─── Icon Components ─── */

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

/* ─── Stat Card Icons (16x16 inline SVGs) ─── */

function VaultIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }} className="text-accent-green">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }} className="text-accent-blue">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }} className="text-accent-amber">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }} className="text-text-primary">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

/* ─── Main Component ─── */

export default function HomePage() {
  const { balance, grantCount, totalDisbursed, currentRound, isLoading } =
    useTreasury();
  const { grants } = useGrants();

  const recentGrants = grants.slice(-5).reverse();

  // Animated values
  const animatedBalance = useCountUp(parseFloat(balance), 1200, 4);
  const animatedDisbursed = useCountUp(parseFloat(totalDisbursed), 1200, 4);
  const animatedGrantCount = useCountUp(grantCount, 800, 0);
  const animatedRound = useCountUp(currentRound, 800, 0);

  return (
    <div className="fade-in space-y-20">
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

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              "--delay": p.delay,
              "--duration": p.duration,
            } as React.CSSProperties}
          />
        ))}

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

        {/* Treasury balance with pulsing ring */}
        <div className="stagger-4 relative mt-10">
          {/* Pulsing ring */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] rounded-full border border-accent-green/10"
            style={{ animation: "ring-pulse 3s ease-in-out infinite" }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] rounded-full border border-accent-green/5"
            style={{ animation: "ring-pulse 3s ease-in-out infinite 0.5s" }}
          />

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
                {animatedBalance}
                <span className="ml-3 text-2xl font-normal text-text-secondary sm:text-3xl">
                  ETH
                </span>
              </>
            )}
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Stats Row ─── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Treasury */}
        <div className="card stagger-1 border-l-2 border-l-accent-green p-5">
          <div className="flex items-center justify-between">
            <p className="stat-label">Treasury</p>
            <VaultIcon />
          </div>
          <p className="stat-value count-reveal mt-2 text-text-primary">
            {isLoading ? "..." : animatedBalance}
            <span className="ml-1.5 text-base font-normal text-text-secondary">
              ETH
            </span>
          </p>
        </div>

        {/* Grants */}
        <div className="card stagger-2 border-l-2 border-l-accent-blue p-5">
          <div className="flex items-center justify-between">
            <p className="stat-label">Grants Issued</p>
            <GiftIcon />
          </div>
          <p className="stat-value count-reveal mt-2 text-text-primary">
            {isLoading ? "..." : animatedGrantCount}
          </p>
        </div>

        {/* Disbursed */}
        <div className="card stagger-3 border-l-2 border-l-accent-amber p-5">
          <div className="flex items-center justify-between">
            <p className="stat-label">Total Disbursed</p>
            <ArrowUpRightIcon />
          </div>
          <p className="stat-value count-reveal mt-2 text-text-primary">
            {isLoading ? "..." : animatedDisbursed}
            <span className="ml-1.5 text-base font-normal text-text-secondary">
              ETH
            </span>
          </p>
        </div>

        {/* Round */}
        <div className="card stagger-4 border-l-2 border-l-text-primary p-5">
          <div className="flex items-center justify-between">
            <p className="stat-label">Current Round</p>
            <LayersIcon />
          </div>
          <p className="stat-value count-reveal mt-2 text-text-primary">
            {isLoading ? "..." : animatedRound}
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Pipeline Visualization ─── */}
      <section className="stagger-5">
        <h2 className="font-heading mb-6 text-center text-sm font-medium uppercase tracking-widest text-text-tertiary">
          Grant Pipeline
        </h2>

        {/* Desktop: single row with progress line */}
        <div className="relative hidden md:block">
          {/* Background track line */}
          <div className="absolute left-[8%] right-[8%] top-[22px] h-[2px] bg-border" />
          {/* Animated fill line */}
          <div
            className="pipeline-line-fill absolute left-[8%] top-[22px] h-[2px] bg-accent-green/40"
            style={{ "--fill-pct": "66%" } as React.CSSProperties}
          />

          <div className="relative flex items-center justify-center gap-2">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <div
                  className="step-reveal flex flex-col items-center gap-2"
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                >
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
        </div>

        {/* Mobile: 3x2 grid */}
        <div className="grid grid-cols-3 gap-4 md:hidden">
          {PIPELINE_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="step-reveal flex flex-col items-center gap-2"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
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

      <div className="section-divider" />

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
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgba(0,255,136,0) 0%, rgba(0,255,136,0) 100%)",
                  transition:
                    "border-color 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out, background-image 300ms ease-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundImage =
                    "linear-gradient(90deg, rgba(0,255,136,0.02) 0%, transparent 100%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundImage =
                    "linear-gradient(90deg, rgba(0,255,136,0) 0%, rgba(0,255,136,0) 100%)";
                }}
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

      <div className="section-divider" />

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
