import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../design/tokens";
import { GlassCard } from "../components/GlassCard";

const links: Array<{
  icon: string;
  label: string;
  url: string;
}> = [
  { icon: ">", label: "Dashboard", url: "the-patron.netlify.app" },
  { icon: "$", label: "GitHub", url: "github.com/Yonkoo11/the-patron" },
];

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "THE PATRON" springs in (frame 0-40)
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing radial glow behind title
  const glowOpacity = 0.06 + 0.08 * Math.sin(frame * 0.08);

  // Link cards slide in (frame 50-100) with 20-frame stagger
  // "Built on Base..." fade in (frame 110-140)
  const taglineOpacity = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing title glow continues to end
  const titleGlowRadius = 40 + 60 * Math.abs(Math.sin(frame * 0.06));

  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pulsing radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,255,136,${glowOpacity}) 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* THE PATRON */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleSpring})`,
          fontFamily: FONTS.heading,
          fontSize: 64,
          fontWeight: 700,
          color: COLORS.accentGreen,
          letterSpacing: 10,
          textShadow: `0 0 ${titleGlowRadius}px rgba(0,255,136,0.4), 0 0 ${titleGlowRadius * 2}px rgba(0,255,136,0.15)`,
          marginBottom: 50,
        }}
      >
        THE PATRON
      </div>

      {/* Link cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
          marginBottom: 50,
        }}
      >
        {links.map((link, i) => {
          const linkStart = 50 + i * 20;
          const linkOpacity = interpolate(
            frame,
            [linkStart, linkStart + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const linkX = interpolate(
            frame,
            [linkStart, linkStart + 20],
            [-40, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: linkOpacity,
                transform: `translateX(${linkX}px)`,
              }}
            >
              <GlassCard
                borderColor={COLORS.accentGreen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 32px",
                  minWidth: 520,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.accentGreen,
                  }}
                >
                  {link.icon}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 16,
                    fontWeight: 400,
                    color: COLORS.textSecondary,
                    width: 100,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 20,
                    fontWeight: 400,
                    color: COLORS.textPrimary,
                  }}
                >
                  {link.url}
                </span>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          fontFamily: FONTS.body,
          fontSize: 24,
          fontWeight: 300,
          color: COLORS.textSecondary,
          letterSpacing: 4,
        }}
      >
        Built on Base. Powered by AI.
      </div>
    </AbsoluteFill>
  );
};
