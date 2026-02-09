import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { COLORS, FONTS } from '../design/tokens';
import { GlassCard } from './GlassCard';

interface GrantRowProps {
  address: string;
  score: number;
  amount: string;
  startFrame: number;
  index: number;
}

const getScoreColor = (score: number): string => {
  if (score >= 60) return COLORS.accentGreen;
  if (score >= 40) return COLORS.accentAmber;
  return COLORS.accentRed;
};

export const GrantRow: React.FC<GrantRowProps> = ({
  address,
  score,
  amount,
  startFrame,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryFrame = startFrame + index * 35;
  const color = getScoreColor(score);

  const progress = spring({
    frame: frame - entryFrame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 0.8 },
  });

  const translateX = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  if (frame < entryFrame) return null;

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <GlassCard
        borderColor={color}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
        }}
      >
        {/* Address */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 20,
            color: '#ffffff',
          }}
        >
          {address}
        </span>

        {/* Score */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 24,
            fontWeight: 700,
            color,
          }}
        >
          {score}/100
        </span>

        {/* Amount */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            color: COLORS.accentGreen,
          }}
        >
          {amount} ETH
        </span>
      </GlassCard>
    </div>
  );
};
