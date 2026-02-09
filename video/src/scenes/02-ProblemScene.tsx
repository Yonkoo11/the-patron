import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../design/tokens";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in (frame 0-20)
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 1: "Grant programs are slow." (frame 20-50)
  const line1Opacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [20, 50], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "Weeks of applications..." (frame 70-100)
  const line2Opacity = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [70, 100], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 3: "What if grants found builders instead?" (frame 130-160) with spring
  const line3Spring = spring({
    frame: Math.max(0, frame - 130),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const line3Opacity = interpolate(frame, [130, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative line grows (frame 150-180)
  const lineWidth = interpolate(frame, [150, 180], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (frame 240-270)
  const sceneOpacity = interpolate(frame, [240, 270], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn * sceneOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          maxWidth: 1200,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            fontFamily: FONTS.heading,
            fontSize: 56,
            fontWeight: 600,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Grant programs are slow.
        </div>

        {/* Line 2 */}
        <div
          style={{
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            fontFamily: FONTS.body,
            fontSize: 36,
            fontWeight: 300,
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          Weeks of applications. Committee reviews. Voting rounds.
        </div>

        {/* Line 3 */}
        <div
          style={{
            opacity: line3Opacity,
            transform: `scale(${line3Spring})`,
            fontFamily: FONTS.heading,
            fontSize: 52,
            fontWeight: 600,
            color: COLORS.accentGreen,
            textAlign: "center",
            textShadow: "0 0 40px rgba(0,255,136,0.3), 0 0 80px rgba(0,255,136,0.1)",
          }}
        >
          What if grants found builders instead?
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: "rgba(0,255,136,0.3)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
