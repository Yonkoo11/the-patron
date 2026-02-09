import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../design/tokens";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Green radial glow expands from center (frame 0-30)
  const glowScale = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "THE PATRON" springs in (frame 15-50)
  const titleSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle slides up (frame 35-65)
  const subtitleOpacity = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [35, 65], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Live badge appears (frame 65-90)
  const badgeOpacity = interpolate(frame, [65, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing green dot
  const dotOpacity = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.1));

  // Fade out (frame 149-179)
  const sceneOpacity = interpolate(frame, [149, 179], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* Green radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -55%) scale(${glowScale})`,
        }}
      />

      {/* THE PATRON */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleSpring})`,
          fontFamily: FONTS.heading,
          fontSize: 120,
          fontWeight: 700,
          color: COLORS.accentGreen,
          letterSpacing: 16,
          textAlign: "center",
          textShadow:
            "0 0 60px rgba(0,255,136,0.4), 0 0 120px rgba(0,255,136,0.15)",
        }}
      >
        THE PATRON
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontFamily: FONTS.body,
          fontSize: 36,
          fontWeight: 300,
          color: "#ffffff",
          letterSpacing: 6,
          marginTop: 24,
          textAlign: "center",
        }}
      >
        Autonomous Grant Agent on Base
      </div>

      {/* Live badge */}
      <div
        style={{
          opacity: badgeOpacity,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 60,
          padding: "8px 20px",
          border: "1px solid rgba(0,255,136,0.3)",
          borderRadius: 30,
          background: "rgba(0,255,136,0.05)",
        }}
      >
        {/* Pulsing dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: COLORS.accentGreen,
            opacity: dotOpacity,
            boxShadow: "0 0 12px rgba(0,255,136,0.6)",
          }}
        />
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 16,
            color: COLORS.accentGreen,
            letterSpacing: 3,
            fontWeight: 500,
          }}
        >
          LIVE ON BASE SEPOLIA
        </span>
      </div>
    </AbsoluteFill>
  );
};
