import React from 'react';

export default function ProgressBar({ progress, statusText, labelHtml, show }) {
  if (!show) return null;

  return (
    <div className="prog-section show">
      <div className="gen-status">
        <div className="orb" id="genOrb"></div>
        <span id="genStatusText">{statusText}</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" id="progFill" style={{ width: `${progress}%` }}>
          <span className="prog-pct" id="progPct">{Math.round(progress)}%</span>
        </div>
      </div>
      <p 
        className="prog-label" 
        id="progLabel"
        dangerouslySetInnerHTML={{ __html: labelHtml }}
      />
    </div>
  );
}
