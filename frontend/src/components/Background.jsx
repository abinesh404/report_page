import React from 'react';
import Particles from './Particles';
import './BackgroundOrbs.css';

export default function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#080610' }}>
      {/* Floating Ambient Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      {/* Interactive Particle Field */}
      <Particles
        particleColors={["#ffffff", "#a855f7", "#06b6d4"]}
        particleCount={250}
        particleSpread={12}
        speed={0.15}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
        pixelRatio={1}
      />
    </div>
  );
}
