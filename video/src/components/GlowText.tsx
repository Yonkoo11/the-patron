import React from 'react';
import { COLORS } from '../design/tokens';

interface GlowTextProps {
  children: React.ReactNode;
  fontSize: number;
  color?: string;
  glowColor?: string;
  glowRadius?: number;
  fontFamily?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
}

export const GlowText: React.FC<GlowTextProps> = ({
  children,
  fontSize,
  color = COLORS.accentGreen,
  glowColor = COLORS.greenGlow,
  glowRadius = 40,
  fontFamily,
  fontWeight,
  style,
}) => {
  return (
    <span
      style={{
        fontSize,
        color,
        textShadow: `0 0 ${glowRadius}px ${glowColor}`,
        fontFamily,
        fontWeight,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
