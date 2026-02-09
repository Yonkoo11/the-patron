import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import GrantsPage from "./pages/GrantsPage";
import AboutPage from "./pages/AboutPage";

/* Animated mesh gradient background -- three slowly orbiting color blobs */
function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Primary green orb */}
      <div
        className="animate-orb-1 absolute h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%)",
          top: "-10%",
          left: "20%",
        }}
      />
      {/* Secondary blue orb */}
      <div
        className="animate-orb-2 absolute h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          top: "40%",
          right: "-5%",
        }}
      />
      {/* Tertiary amber orb */}
      <div
        className="animate-orb-3 absolute h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 70%)",
          bottom: "10%",
          left: "10%",
        }}
      />
      {/* Noise grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Floating particles */}
      {[
        { left: "10%", duration: 18, delay: 0 },
        { left: "25%", duration: 24, delay: 3 },
        { left: "40%", duration: 15, delay: 7 },
        { left: "55%", duration: 30, delay: 2 },
        { left: "65%", duration: 22, delay: 5 },
        { left: "75%", duration: 35, delay: 1 },
        { left: "85%", duration: 20, delay: 9 },
        { left: "92%", duration: 28, delay: 6 },
      ].map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            animation: `float-particle ${p.duration}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}
      {/* Subtle horizontal scanline effect */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
      }} />
    </div>
  );
}

/* Scroll-to-top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* Scroll-reveal observer -- adds .revealed class to [data-reveal] elements */
function ScrollRevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      observer.observe(el);
    });

    // Re-observe on route changes
    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
        observer.observe(el);
      });
    });
    mutationObserver.observe(document.getElementById("root")!, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScrollRevealInit />
      <MeshBackground />
      <div className="relative min-h-screen bg-transparent text-text-primary">
        <Header />
        <main className="mx-auto max-w-[1200px] px-6 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
