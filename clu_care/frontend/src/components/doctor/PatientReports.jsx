import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUser, 
  FaFlask, 
  FaFilePdf, 
  FaDownload, 
  FaEye, 
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaVenusMars,
  FaBirthdayCake
} from "react-icons/fa";
import "./PatientReports.css";

function PatientReports() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedPatient, setExpandedPatient] = useState(null);

  const doctorId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!doctorId) {
          setError("Doctor not logged in");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/patients/by-doctor/${doctorId}`
        );
        setPatients(response.data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to fetch patients. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

  const togglePatientExpansion = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="patient-reports-loading">
      <FaSpinner className="loading-spinner" />
      <p>Loading patient reports...</p>
    </div>
  );

  if (error) return (
    <div className="patient-reports-error">
      <FaExclamationTriangle className="error-icon" />
      <h3>Error Loading Reports</h3>
      <p>{error}</p>
      <button 
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );

  if (!patients.length) return (
    <div className="patient-reports-empty">
      <FaFlask className="empty-icon" />
      <h3>No Patients Assigned</h3>
      <p>You don't have any patients assigned to you yet.</p>
    </div>
  );

  return (
    <div className="patient-reports-container">
      <div className="patient-reports-header">
        <h1>
          <FaFlask className="header-icon" />
          Patient Lab Reports
        </h1>
        <p>View and manage laboratory reports for your patients</p>
      </div>

      <div className="patients-list">
        {patients.map((patient) => (
          <div key={patient.patientId} className="patient-report-card">
            <div 
              className="patient-summary"
              onClick={() => togglePatientExpansion(patient.patientId)}
            >
              <div className="patient-info">
                <div className="patient-avatar">
                  {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="patient-details">
                  <h3 className="patient-name">{patient.name}</h3>
                  <p className="patient-id">ID: {patient.patientId}</p>
                  <div className="patient-meta">
                    <span className="meta-item">
                      <FaBirthdayCake className="meta-icon" />
                      {patient.age} years
                    </span>
                    <span className="meta-item">
                      <FaVenusMars className="meta-icon" />
                      {patient.gender}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-stats">
                <span className="report-count">
                  {patient.labReports?.length || 0} reports
                </span>
                <div className={`expand-icon ${expandedPatient === patient.patientId ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
            </div>

            {expandedPatient === patient.patientId && (
              <div className="patient-reports-details">
                {patient.labReports && patient.labReports.length > 0 ? (
                  <div className="reports-grid">
                    {patient.labReports.map((report, idx) => (
                      <div key={idx} className="lab-report-item">
                        <div className="report-header">
                          <h4 className="report-test-name">
                            <FaFlask className="report-icon" />
                            {report.testName}
                          </h4>
                          <span className="report-date">
                            <FaCalendarAlt className="date-icon" />
                            {formatDate(report.date)}
                          </span>
                        </div>

                        <div className="report-content">
                          <div className="report-results">
                            <strong>Results:</strong>
                            <p>{report.results || "No results available"}</p>
                          </div>

                          {report.file && (
                            <div className="report-actions">
                              <a
                                href={`http://127.0.0.1:5000${report.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="report-action-button view-report-button"
                              >
                                <FaEye className="action-icon" />
                                View Report
                              </a>
                             
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reports-message">
                    <FaFilePdf className="no-reports-icon" />
                    <p>No lab reports available for this patient.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="patient-reports-footer">
        <p className="footer-note">
          <FaExclamationTriangle className="footer-icon" />
          All lab reports are confidential. Please ensure proper handling of patient data.
        </p>
      </div>
    </div>
  );
}

export default PatientReports;