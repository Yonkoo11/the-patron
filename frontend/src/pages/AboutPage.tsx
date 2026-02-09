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
    <div className="fade-in space-y-16 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="space-y-5 stagger-1 pt-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          About <span className="gradient-text">The Patron</span>
        </h1>
        <div className="space-y-4 text-text-secondary text-sm leading-relaxed max-w-2xl">
          <p>
            The Patron is an autonomous AI agent that manages its own on-chain
            treasury on Base. It scans for builders, evaluates their work against
            a scoring rubric, and disburses ETH grants directly to qualifying
            projects. No committee, no application form, no human in the loop.
          </p>
          <p>
            Every grant decision, every ETH transfer, every funding round is
            recorded transparently through the PatronTreasury smart contract.
            The agent operates on a simple principle: find good builders and fund
            them fast.
          </p>
        </div>
        <p className="font-mono text-sm text-accent-green tracking-wide">
          Zero humans. Every decision on-chain.
        </p>
      </section>

      <div className="section-divider" />

      {/* How It Works */}
      <section className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-accent-green" />
          <h2 className="font-heading text-xl font-semibold">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {PIPELINE_STEPS.map((step) => (
            <div key={step.num} className="card p-5 space-y-2">
              <span className="font-heading text-2xl font-bold text-accent-green">
                {step.num}
              </span>
              <p className="font-semibold text-sm text-text-primary">
                {step.name}
              </p>
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
          <div className="w-1 h-7 rounded-full bg-accent-blue" />
          <h2 className="font-heading text-xl font-semibold">
            Evaluation Criteria
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { name: "Novelty", weight: 30, borderClass: "border-l-accent-green", textClass: "text-accent-green", barClass: "bg-accent-green", desc: "Is this something new? Original ideas and unexplored approaches score highest." },
            { name: "Activity", weight: 25, borderClass: "border-l-accent-blue", textClass: "text-accent-blue", barClass: "bg-accent-blue", desc: "Recent commits, deployments, and on-chain interactions signal active building." },
            { name: "Quality", weight: 25, borderClass: "border-l-accent-amber", textClass: "text-accent-amber", barClass: "bg-accent-amber", desc: "Code quality, contract verification, and thoughtful architecture." },
            { name: "Impact", weight: 20, borderClass: "border-l-accent-red", textClass: "text-accent-red", barClass: "bg-accent-red", desc: "Potential to benefit the Base ecosystem and its users at scale." },
          ].map((dim) => (
            <div key={dim.name} className={`card p-5 border-l-2 ${dim.borderClass}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm text-text-primary">
                  {dim.name}
                </span>
                <span className={`font-heading text-lg font-bold ${dim.textClass}`}>
                  {dim.weight}%
                </span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${dim.barClass}`}
                  style={{ width: `${(dim.weight / 30) * 100}%`, transition: "width 1s ease-out" }}
                />
              </div>
              <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                {dim.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-tertiary pl-1">
          Minimum score: 60/100 to receive funding.
        </p>
      </section>

      <div className="section-divider" />

      {/* Contract Details */}
      <section data-reveal>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-7 rounded-full bg-accent-amber" />
          <h2 className="font-heading text-xl font-semibold">
            Contract Details
          </h2>
        </div>
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Network</span>
            <span className="text-text-primary">Base Sepolia</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Treasury</span>
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Patron Agent</span>
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
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Chain ID</span>
            <span className="font-mono text-xs text-text-primary">84532</span>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Design Principles */}
      <section className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-accent-red" />
          <h2 className="font-heading text-xl font-semibold">
            Design Principles
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="card p-5 space-y-2">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <p className="font-semibold text-sm text-text-primary">
              Autonomous
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              All grant decisions made independently by the agent
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-2 h-2 rounded-full bg-accent-blue" />
            <p className="font-semibold text-sm text-text-primary">
              Transparent
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every action verifiable on-chain, no hidden logic
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-2 h-2 rounded-full bg-accent-amber" />
            <p className="font-semibold text-sm text-text-primary">Minimal</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Simple contract, clear rules, no admin backdoors
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="w-2 h-2 rounded-full bg-accent-red" />
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
      <section className="space-y-4" data-reveal>
        <h3 className="text-xs uppercase tracking-wider text-text-tertiary">
          Built with
        </h3>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border px-3 py-1 font-mono text-xs text-text-tertiary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* Links */}
      <section className="space-y-4" data-reveal>
        <h3 className="text-xs uppercase tracking-wider text-text-tertiary">
          Links
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-accent-green hover:text-accent-green transition-all"
          >
            <span>Treasury Contract</span>
            <ExternalLinkIcon />
          </a>
          <a
            href="https://github.com/Yonkoo11/the-patron"
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-accent-green hover:text-accent-green transition-all"
          >
            <span>GitHub</span>
            <ExternalLinkIcon />
          </a>
          <a
            href={`${BASESCAN_URL}/address/${PATRON_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group card flex items-center justify-between p-4 text-sm text-text-secondary hover:border-accent-green hover:text-accent-green transition-all"
          >
            <span>Agent Wallet</span>
            <ExternalLinkIcon />
          </a>
        </div>
      </section>
    </div>
  );
}
