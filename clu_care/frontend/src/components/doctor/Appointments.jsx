import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaFilter
} from "react-icons/fa";
import "./Appointments.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const doctorId = localStorage.getItem("userId");

  // Fetch appointments for this doctor
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) {
        setError("Doctor ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/appointments/${doctorId}`
        );
        setAppointments(response.data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setError("Failed to fetch appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  // Update appointment status
  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      );

      // Update UI immediately
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === appointmentId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error("Failed to update appointment status", err);
      alert("Failed to update appointment status");
    }
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "approved": return "status-approved";
      case "pending": return "status-pending";
      case "cancelled": return "status-cancelled";
      case "completed": return "status-completed";
      default: return "status-pending";
    }
  };

  if (loading) return (
    <div className="appointments-loading">
      <FaSpinner className="spinner" />
      <p>Loading appointments...</p>
    </div>
  );

  if (error) return (
    <div className="appointments-error">
      <FaExclamationTriangle />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>
          <FaCalendarAlt className="header-icon" />
          My Appointments
        </h2>
        <p>Manage and track your patient appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <FaFilter /> All Appointments
        </button>
        <button 
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved
        </button>
        <button 
          className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
        <button 
          className={`filter-tab ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {/* Appointments Count */}
      <div className="appointments-stats">
        <div className="stat-card">
          <span className="stat-number">{appointments.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">
            {appointments.filter(a => a.status === "pending").length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-number">
            {appointments.filter(a => a.status === "approved").length}
          </span>
          <span className="stat-label">Approved</span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt size={48} />
            <h3>No Appointments Found</h3>
            <p>{filter === "all" 
              ? "You don't have any appointments yet." 
              : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="patient-info">
                  <h3>
                    <FaUser className="info-icon" />
                    Patient ID: {appointment.patientId}
                  </h3>
                  {appointment.patientName && (
                    <p className="patient-name">{appointment.patientName}</p>
                  )}
                </div>
                <div className={`status-badge ${getStatusClass(appointment.status)}`}>
                  {appointment.status}
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span>
                    {new Date(appointment.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {appointment.description && (
                  <div className="detail-item">
                    <p className="appointment-description">
                      <strong>Reason:</strong> {appointment.description}
                    </p>
                  </div>
                )}
              </div>

<div className="appointment-actions-container">
  {appointment.status === "pending" && (
    <>
      <button
        className="appointment-approve-button"
        onClick={() => handleAppointmentStatus(appointment._id, "approved")}
      >
        <FaCheck /> Approve
      </button>
      <button
        className="appointment-cancel-button"
        onClick={() => handleAppointmentStatus(appointment._id, "cancelled")}
      >
        <FaTimes /> Cancel
      </button>
    </>
  )}
  
  {appointment.status === "approved" && (
    <button
      className="appointment-complete-button"
      onClick={() => handleAppointmentStatus(appointment._id, "completed")}
    >
      <FaCheck /> Mark Complete
    </button>
  )}

  <button
    className="appointment-details-button"
    onClick={() => setSelectedAppointment(appointment)}
  >
    <FaEye /> Details
  </button>
</div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Patient Information</h4>
                <p><strong>Patient ID:</strong> {selectedAppointment.patientId}</p>
                {selectedAppointment.patientName && (
                  <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Appointment Details</h4>
                <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedAppointment.date).toLocaleTimeString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${getStatusClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>

              {selectedAppointment.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedAppointment.description}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedAppointment.status === "pending" && (
                <>
                  <button
                    className="action-btn approve-btn"
                    onClick={() => {
                      handleAppointmentStatus(selectedAppointment._id, "approved");
                      setSelectedAppointment(null);
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="action-btn cancel-btn"
                    onClick={() => {
                      handleAppointmentStatus(selectedAppointment._id, "cancelled");
                      setSelectedAppointment(null);
                    }}
                  >
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;