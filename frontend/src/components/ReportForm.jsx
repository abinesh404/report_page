import React from 'react';
import ProgressBar from './ProgressBar';
import GlassSurface from './GlassSurface';

export default function ReportForm({
  formData,
  audits = [],
  onChange,
  onGenerate,
  isGenerating,
  isCompleted,
  progress,
  statusText,
  labelHtml
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleCheckboxToggle = (field) => {
    if (isGenerating) return;
    onChange(field, !formData[field]);
  };

  // Button styles dynamic overrides
  const getButtonStyles = () => {
    if (isCompleted) {
      return {
        background: 'rgba(16, 185, 129, 0.25)',
        border: '1.5px solid rgba(16, 185, 129, 0.55)',
        boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      };
    }
    return {};
  };

  return (
    <div className="page-wrap">
      <GlassSurface
        displace={0.5}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        brightness={100}
        opacity={1}
        mixBlendMode="normal"
        borderRadius={28}
        className="glass-container border-enabled hover-enabled"
        style={{ padding: 0 }}
      >
        <div className="card-inner" style={{ background: 'transparent', border: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>

          {/* Section header */}
          <div className="section-hdr">
            <h2>AI Report Synthesis Engine</h2>
            <div className="status-row">
              <div className="orb"></div>
              <span>Initializing...</span>
            </div>
          </div>

          <div className="form-body">
            {/* Audit Name */}
            <div className="audit-wrap">
              <label className="field-label">Audit Name</label>
              <div className="audit-select-wrap">
                <div className="icon-left">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6878b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 9h6M9 13h4" />
                  </svg>
                </div>
                <select
                  name="auditName"
                  value={formData.auditName}
                  onChange={handleInputChange}
                  className="gf audit-gf"
                  disabled={isGenerating}
                >
                  {audits && audits.length > 0 ? (
                    (() => {
                      const seenNames = new Set();
                      const uniqueOptions = [];
                      uniqueOptions.push(
                        <option key="empty" value="">Select Audit Name...</option>
                      );
                      audits.forEach((audit, idx) => {
                        const nameKey = Object.keys(audit).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
                        const nameVal = audit[nameKey] || 'Unnamed Audit';
                        
                        if (!seenNames.has(nameVal)) {
                          seenNames.add(nameVal);
                          uniqueOptions.push(
                            <option key={idx} value={nameVal}>
                              {nameVal}
                            </option>
                          );
                        }
                      });
                      return uniqueOptions;
                    })()
                  ) : (
                    <option value="">No Audits Available</option>
                  )}
                </select>
                <div className="icon-right">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6878b0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Row: Report Name | Timeline Start | Timeline End */}
            <div className="g3">
              <div className="fld">
                <label className="field-label">Report Name and Scope</label>
                <div className="rel">
                  <input
                    name="reportName"
                    value={formData.reportName}
                    onChange={handleInputChange}
                    className="gf"
                    type="text"
                    placeholder="e.g., Q4 Treasury Audit Summary"
                    disabled={isGenerating}
                  />
                  <div className="icon-in-r">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="fld">
                <label className="field-label">Timeline Start</label>
                <div className="rel">
                  <input
                    name="timelineStart"
                    value={formData.timelineStart}
                    onChange={handleInputChange}
                    className="gf"
                    type="text"
                    disabled={isGenerating}
                    readOnly
                  />
                  <div className="icon-in-r">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="fld">
                <label className="field-label">Timeline End</label>
                <div className="rel">
                  <input
                    name="timelineEnd"
                    value={formData.timelineEnd}
                    onChange={handleInputChange}
                    className="gf"
                    type="text"
                    disabled={isGenerating}
                    readOnly
                  />
                  <div className="icon-in-r">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row: Target Audience | Type of Audit Report | Audit Plan */}
            <div className="g3">
              <div className="fld">
                <label className="field-label">Target Audience</label>
                <div className="rel">
                  <div className="icon-in-l">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="gf pl"
                    style={{ paddingRight: '38px' }}
                    disabled={isGenerating}
                  >
                    <option value="">Select Target Audience...</option>
                    <option value="Executive Board">Executive Board</option>
                    <option value="Audit Committee">Audit Committee</option>
                    <option value="Senior Management">Senior Management</option>
                    <option value="Process Owners">Process Owners</option>
                  </select>
                  <div className="icon-in-r">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="fld">
                <label className="field-label">Type of Audit Report</label>
                <div className="rel">
                  <div className="icon-in-l">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <select
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleInputChange}
                    className="gf pl"
                    style={{ paddingRight: '38px' }}
                    disabled={isGenerating}
                  >
                    <option value="">Select Report Type...</option>
                    <option value="Executive Summary">Executive Summary</option>
                    <option value="Detailed Findings Report">Detailed Findings Report</option>
                    <option value="Compliance Status Report">Compliance Status Report</option>
                    <option value="Follow-up Audit Report">Follow-up Audit Report</option>
                    <option value="Internal Audit Report">Internal Audit Report</option>
                    <option value="SoX Audit Report">SoX Audit Report</option>
                  </select>
                  <div className="icon-in-r">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="fld">
                <label className="field-label">Audit Plan</label>
                <div className="rel">
                  <div className="icon-in-l">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="8" y1="14" x2="16" y2="14" />
                      <line x1="8" y1="18" x2="13" y2="18" />
                    </svg>
                  </div>
                  <input
                    name="auditPlan"
                    value={formData.auditPlan}
                    onChange={handleInputChange}
                    className="gf pl"
                    type="text"
                    disabled={isGenerating}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="checks">
              <label className="chk-row" onClick={() => handleCheckboxToggle('includeExceptions')}>
                <div className={`chk-box ${formData.includeExceptions ? 'on' : ''}`}>
                  <svg className="chk-mark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="chk-label">Include exceptions reviewed and commented for the period</span>
              </label>
              <label className="chk-row" onClick={() => handleCheckboxToggle('identifySentiment')}>
                <div className={`chk-box ${formData.identifySentiment ? 'on' : ''}`}>
                  <svg className="chk-mark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="chk-label">Identify sentiment from past reports</span>
              </label>
            </div>

            {/* Generate Report Button */}
            <div className="gen-btn-wrap">
              <button
                className="gen-btn"
                onClick={onGenerate}
                style={getButtonStyles()}
                disabled={(isGenerating && !isCompleted) || (!isCompleted && !(formData.auditName && formData.reportName && formData.timelineStart && formData.timelineEnd && formData.targetAudience && formData.reportType && formData.auditPlan))}
              >
                {isGenerating && !isCompleted ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Generating...
                  </>
                ) : isCompleted ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Download Report
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    Generate Report
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar — hidden until Generate is clicked */}
            <ProgressBar
              progress={progress}
              statusText={statusText}
              labelHtml={labelHtml}
              show={isGenerating}
            />
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
