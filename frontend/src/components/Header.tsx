import { NavLink } from "react-router-dom";
import { useTreasury } from "../hooks/useTreasury";
function DiamondIcon() {
  return (
    <svg
      width="24"
      height="24"
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

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/grants", label: "Grants" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { balance, isLoading } = useTreasury();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* Left: Logo + Title */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 text-text-primary no-underline hover:text-text-primary"
        >
          <DiamondIcon />
          <span className="font-heading text-lg font-semibold tracking-tight">
            The Patron
          </span>
        </NavLink>

        {/* Center: Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-accent-green"
                    : "text-text-secondary hover:text-text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent-green" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Treasury Balance Badge */}
        <div className="glow-green flex items-center gap-2 rounded-full border border-accent-green/20 bg-accent-green/5 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-green pulse-glow" />
          <span className="font-mono text-sm font-medium text-accent-green">
            {isLoading ? "..." : `${parseFloat(balance).toFixed(4)} ETH`}
          </span>
        </div>
      </div>
    </header>
  );
}
