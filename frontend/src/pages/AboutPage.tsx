import { truncateAddress } from "../lib/formatters";
import { BASESCAN_URL, TREASURY_ADDRESS, PATRON_ADDRESS } from "../lib/contract";

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

const PIPELINE_STEPS = [
  { num: "01", name: "Scan", desc: "Discover builders shipping on Base" },
  { num: "02", name: "Verify", desc: "Check deployed contracts and activity" },
  { num: "03", name: "Evaluate", desc: "Score projects across four dimensions" },
  { num: "04", name: "Decide", desc: "Apply funding threshold to scores" },
  { num: "05", name: "Fund", desc: "Disburse ETH directly on-chain" },
  { num: "06", name: "Report", desc: "Log every decision with a reason hash" },
];

const TECH_STACK = [
  "Solidity",
  "Base",
  "Viem",
  "React",
  "TypeScript",
  "Tailwind",
];

export default function AboutPage() {
  return (
    <div className="fade-in space-y-14 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="space-y-5 stagger-1 pt-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          About <span className="gradient-text">The Patron</span>
        </h1>
        <div className="max-w-2xl">
          <p className="text-text-primary text-sm leading-relaxed font-medium">
            An autonomous AI agent that manages its own on-chain treasury on Base.
          </p>
          <p className="mt-3 text-text-secondary text-sm leading-relaxed">
            It scans for builders, evaluates their work against a scoring rubric,
            and disburses ETH grants directly to qualifying projects. No committee,
            no application form, no human in the loop.
          </p>
          <p className="mt-3 text-text-secondary text-sm leading-relaxed">
            Every grant decision, every ETH transfer, every funding round is
            recorded transparently through the PatronTreasury smart contract.
            The agent operates on a simple principle: find good builders and fund
            them fast.
          </p>
        </div>
        <p className="font-mono text-xs text-accent-green/70 tracking-wide">
          Zero humans. Every decision on-chain.
        </p>
      </section>

      <div className="section-divider" />

      {/* How It Works */}
      <section className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-accent-green/60" />
          <h2 className="font-heading text-lg font-semibold">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {PIPELINE_STEPS.map((step) => (
            <div key={step.num} className="card p-5 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-accent-green/50">
                  {step.num}
                </span>
                <span className="font-semibold text-sm text-text-primary">
                  {step.name}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Evaluation Criteria */}
      <section className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-accent-blue/60" />
          <h2 className="font-heading text-lg font-semibold">
            Evaluation Criteria
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[
            { name: "Novelty", weight: 30, borderClass: "border-l-accent-green/50", textClass: "text-accent-green", barClass: "bg-accent-green/60", desc: "Is this something new? Original ideas and unexplored approaches score highest." },
            { name: "Activity", weight: 25, borderClass: "border-l-accent-blue/50", textClass: "text-accent-blue", barClass: "bg-accent-blue/60", desc: "Recent commits, deployments, and on-chain interactions signal active building." },
            { name: "Quality", weight: 25, borderClass: "border-l-accent-amber/50", textClass: "text-accent-amber", barClass: "bg-accent-amber/60", desc: "Code quality, contract verification, and thoughtful architecture." },
            { name: "Impact", weight: 20, borderClass: "border-l-accent-red/50", textClass: "text-accent-red", barClass: "bg-accent-red/60", desc: "Potential to benefit the Base ecosystem and its users at scale." },
          ].map((dim) => (
            <div key={dim.name} className={`card p-5 border-l-2 ${dim.borderClass}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm text-text-primary">
                  {dim.name}
                </span>
                <span className={`font-heading text-base font-bold ${dim.textClass}`}>
                  {dim.weight}%
                </span>
              </div>
              {/* Proportional bar: weight% of container width */}
              <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${dim.barClass}`}
                  style={{ width: `${dim.weight}%`, transition: "width 1s ease-out" }}
                />
              </div>
              <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                {dim.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-tertiary pl-1">
          Minimum score: 60/100 to receive funding.
        </p>
      </section>

      <div className="section-divider" />

      {/* Contract Details -- info panel style */}
      <section data-reveal>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full bg-accent-amber/60" />
          <h2 className="font-heading text-lg font-semibold">
            Contract Details
          </h2>
        </div>
        <div className="info-panel">
          <div className="info-panel-row">
            <span className="text-text-tertiary">Network</span>
            <span className="font-medium text-text-primary">Base</span>
          </div>
          <div className="info-panel-row">
            <span className="text-text-tertiary">Treasury</span>
            <a
              href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group font-mono text-xs text-text-primary hover:text-accent-green transition-colors"
            >
              {truncateAddress(TREASURY_ADDRESS)}
              <ExternalLinkIcon />
            </a>
          </div>
          <div className="info-panel-row">
            <span className="text-text-tertiary">Patron Agent</span>
            <a
              href={`${BASESCAN_URL}/address/${PATRON_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group font-mono text-xs text-text-primary hover:text-accent-green transition-colors"
            >
              {truncateAddress(PATRON_ADDRESS)}
              <ExternalLinkIcon />
            </a>
          </div>
          <div className="info-panel-row">
            <span className="text-text-tertiary">Chain ID</span>
            <span className="font-mono text-xs font-medium text-text-primary">8453</span>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Design Principles */}
      <section className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-text-tertiary" />
          <h2 className="font-heading text-lg font-semibold">
            Design Principles
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
          <div className="card p-5 space-y-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green/50" />
            <p className="font-semibold text-sm text-text-primary">
              Autonomous
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              All grant decisions made independently by the agent
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue/50" />
            <p className="font-semibold text-sm text-text-primary">
              Transparent
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every action verifiable on-chain, no hidden logic
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-amber/50" />
            <p className="font-semibold text-sm text-text-primary">Minimal</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Simple contract, clear rules, no admin backdoors
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red/50" />
            <p className="font-semibold text-sm text-text-primary">
              Immutable
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Patron address set at deploy, cannot be changed
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-3" data-reveal>
        <h3 className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary font-medium">
          Built with
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-text-tertiary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Links */}
      <section className="space-y-3" data-reveal>
        <h3 className="text-[10px] uppercase tracking-[0.12em] text-text-tertiary font-medium">
          Links
        </h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <a
            href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-accent-green/30 hover:text-accent-green transition-all"
          >
            <span>Treasury Contract</span>
            <ExternalLinkIcon />
          </a>
          <a
            href="https://github.com/Yonkoo11/the-patron"
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
          >
            <span>GitHub</span>
            <ExternalLinkIcon />
          </a>
          <a
            href={`${BASESCAN_URL}/address/${PATRON_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
          >
            <span>Agent Wallet</span>
            <ExternalLinkIcon />
          </a>
        </div>
      </section>
    </div>
  );
}
