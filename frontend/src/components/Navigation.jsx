import React from 'react';
import GlassSurface from './GlassSurface';

export default function Navigation({ onBack, onLogout }) {
  return (
    <nav className="topnav">
      {/* Logo */}
      <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/ajalabs_white.png" alt="ajalabs logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Centre title */}
      <h1 className="nav-title">AI Report Generator</h1>

      {/* Buttons */}
      <div className="nav-pills">
        <GlassSurface
          displace={0.2}
          distortionScale={-40}
          borderRadius={50}
          className="glass-container border-enabled hover-enabled"
          style={{ padding: 0 }}
        >
          <button className="pill pill-back" onClick={onBack} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '9px 20px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </GlassSurface>

        <GlassSurface
          displace={0.2}
          distortionScale={-40}
          borderRadius={50}
          className="glass-container border-enabled hover-enabled"
          style={{ padding: 0, background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.8) 0%, rgba(139, 92, 246, 0.7) 100%)' }}
        >
          <button className="pill pill-logout" onClick={onLogout} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '9px 20px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </GlassSurface>
      </div>
    </nav>
  );
}
