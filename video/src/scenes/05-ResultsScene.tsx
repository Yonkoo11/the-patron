import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS, GRANTS } from "../design/tokens";
import { GrantRow } from "../components/GrantRow";

const stats: Array<{
  label: string;
  value: number;
  display: string;
  isDecimal: boolean;
}> = [
  { label: "Grants Disbursed", value: 8, display: "8", isDecimal: false },
  { label: "Rounds Completed", value: 6, display: "6", isDecimal: false },
  { label: "Treasury ETH", value: 0.054, display: "0.054", isDecimal: true },
];

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header fade in (frame 0-30)
  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (frame 330-360)
  const sceneOpacity = interpolate(frame, [330, 360], [1, 0], {
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
        padding: "0 100px",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          fontFamily: FONTS.heading,
          fontSize: 48,
          fontWeight: 600,
          color: COLORS.textPrimary,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        Live Results
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 80,
          justifyContent: "center",
          marginBottom: 70,
        }}
      >
        {stats.map((stat, i) => {
          const statStart = 30 + i * 20;

          const statSpring = spring({
            frame: Math.max(0, frame - statStart),
            fps,
            config: { damping: 12, stiffness: 80, mass: 0.8 },
          });

          // Count up from 0
          const countEnd = statStart + 40;
          const rawValue = interpolate(
            frame,
            [statStart, countEnd],
            [0, stat.value],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const displayValue = stat.isDecimal
            ? rawValue.toFixed(3)
            : String(Math.round(rawValue));

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${statSpring})`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 72,
                  fontWeight: 700,
                  color: COLORS.accentGreen,
                  textShadow:
                    "0 0 30px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)",
                }}
              >
                {displayValue}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  fontWeight: 400,
                  color: COLORS.textSecondary,
                  marginTop: 12,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grant rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {GRANTS.map((grant, i) => (
          <GrantRow
            key={i}
            address={grant.address}
            score={grant.score}
            amount={grant.amount}
            startFrame={140}
            index={i}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
