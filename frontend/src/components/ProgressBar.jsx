import React from 'react';

export default function ProgressBar({ progress, statusText, labelHtml, show, isCompleted, hasError }) {
  if (!show) return null;

  const barClass = hasError ? 'prog-fill prog-fill-error' : isCompleted ? 'prog-fill prog-fill-done' : 'prog-fill';

  return (
    <div className="prog-section show">
      <div className="gen-status">
        <div className={`orb ${isCompleted ? 'orb-done' : hasError ? 'orb-error' : 'orb-active'}`}></div>
        <span>{statusText}</span>
      </div>
      <div className="prog-track">
        <div className={barClass} style={{ width: `${progress}%` }}>
          {progress > 8 && (
            <span className="prog-pct">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
      <p className="prog-label">{labelHtml}</p>
    </div>
  );
}
