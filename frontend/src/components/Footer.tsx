import { NavLink } from "react-router-dom";
import { BASESCAN_URL, TREASURY_ADDRESS } from "../lib/contract";

function DiamondIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L22 12L12 22L2 12L12 2Z"
        fill="#00ff88"
        fillOpacity="0.15"
        stroke="#00ff88"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L18 12L12 18L6 12L12 6Z"
        fill="#00ff88"
        fillOpacity="0.3"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Top gradient divider */}
      <div className="section-divider" />

      {/* Main footer content */}
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Left: Branding */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <DiamondIcon />
              <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
                The Patron
              </span>
            </div>
            <p className="text-sm text-text-tertiary leading-relaxed max-w-[280px]">
              Autonomous grant agent on Base. AI-driven funding for public goods, no humans in the loop.
            </p>
          </div>

          {/* Middle: Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Resources
            </h4>
            <nav className="flex flex-col gap-2">
              <NavLink
                to="/"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/grants"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                Grant Explorer
              </NavLink>
              <NavLink
                to="/about"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                About
              </NavLink>
            </nav>
          </div>

          {/* Right: External Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Links
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href={`${BASESCAN_URL}/address/${TREASURY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                Contract on Basescan
              </a>
              <a
                href="https://github.com/Yonkoo11/the-patron"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                GitHub
              </a>
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
              >
                Base Network
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="section-divider" />
        <p className="py-6 text-center text-xs text-text-tertiary font-mono">
          Built on Base. Powered by AI. No humans required.
        </p>
      </div>
    </footer>
  );
}
