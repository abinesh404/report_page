import React from 'react';
import PlasmaWave from './PlasmaWave';

export default function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#080610' }}>
      <PlasmaWave
        colors={["#A855F7", "#06B6D4"]}
        speed1={0.05}
        speed2={0.05}
        focalLength={0.8}
        bend1={1}
        bend2={0.5}
        dir2={1}
        rotationDeg={0}
      />
    </div>
  );
}
