import React from 'react';
import { useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS } from '../design/tokens';

interface PipelineStepProps {
  number: number;
  label: string;
  description: string;
  active: boolean;
  frame: number;
  startFrame: number;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  number,
  label,
  description,
  active,
  frame,
  startFrame,
}) => {
  const { fps } = useVideoConfig();

  const progress = active
    ? spring({
        frame: frame - startFrame,
        fps,
        config: { damping: 18, stiffness: 100, mass: 0.6 },
      })
    : 0;

  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transform: `scale(${scale})`,
      }}
    >
      {/* Circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `2px solid ${active ? COLORS.accentGreen : '#333'}`,
          backgroundColor: active
            ? 'rgba(0,255,136,0.1)'
            : 'rgba(255,255,255,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: active
            ? `0 0 24px ${COLORS.greenGlow}`
            : 'none',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 20,
            fontWeight: 700,
            color: active ? COLORS.accentGreen : COLORS.textTertiary,
          }}
        >
          {number}
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 2,
          color: active ? COLORS.textPrimary : COLORS.textTertiary,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      {/* Description */}
      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: 14,
          color: COLORS.textSecondary,
          textAlign: 'center',
          maxWidth: 180,
        }}
      >
        {description}
      </span>
    </div>
  );
};
