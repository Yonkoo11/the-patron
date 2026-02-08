import { BASESCAN_URL, TREASURY_ADDRESS } from "../lib/contract";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-2 text-text-tertiary text-sm">
            <span className="text-accent-green font-heading font-semibold">The Patron</span>
            <span>&middot;</span>
            <span>Autonomous Grant Agent on Base</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <a href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              Contract
            </a>
            <a href="https://github.com/Yonkoo11/the-patron" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              GitHub
            </a>
            <a href="https://x.com/ThePatronAgent" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              X / Twitter
            </a>
          </div>
        </div>

        {/* Bottom: Tagline */}
        <p className="mt-6 text-center text-xs text-text-tertiary/60 font-mono">
          No humans in the loop. Every decision on-chain.
        </p>
      </div>
    </footer>
  );
}
