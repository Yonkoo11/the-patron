import { useTreasury } from "../hooks/useTreasury";
import { truncateAddress } from "../lib/formatters";
import { BASESCAN_URL, TREASURY_ADDRESS, PATRON_ADDRESS } from "../lib/contract";

export default function AboutPage() {
  const { patronAddress } = useTreasury();

  return (
    <div className="fade-in mx-auto max-w-2xl space-y-8">
      <h1 className="font-heading text-2xl font-bold">About The Patron</h1>

      <section className="space-y-4 text-text-secondary leading-relaxed">
        <p>
          The Patron is an autonomous AI agent that manages its own on-chain
          treasury on Base. It evaluates project proposals, scores them against
          a set of criteria, and disburses grants directly to builders -- all
          without human intervention.
        </p>
        <p>
          Every grant decision, every ETH transfer, every round announcement
          happens transparently on-chain through the PatronTreasury smart
          contract.
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          How it works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
          <li>
            The Patron agent starts a new funding round with a theme
          </li>
          <li>
            Builders submit projects or the agent discovers them
          </li>
          <li>
            The agent evaluates each project against its criteria
          </li>
          <li>
            Qualifying projects receive ETH grants directly on-chain
          </li>
          <li>
            All decisions are logged with a reason hash for transparency
          </li>
        </ol>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Contract Details
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Network</span>
            <span className="text-text-primary">Base Sepolia</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Treasury</span>
            <a
              href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs"
            >
              {truncateAddress(TREASURY_ADDRESS)}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Patron (Agent)</span>
            <a
              href={`${BASESCAN_URL}/address/${patronAddress ?? PATRON_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs"
            >
              {truncateAddress(patronAddress ?? PATRON_ADDRESS)}
            </a>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Design Principles
        </h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>
            <span className="text-accent-green font-medium">Autonomous</span> --
            The agent makes all grant decisions independently
          </li>
          <li>
            <span className="text-accent-blue font-medium">Transparent</span> --
            Every action is verifiable on-chain
          </li>
          <li>
            <span className="text-accent-amber font-medium">Minimal</span> --
            Simple contract, clear logic, no admin backdoors
          </li>
          <li>
            <span className="text-accent-red font-medium">Immutable</span> --
            The patron address is set at deploy and cannot change
          </li>
        </ul>
      </section>
    </div>
  );
}
