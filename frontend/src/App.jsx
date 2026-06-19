import React, { useState, useEffect } from 'react';
import Background from './components/Background';
import Navigation from './components/Navigation';
import ReportForm from './components/ReportForm';
import ProgressBar from './components/ProgressBar';

// Helper to download a beautifully styled HTML report containing the 6 requested sections
const downloadHtmlReport = (formData, matchingRows, auditNameText, selectedAudit) => {
  const company = selectedAudit?.company || selectedAudit?.Company || 'CJSJ';
  const sector = selectedAudit?.sector || selectedAudit?.Sector || 'Manufacturing';

  fetch('http://localhost:4004/api/generate-ppt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      formData,
      auditNameText,
      company,
      sector
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to generate PowerPoint report');
      return res.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.reportName || 'Audit_Report'}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to generate report. Please check if the backend is running on port 4004.');
    });
};;

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
  const [progress, setProgress] = useState(0);
  const [currentPhaseText, setCurrentPhaseText] = useState('Synthesizing audit data...');
  const [currentLabelText, setCurrentLabelText] = useState('Estimated time remaining: <b>10–12 minutes</b>');

  // Helper function to format date strings to "DD – MM – YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(d.getDate())} – ${pad(d.getMonth() + 1)} – ${d.getFullYear()}`;
  };

  // Helper function to auto-fill form data from database row fields
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

    // Fallback logic if specific audit_plan / report_name columns are empty or not in DB schema
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

  // Fetch PostgreSQL records on mount
  useEffect(() => {
    fetch('http://localhost:4004/api/audits')
      .then((res) => {
        if (!res.ok) throw new Error('Database server not reachable');
        return res.json();
      })
      .then((data) => {
        setAudits(data);
      })
      .catch((err) => {
        console.error('Failed to load audits from PostgreSQL:', err.message);
        // Fallback placeholder options if database is empty/unreachable
        const fallback = [
          { plan_db_id: 1, id: '1', audit_name: 'Q4 Treasury Audit FY25', timeline_start: '31 – 03 – 2025', timeline_end: '30 – 03 – 2026', audit_plan: 'Annual Internal Audit Plan', title: 'Q4 Treasury' },
          { plan_db_id: 2, id: '2', audit_name: 'Q1 Compliance Audit FY26', timeline_start: '01 – 04 – 2025', timeline_end: '30 – 06 – 2025', audit_plan: 'Quarterly compliance program', title: 'Q1 Compliance' },
          { plan_db_id: 3, id: '3', audit_name: 'Annual IT Security Review', timeline_start: '10 – 05 – 2025', timeline_end: '20 – 05 – 2025', audit_plan: 'Security Audit Schedule', title: 'IT Security Audit' }
        ];
        setAudits(fallback);
      });
  }, []);

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'auditName') {
      const selected = audits.find((a) => {
        const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
        return String(a[nameKey]) === value;
      });
      if (selected) {
        autoFillFromAudit(selected);
      }
    }
  };

  const handleBack = () => {
    alert('Navigating Back...');
  };

  const handleLogout = () => {
    alert('Logging out...');
  };

  const startGeneration = () => {
    const isFormValid = !!(
      formData.auditName &&
      formData.reportName &&
      formData.timelineStart &&
      formData.timelineEnd &&
      formData.targetAudience &&
      formData.reportType &&
      formData.auditPlan
    );
    if (!isFormValid) {
      return;
    }

    if (isCompleted) {
      const selectedAudit = audits.find((a) => {
        const idKey = Object.keys(a).find((key) => key.toLowerCase() === 'id') || 'id';
        const dbIdKey = Object.keys(a).find((key) => key.toLowerCase() === 'plan_db_id') || 'plan_db_id';
        const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
        return String(a[idKey]) === formData.auditName || String(a[dbIdKey]) === formData.auditName || String(a[nameKey]) === formData.auditName;
      });
      const auditNameText = selectedAudit?.audit_name || 'N/A';
      const matchingRows = audits.filter((a) => {
        const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
        return String(a[nameKey]) === auditNameText;
      });
      downloadHtmlReport(formData, matchingRows, auditNameText, selectedAudit);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setIsCompleted(false);
    setCurrentPhaseText('Starting generation...');
    setCurrentLabelText('Estimated time: <b>Under 5 seconds</b>');

    const phases = [
      { target: 20, label: 'Estimated time: <b>Under 5 seconds</b>', status: 'Loading audit records...' },
      { target: 40, label: 'Estimated time: <b>Under 4 seconds</b>', status: 'Analyzing exception logs...' },
      { target: 60, label: 'Estimated time: <b>Under 3 seconds</b>', status: 'Running AI synthesis engine...' },
      { target: 80, label: 'Estimated time: <b>Under 2 seconds</b>', status: 'Generating executive summary...' },
      { target: 95, label: 'Estimated time: <b>Under 1 second</b>', status: 'Finalizing report layout...' },
      { target: 100, label: 'Report generation complete!', status: 'Report ready ✓' },
    ];

    let current = 0;
    let phaseIdx = 0;

    const interval = setInterval(() => {
      if (phaseIdx >= phases.length) {
        clearInterval(interval);
        return;
      }

      const phase = phases[phaseIdx];
      current += 5; // make it much faster

      if (current >= phase.target) {
        current = phase.target;
        setCurrentPhaseText(phase.status);
        setCurrentLabelText(phase.label);
        phaseIdx++;

        if (current === 100) {
          clearInterval(interval);
          setIsCompleted(true);

          // Trigger download automatically
          const selectedAudit = audits.find((a) => {
            const idKey = Object.keys(a).find((key) => key.toLowerCase() === 'id') || 'id';
            const dbIdKey = Object.keys(a).find((key) => key.toLowerCase() === 'plan_db_id') || 'plan_db_id';
            const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
            return String(a[idKey]) === formData.auditName || String(a[dbIdKey]) === formData.auditName || String(a[nameKey]) === formData.auditName;
          });
          const auditNameText = selectedAudit?.audit_name || 'N/A';
          const matchingRows = audits.filter((a) => {
            const nameKey = Object.keys(a).find((key) => key.toLowerCase() === 'audit_name') || 'audit_name';
            return String(a[nameKey]) === auditNameText;
          });
          downloadHtmlReport(formData, matchingRows, auditNameText, selectedAudit);
        }
      }

      setProgress(current);
    }, 40);
  };

  return (
    <>
      {/* Background world */}
      <Background />

      {/* Navigation */}
      <Navigation onBack={handleBack} onLogout={handleLogout} />

      {/* Main Form and Card */}
      <ReportForm
        formData={formData}
        audits={audits}
        onChange={handleFormChange}
        onGenerate={startGeneration}
        isGenerating={isGenerating}
        isCompleted={isCompleted}
        progress={progress}
        statusText={currentPhaseText}
        labelHtml={currentLabelText}
      />
    </>
  );
}

export default App;
