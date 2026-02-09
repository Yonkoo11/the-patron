import React from 'react';
import {
  Img,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { COLORS, FONTS } from '../design/tokens';

interface BrowserFrameProps {
  src: string;
  startFrame: number;
  width?: number;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  src,
  startFrame,
  width = 1200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 0.8 },
  });

  const scale = interpolate(progress, [0, 1], [0.95, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  if (frame < startFrame) return null;

  return (
    <div
      style={{
        width,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        borderRadius: 12,
        overflow: 'hidden',
        background: COLORS.glassBg,
        border: `1px solid ${COLORS.glassBorder}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'relative',
        }}
      >
        {/* Traffic light dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: COLORS.accentRed,
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: COLORS.accentAmber,
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: COLORS.accentGreen,
            }}
          />
        </div>

        {/* URL text */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: FONTS.mono,
            fontSize: 12,
            color: COLORS.textSecondary,
          }}
        >
          the-patron.netlify.app
        </div>
      </div>

      {/* Content */}
      <Img
        src={src}
        style={{
          width: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
