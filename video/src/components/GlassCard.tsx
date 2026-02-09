import React from 'react';
import { COLORS } from '../design/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  borderColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderColor,
}) => {
  return (
    <div
      style={{
        background: COLORS.glassBg,
        border: `1px solid ${COLORS.glassBorder}`,
        borderRadius: 12,
        padding: 24,
        ...(borderColor
          ? { borderLeft: `2px solid ${borderColor}` }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
