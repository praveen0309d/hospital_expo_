import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoctorDashboard.css";
import API_URL from "../../services/api";

// Import tab components (you'll need to create these)
import DoctorProfile from "../../components/doctor/DoctorProfile";
import Appointments from "../../components/doctor/Appointments.jsx";
import PatientReports from "../../components/doctor/PatientReports";
import AddPrescription from "../../components/doctor/Prescriptions.jsx";
// import OtherFeatures from "./OtherFeatures";

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState(3); // Example notification count

  const doctorId = localStorage.getItem("userId");

  useEffect(() => {
    if (!doctorId) {
      setError("Doctor ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/staff/${doctorId}`
        );
        setDoctor(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch doctor data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleToggleStatus = async () => {
    if (!doctor) return;

    const newStatus = doctor.status === "active" ? "inactive" : "active";

    try {
      await axios.put(
        `${API_URL}/api/staff/${doctorId}/status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );

      setDoctor((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };



  if (loading) return <div className="dashboard-loading">Loading doctor profile...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!doctor) return <div className="dashboard-error">No doctor data found</div>;

  return (
    <div className="doctor-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome, Dr. {doctor.name}</h1>
            <p className="welcome-message">Your patient care dashboard</p>
          </div>
          
          <div className="header-actions">
            <div className="status-toggle">
              <span className={`status-indicator ${doctor.status}`}>
                {doctor.status === "active" ? "🟢 Online" : "🔴 Offline"}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={doctor.status === "active"}
                  onChange={handleToggleStatus}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="doctor-avatar">
              {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="doctor-info">
              <h3>Dr. {doctor.name}</h3>
              <p>{doctor.specialization}</p>
              <p className="department">{doctor.department}</p>
            </div>
          </div>

          <div className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <span className="nav-icon">👤</span>
              Profile
            </button>
            
            <button 
              className={`nav-item ${activeTab === "appointments" ? "active" : ""}`}
              onClick={() => setActiveTab("appointments")}
            >
              <span className="nav-icon">📅</span>
              Appointments
              <span className="nav-badge">5</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "patientReports" ? "active" : ""}`}
              onClick={() => setActiveTab("patientReports")}
            >
              <span className="nav-icon">📊</span>
              Patient Reports
            </button>
            
            <button 
              className={`nav-item ${activeTab === "addPrescription" ? "active" : ""}`}
              onClick={() => setActiveTab("addPrescription")}
            >
              <span className="nav-icon">💊</span>
              Add Prescription
            </button>
            
            {/* <button 
              className={`nav-item ${activeTab === "others" ? "active" : ""}`}
              onClick={() => setActiveTab("others")}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button> */}
          </div>

          <div className="sidebar-footer">
            <div className="emergency-contact">
              <p>Emergency Contact</p>
              <strong>+1 (555) 123-HELP</strong>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="dashboard-main">
          <div className="main-content">
            {activeTab === "profile" && <DoctorProfile doctor={doctor} />}
            {activeTab === "appointments" && <Appointments doctorId={doctorId} />}
            {activeTab === "patientReports" && <PatientReports doctorId={doctorId} />}
            {activeTab === "addPrescription" && <AddPrescription doctorId={doctorId} />}
            {/* {activeTab === "others" && <OtherFeatures />} */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;