import { NavLink } from "react-router-dom";
import { BASESCAN_URL, TREASURY_ADDRESS } from "../lib/contract";

export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="section-divider" />

      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Logo + name */}
          <div className="flex items-center gap-2.5">
            <img
              src="/the-patron/logo.png"
              alt="The Patron"
              width={20}
              height={20}
              style={{ borderRadius: 3 }}
            />
            <span className="font-heading text-sm font-semibold tracking-tight text-text-secondary">
              The Patron
            </span>
          </div>

          {/* Center: Nav links -- inline */}
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/grants"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              Grants
            </NavLink>
            <NavLink
              to="/about"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              About
            </NavLink>
            <span className="text-text-tertiary/30">|</span>
            <a
              href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              Contract
            </a>
            <a
              href="https://github.com/Yonkoo11/the-patron"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Right: Built on Base */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-text-tertiary tracking-wide">
              Built on
            </span>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors"
            >
              {/* Base logo -- simplified blue circle mark */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#0052FF" />
                <path d="M12 19.5c4.142 0 7.5-3.358 7.5-7.5S16.142 4.5 12 4.5 4.5 7.858 4.5 12h7.5v7.5z" fill="white" />
              </svg>
              <span className="font-mono text-[10px] font-medium tracking-wide">Base</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
