import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();

  const formattedBalance = isLoading
    ? "..."
    : `${parseFloat(balance).toFixed(4)} ETH`;

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) {
      closeMobileMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileOpen(true);
    setIsClosing(false);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-white/[0.06]"
        style={{
          background: "rgba(10,10,10,0.7)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
        }}
      >
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

          {/* Center: Nav (desktop only) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-accent-green nav-link-active"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent-green nav-link-active" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Treasury Badge + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Treasury badge - visible on both desktop and mobile */}
            <div className="glow-green flex items-center gap-2 rounded-full border border-accent-green/20 bg-accent-green/5 px-3 py-1.5 md:px-4">
              <span className="h-2 w-2 rounded-full bg-accent-green pulse-glow" />
              <span className="font-mono text-xs font-medium text-accent-green md:text-sm">
                {formattedBalance}
              </span>
            </div>

            {/* Mobile hamburger button with animated lines */}
            <button
              onClick={mobileOpen ? closeMobileMenu : openMobileMenu}
              className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-150"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <div className="hamburger-lines">
                <span
                  className={`hamburger-line ${mobileOpen && !isClosing ? "hamburger-open-top" : ""}`}
                />
                <span
                  className={`hamburger-line ${mobileOpen && !isClosing ? "hamburger-open-mid" : ""}`}
                />
                <span
                  className={`hamburger-line ${mobileOpen && !isClosing ? "hamburger-open-bot" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-[100] md:hidden ${isClosing ? "mobile-menu-exit" : "mobile-menu-enter"}`}
          style={{
            background: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* Header row inside overlay (mirrors main header) */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2.5 text-text-primary no-underline"
            >
              <DiamondIcon />
              <span className="font-heading text-lg font-semibold tracking-tight">
                The Patron
              </span>
            </NavLink>
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-150"
              aria-label="Close menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col px-6 mt-8">
            {navLinks.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `mobile-nav-item py-4 text-2xl font-heading font-semibold tracking-tight border-b border-white/[0.06] transition-colors duration-150 ${
                    isActive
                      ? "text-accent-green"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
                style={{
                  animationDelay: `${80 + i * 60}ms`,
                }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Treasury balance in mobile menu */}
          <div
            className="px-6 mt-10 mobile-nav-item"
            style={{ animationDelay: `${80 + navLinks.length * 60}ms` }}
          >
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-3">
              Treasury
            </p>
            <div className="glow-green inline-flex items-center gap-2.5 rounded-full border border-accent-green/20 bg-accent-green/5 px-5 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green pulse-glow" />
              <span className="font-mono text-lg font-medium text-accent-green">
                {formattedBalance}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
