import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { COLORS, FONTS } from "../design/tokens";
import { BrowserFrame } from "../components/BrowserFrame";

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header fade in (frame 0-30)
  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame 1: home-hero.png floats in from right (frame 30-150)
  const frame1Enter = interpolate(frame, [30, 70], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frame1Opacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame 1 slides left (frame 150-180), frame 2 slides in from right
  const frame1SlideOut = interpolate(frame, [150, 190], [0, -110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frame2Enter = interpolate(frame, [150, 190], [110, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frame2Opacity = interpolate(frame, [150, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Frame 2 slides left (frame 240-280), frame 3 slides in from right
  const frame2SlideOut = interpolate(frame, [240, 280], [0, -110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frame3Enter = interpolate(frame, [240, 280], [110, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frame3Opacity = interpolate(frame, [240, 270], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (frame 330-360)
  const sceneOpacity = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Compute which frame is visible to avoid overlap
  const showFrame1 = frame < 190;
  const showFrame2 = frame >= 150 && frame < 280;
  const showFrame3 = frame >= 240;

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.heading,
            fontSize: 40,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          Live Dashboard
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            fontWeight: 400,
            color: COLORS.accentGreen,
          }}
        >
          the-patron.netlify.app
        </span>
      </div>

      {/* Browser frames container */}
      <div
        style={{
          position: "relative",
          width: 1200,
          height: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Green glow underneath */}
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,255,136,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Frame 1: home-hero */}
        {showFrame1 && (
          <div
            style={{
              position: "absolute",
              opacity: frame1Opacity,
              transform: `translateX(${frame1Enter + (frame >= 150 ? frame1SlideOut : 0)}%) perspective(1200px) rotateY(-3deg)`,
            }}
          >
            <BrowserFrame
              src={staticFile("screenshots/home-hero.png")}
              startFrame={30}
              width={1100}
            />
          </div>
        )}

        {/* Frame 2: grants-page */}
        {showFrame2 && (
          <div
            style={{
              position: "absolute",
              opacity: frame2Opacity,
              transform: `translateX(${frame2Enter + (frame >= 240 ? frame2SlideOut : 0)}%) perspective(1200px) rotateY(-3deg)`,
            }}
          >
            <BrowserFrame
              src={staticFile("screenshots/grants-page.png")}
              startFrame={150}
              width={1100}
            />
          </div>
        )}

        {/* Frame 3: about-page */}
        {showFrame3 && (
          <div
            style={{
              position: "absolute",
              opacity: frame3Opacity,
              transform: `translateX(${frame3Enter}%) perspective(1200px) rotateY(-3deg)`,
            }}
          >
            <BrowserFrame
              src={staticFile("screenshots/about-page.png")}
              startFrame={240}
              width={1100}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
