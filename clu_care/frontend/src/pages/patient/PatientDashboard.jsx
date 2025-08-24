import React, { useEffect, useState } from "react";
import PatientProfile from "../../components/patient/PatientProfile";
import Appointments from "../../components/patient/Appointments";
import Prescriptions from "../../components/patient/Prescriptions";
import LabReports from "../../components/patient/LabReports";
import AssignedDoctor from "../../components/patient/AssignedDoctor";
import "./PatientDashboard.css";

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [currentTime, setCurrentTime] = useState(new Date());
  const token = localStorage.getItem("authToken");

  // Fetch patient data function
  const fetchPatientData = async () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user || !user.patientId) {
      setError("Missing user or patientId! Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/mypatient/${user.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch patient data");
      setPatientData(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching patient data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) return <div className="dashboard-loading">Loading your health data...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!patientData) return <div className="dashboard-error">No patient data found.</div>;

  return (
    <div className="patient-page">
      <div className="patient-dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>{getGreeting()}, {patientData.name || 'Valued Patient'}!</h1>
              <p className="welcome-message">We're here to support your health journey</p>
              <div className="current-time">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

          </div>
        </header>

        <div className="dashboard-content">
          {/* Sidebar Navigation */}
          <nav className="dashboard-sidebar">
            <div className="sidebar-header">
              <div className="user-avatar">
                {patientData.name ? patientData.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="user-info">
                <h3>{patientData.name || 'Patient'}</h3>
                <p>Patient ID: {patientData.patientId}</p>
              </div>
            </div>

            <div className="sidebar-nav">
              <button 
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="nav-icon">👤</span>
                <span>Profile</span>
              </button>
              
              <button 
                className={`nav-item ${activeTab === "appointments" ? "active" : ""}`}
                onClick={() => setActiveTab("appointments")}
              >
                <span className="nav-icon">📅</span>
                <span>Appointments</span>
                {patientData.appointments && patientData.appointments.length > 0 && (
                  <span className="nav-badge">{patientData.appointments.length}</span>
                )}
              </button>
              
              <button 
                className={`nav-item ${activeTab === "prescriptions" ? "active" : ""}`}
                onClick={() => setActiveTab("prescriptions")}
              >
                <span className="nav-icon">💊</span>
                <span>Prescriptions</span>
                {patientData.prescriptions && patientData.prescriptions.length > 0 && (
                  <span className="nav-badge">{patientData.prescriptions.length}</span>
                )}
              </button>
              
              <button 
                className={`nav-item ${activeTab === "labReports" ? "active" : ""}`}
                onClick={() => setActiveTab("labReports")}
              >
                <span className="nav-icon">🔬</span>
                <span>Lab Reports</span>
                {patientData.labReports && patientData.labReports.length > 0 && (
                  <span className="nav-badge">{patientData.labReports.length}</span>
                )}
              </button>
              
              <button 
                className={`nav-item ${activeTab === "doctor" ? "active" : ""}`}
                onClick={() => setActiveTab("doctor")}
              >
                <span className="nav-icon">👨‍⚕️</span>
                <span>My Doctor</span>
              </button>
            </div>

            <div className="sidebar-footer">
              <div className="emergency-contact">
                <p>Emergency Contact</p>
                <strong>+1 (555) 123-HELP</strong>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="main-content">
              {activeTab === "profile" && <PatientProfile patient={patientData} />}
              {activeTab === "appointments" && (
                <Appointments
                  patientData={patientData}
                  token={token}
                  refreshData={fetchPatientData}
                />
              )}
              {activeTab === "prescriptions" && (
                <Prescriptions prescriptions={patientData.prescriptions || []} />
              )}
              {activeTab === "labReports" && (
                <LabReports labReports={patientData.labReports || []} />
              )}
              {activeTab === "doctor" && patientData.assignedDoctor && (
                <AssignedDoctor doctor={patientData.assignedDoctor} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;