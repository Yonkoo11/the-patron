import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../design/tokens";
import { PipelineStep } from "../components/PipelineStep";

const steps: Array<{ label: string; description: string }> = [
  { label: "SCAN", description: "Find builders" },
  { label: "VERIFY", description: "Check on-chain activity" },
  { label: "EVALUATE", description: "Score across 4 dimensions" },
  { label: "DECIDE", description: "Apply threshold" },
  { label: "FUND", description: "Send ETH" },
  { label: "REPORT", description: "Log on-chain" },
];

const dimensions: Array<{
  label: string;
  pct: number;
  color: string;
}> = [
  { label: "Novelty", pct: 30, color: COLORS.accentGreen },
  { label: "Activity", pct: 25, color: COLORS.accentBlue },
  { label: "Quality", pct: 25, color: COLORS.accentAmber },
  { label: "Impact", pct: 20, color: COLORS.accentRed },
];

export const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header fade in (frame 0-30)
  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pipeline steps activate sequentially starting at frame 40, 40-frame intervals
  const stepInterval = 40;
  const stepStartBase = 40;

  // Connector line fills green as steps activate
  const connectorFill = interpolate(
    frame,
    [stepStartBase, stepStartBase + stepInterval * 5 + 30],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Evaluation criteria section (frame 280-370)
  const evalLabelOpacity = interpolate(frame, [280, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (frame 390-420)
  const sceneOpacity = interpolate(frame, [390, 420], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            fontWeight: 400,
            color: COLORS.textTertiary,
            letterSpacing: 4,
            textTransform: "uppercase" as const,
          }}
        >
          HOW IT WORKS
        </span>
        <span
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          The Pipeline
        </span>
      </div>

      {/* Pipeline steps with connector */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          maxWidth: 1600,
          padding: "0 20px",
        }}
      >
        {/* Background connector line */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 80,
            right: 80,
            height: 2,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${connectorFill}%`,
              backgroundColor: COLORS.accentGreen,
              boxShadow: `0 0 10px ${COLORS.greenGlow}`,
            }}
          />
        </div>

        {steps.map((step, i) => {
          const stepStart = stepStartBase + i * stepInterval;
          const isActive = frame >= stepStart;

          return (
            <PipelineStep
              key={i}
              number={i + 1}
              label={step.label}
              description={step.description}
              active={isActive}
              frame={frame}
              startFrame={stepStart}
            />
          );
        })}
      </div>

      {/* Evaluation Criteria */}
      <div
        style={{
          opacity: evalLabelOpacity,
          marginTop: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            fontWeight: 400,
            color: COLORS.textTertiary,
            letterSpacing: 4,
            textTransform: "uppercase" as const,
            marginBottom: 32,
          }}
        >
          EVALUATION CRITERIA
        </span>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
          }}
        >
          {dimensions.map((dim, i) => {
            const dimStart = 290 + i * 15;
            const barFill = interpolate(
              frame,
              [dimStart, dimStart + 30],
              [0, dim.pct * 3],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const dimOpacity = interpolate(
              frame,
              [dimStart, dimStart + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div key={i} style={{ opacity: dimOpacity }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 16,
                      fontWeight: 400,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {dim.label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 28,
                      fontWeight: 600,
                      color: dim.color,
                    }}
                  >
                    {dim.pct}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: barFill,
                      height: "100%",
                      backgroundColor: dim.color,
                      borderRadius: 3,
                      boxShadow: `0 0 10px ${dim.color}50`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
