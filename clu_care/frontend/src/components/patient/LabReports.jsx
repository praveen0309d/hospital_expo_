import React from "react";
import "./LabReports.css";

const LabReports = ({ labReports }) => {
  if (!labReports || labReports.length === 0) {
    return <div className="no-reports">No lab reports available.</div>;
  }

  return (
    <div className="lab-reports-container">
      <h2 className="reports-title">Lab Reports</h2>
      <div className="reports-grid">
        {labReports.map((report, index) => (
          <div key={index} className="report-card">
            <div className="report-header">
              <h3 className="test-name">{report.testName}</h3>
              <span className="report-date">{report.date}</span>
            </div>
            
            <div className="report-content">
              <div className="result-section">
                <h4>Results:</h4>
                <p className="result-value">{report.results}</p>
              </div>
              
<div className="action-buttons">
  {report.file && (
    <>
      <a
        href={`http://127.0.0.1:5000${report.file}`}
        download={report.file.split("/").pop()}
        className="btn download-btn"
      >
        ⬇ Download
      </a>
    </>
  )}
</div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabReports;