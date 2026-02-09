import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS } from '../design/tokens';

export const MeshBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Orb positions driven by Math.sin for smooth looping drift
  const greenX = 30 + Math.sin(frame * 0.008) * 10;
  const greenY = 25 + Math.sin(frame * 0.006 + 1) * 8;

  const blueX = 70 + Math.sin(frame * 0.007 + 2) * 12;
  const blueY = 60 + Math.sin(frame * 0.005 + 3) * 10;

  const amberX = 50 + Math.sin(frame * 0.009 + 4) * 8;
  const amberY = 80 + Math.sin(frame * 0.007 + 5) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Green orb */}
      <div
        style={{
          position: 'absolute',
          left: `${greenX}%`,
          top: `${greenY}%`,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Blue orb */}
      <div
        style={{
          position: 'absolute',
          left: `${blueX}%`,
          top: `${blueY}%`,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Amber orb */}
      <div
        style={{
          position: 'absolute',
          left: `${amberX}%`,
          top: `${amberY}%`,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Dot grid overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage:
            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radial vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
