import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS, ADDRESSES } from "../design/tokens";
import { GlassCard } from "../components/GlassCard";

export const VerificationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Every decision on-chain" springs in (frame 0-40)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Treasury contract card (frame 60-100)
  const contractOpacity = interpolate(frame, [60, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Reason hash card (frame 110-150)
  const hashOpacity = interpolate(frame, [110, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blinking cursor
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Closing line (frame 170-200)
  const closingOpacity = interpolate(frame, [170, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const closingY = interpolate(frame, [170, 200], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (frame 270-300)
  const sceneOpacity = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          maxWidth: 900,
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            transform: `scale(${headerSpring})`,
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 600,
            color: COLORS.textPrimary,
            textAlign: "center",
          }}
        >
          Every decision on-chain
        </div>

        {/* Treasury contract card */}
        <div style={{ opacity: contractOpacity, width: "100%" }}>
          <GlassCard
            borderColor="rgba(0,255,136,0.2)"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: "rgba(0,255,136,0.06)",
              border: "1px solid rgba(0,255,136,0.2)",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 16,
                fontWeight: 400,
                color: COLORS.textSecondary,
                letterSpacing: 3,
                textTransform: "uppercase" as const,
              }}
            >
              TREASURY CONTRACT
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 22,
                fontWeight: 500,
                color: COLORS.accentGreen,
              }}
            >
              {ADDRESSES.treasury}
            </span>
          </GlassCard>
        </div>

        {/* Verification hash card */}
        <div style={{ opacity: hashOpacity, width: "100%" }}>
          <GlassCard
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 16,
                fontWeight: 400,
                color: COLORS.textSecondary,
                letterSpacing: 3,
                textTransform: "uppercase" as const,
              }}
            >
              VERIFICATION HASH
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 18,
                fontWeight: 400,
                color: COLORS.textSecondary,
              }}
            >
              0x3d1929dac325725a...
              {cursorVisible && (
                <span style={{ color: COLORS.accentGreen, marginLeft: 2 }}>
                  |
                </span>
              )}
            </span>
          </GlassCard>
        </div>

        {/* Closing statement */}
        <div
          style={{
            opacity: closingOpacity,
            transform: `translateY(${closingY}px)`,
            fontFamily: FONTS.heading,
            fontSize: 36,
            fontWeight: 500,
            color: COLORS.accentGreen,
            textAlign: "center",
            textShadow: "0 0 30px rgba(0,255,136,0.2), 0 0 60px rgba(0,255,136,0.08)",
          }}
        >
          No committees. No applications. No humans.
        </div>
      </div>
    </AbsoluteFill>
  );
};
