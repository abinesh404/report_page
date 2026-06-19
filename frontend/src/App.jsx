import React, { useState, useEffect, useRef, useCallback } from 'react';
import Background from './components/Background';
import Navigation from './components/Navigation';
import ReportForm from './components/ReportForm';

function App() {
  const [formData, setFormData] = useState({
    auditName: '',
    reportName: '',
    timelineStart: '',
    timelineEnd: '',
    targetAudience: '',
    reportType: '',
    auditPlan: '',
    includeExceptions: false,
    identifySentiment: false
  });

  const [audits, setAudits] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhaseText, setCurrentPhaseText] = useState('');
  const [currentLabelText, setCurrentLabelText] = useState('');
  const progressIntervalRef = useRef(null);
  const abortRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getDate())} – ${pad(d.getMonth() + 1)} – ${d.getFullYear()}`;
  };

  const autoFillFromAudit = (auditRow) => {
    if (!auditRow) return;
    const getVal = (possibleKeys) => {
      const matchedKey = possibleKeys.find(
        (pk) => Object.keys(auditRow).some((k) => k.toLowerCase() === pk.toLowerCase())
      );
      const actualKey = matchedKey ? Object.keys(auditRow).find((k) => k.toLowerCase() === matchedKey.toLowerCase()) : null;
      return actualKey ? auditRow[actualKey] : '';
    };

    const timelineStart = formatDate(getVal(['timeline_start', 'timeline_start_date', 'timelineStart', 'start_date']));
    const timelineEnd = formatDate(getVal(['timeline_end', 'timeline_end_date', 'timelineEnd', 'end_date']));
    const titleVal = getVal(['title']);
    const processVal = getVal(['process']);
    const auditPlan = getVal(['audit_type', 'auditType']) || getVal(['audit_plan', 'auditPlan', 'plan_name']) || titleVal || processVal || 'Annual Internal Audit Plan';
    const reportName = getVal(['report_name', 'reportName']) || (titleVal ? `${titleVal} Summary` : 'New Report');
    const nameVal = getVal(['audit_name', 'auditName', 'title']) || 'Unnamed Audit';

    setFormData((prev) => ({
      ...prev,
      auditName: String(nameVal) || prev.auditName,
      timelineStart: timelineStart || prev.timelineStart,
      timelineEnd: timelineEnd || prev.timelineEnd,
      auditPlan: auditPlan || prev.auditPlan,
      reportName: reportName || prev.reportName
    }));
  };

  useEffect(() => {
    fetch('http://localhost:4004/api/audits')
      .then((res) => {
        if (!res.ok) throw new Error('Database server not reachable');
        return res.json();
      })
      .then((data) => setAudits(data))
      .catch((err) => {
        console.error('Failed to load audits from PostgreSQL:', err.message);
        const fallback = [
          { plan_db_id: 1, id: '1', audit_name: 'Q4 Treasury Audit FY25', timeline_start: '31 – 03 – 2025', timeline_end: '30 – 03 – 2026', audit_plan: 'Annual Internal Audit Plan', title: 'Q4 Treasury' },
          { plan_db_id: 2, id: '2', audit_name: 'Q1 Compliance Audit FY26', timeline_start: '01 – 04 – 2025', timeline_end: '30 – 06 – 2025', audit_plan: 'Quarterly compliance program', title: 'Q1 Compliance' },
          { plan_db_id: 3, id: '3', audit_name: 'Annual IT Security Review', timeline_start: '10 – 05 – 2025', timeline_end: '20 – 05 – 2025', audit_plan: 'Security Audit Schedule', title: 'IT Security Audit' }
        ];
        setAudits(fallback);
      });
  }, []);

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'auditName') {
      const selected = audits.find((a) => {
        const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
        return String(a[nameKey]) === value;
      });
      if (selected) autoFillFromAudit(selected);
    }
  };

  const handleBack = () => alert('Navigating Back...');
  const handleLogout = () => alert('Logging out...');

  // Phases shown during progress — the bar climbs to 85% during the API call,
  // then jumps to 100% only when the response blob is received.
  const phases = [
    { at: 5,  status: 'Connecting to server…',              label: 'Initializing report engine' },
    { at: 15, status: 'Loading audit records…',              label: 'Querying database' },
    { at: 30, status: 'Analyzing exception logs…',           label: 'Processing compliance data' },
    { at: 45, status: 'Running AI synthesis engine…',        label: 'Generating insights' },
    { at: 60, status: 'Generating executive summary…',       label: 'Building presentation slides' },
    { at: 75, status: 'Finalizing report layout…',           label: 'Rendering charts & tables' },
    { at: 85, status: 'Compiling PowerPoint…',               label: 'Almost there' },
  ];

  const startProgressSimulation = useCallback(() => {
    let tick = 0;
    let currentProg = 0;
    const speed = 120; // ms per tick

    progressIntervalRef.current = setInterval(() => {
      tick++;
      // Ease toward 85% over ~10 seconds, never exceeding 85
      const target = 85;
      const elapsed = tick * speed;
      const t = Math.min(elapsed / 10000, 1); // 0→1 over 10s
      currentProg = target * (1 - Math.pow(1 - t, 2.5)); // ease-out curve

      // Determine which phase to show
      const phase = [...phases].reverse().find(p => currentProg >= p.at) || phases[0];
      setProgress(Math.min(Math.round(currentProg), 85));
      setCurrentPhaseText(phase.status);
      setCurrentLabelText(phase.label);
    }, speed);
  }, []);

  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const triggerDownload = useCallback(async (fd) => {
    const selectedAudit = audits.find((a) => {
      const idKey = Object.keys(a).find((key) => key.toLowerCase() === 'id') || 'id';
      const dbIdKey = Object.keys(a).find((key) => key.toLowerCase() === 'plan_db_id') || 'plan_db_id';
      const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
      return String(a[idKey]) === fd.auditName || String(a[dbIdKey]) === fd.auditName || String(a[nameKey]) === fd.auditName;
    });
    const company = selectedAudit?.company || selectedAudit?.Company || 'CJSJ';
    const sector = selectedAudit?.sector || selectedAudit?.Sector || 'Manufacturing';
    const auditNameText = selectedAudit?.audit_name || 'N/A';

    abortRef.current = new AbortController();

    const res = await fetch('http://localhost:4004/api/generate-ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: fd, auditNameText, company, sector }),
      signal: abortRef.current.signal,
    });

    if (!res.ok) throw new Error('Server returned an error');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fd.reportName || 'Audit_Report'}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [audits]);

  const startGeneration = async () => {
    const isFormValid = !!(
      formData.auditName &&
      formData.reportName &&
      formData.timelineStart &&
      formData.timelineEnd &&
      formData.targetAudience &&
      formData.reportType &&
      formData.auditPlan
    );
    if (!isFormValid) return;

    // If already completed, just re-download
    if (isCompleted) {
      try { await triggerDownload(formData); } catch (e) { console.error(e); }
      return;
    }

    // Reset state
    setIsGenerating(true);
    setIsCompleted(false);
    setHasError(false);
    setProgress(0);
    setCurrentPhaseText('Connecting to server…');
    setCurrentLabelText('Initializing report engine');

    // Start progress simulation (climbs to 85%)
    startProgressSimulation();

    try {
      await triggerDownload(formData);

      // API returned! Jump to 100%
      stopProgressSimulation();
      setProgress(100);
      setCurrentPhaseText('Report ready ✓');
      setCurrentLabelText('Download started automatically');
      setIsCompleted(true);
    } catch (err) {
      stopProgressSimulation();
      if (err.name !== 'AbortError') {
        console.error(err);
        setProgress(0);
        setCurrentPhaseText('Generation failed');
        setCurrentLabelText('Please check backend and try again');
        setHasError(true);
        setIsGenerating(false);
      }
    }
  };

  const handleReset = () => {
    setIsGenerating(false);
    setIsCompleted(false);
    setHasError(false);
    setProgress(0);
    setCurrentPhaseText('');
    setCurrentLabelText('');
  };

  return (
    <>
      <Background />
      <Navigation onBack={handleBack} onLogout={handleLogout} />
      <ReportForm
        formData={formData}
        audits={audits}
        onChange={handleFormChange}
        onGenerate={startGeneration}
        onReset={handleReset}
        isGenerating={isGenerating}
        isCompleted={isCompleted}
        hasError={hasError}
        progress={progress}
        statusText={currentPhaseText}
        labelHtml={currentLabelText}
      />
    </>
  );
}

export default App;
