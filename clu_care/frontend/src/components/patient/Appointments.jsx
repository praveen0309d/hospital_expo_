import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Appointment.css";
import API_URL from "../../services/api";
const Appointment = () => {
  const [activeTab, setActiveTab] = useState("myAppointments");
  const [departments, setDepartments] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    medicalSpecialty: "",
    doctorId: "",
    date: "",
    description: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("userData"));

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/appointments/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Fetch available doctors when specialty changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.medicalSpecialty) {
        setAvailableDoctors([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/appointments/staff/available?specialty=${formData.medicalSpecialty}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, [formData.medicalSpecialty, token]);

  // Fetch patient's appointments
  const fetchAppointments = async () => {
    if (!user || !user.patientId) return;
    try {
      const res = await axios.get(
        `${API_URL}/appointments/mine/${user.patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchAppointments();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.date) {
      alert("Please select a doctor and date");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/appointments/add`,
        {
          patientId: user.patientId,
          doctorId: formData.doctorId,
          date: formData.date,
          description: formData.description,
          notes: formData.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Appointment requested successfully!");
      
      setFormData({
        medicalSpecialty: "",
        doctorId: "",
        date: "",
        description: "",
        notes: ""
      });
      fetchAppointments(); // refresh the list
      setActiveTab("myAppointments");
    } catch (err) {
      console.error("Error adding appointment:", err);
      alert("Failed to request appointment. Try again.");
    }
  };

  // Function to determine status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "cancelled":
        return "status-cancelled";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    
    <div className="appointment-container">
      
      {/* Sidebar */}
      <nav className="appointment-sidebar">
        <h2>Appointments</h2>
        <button 
          className={`sidebar-btn ${activeTab === "myAppointments" ? "active" : ""}`}
          onClick={() => setActiveTab("myAppointments")}
        >
          My Appointments
        </button>
        <button 
          className={`sidebar-btn ${activeTab === "addAppointment" ? "active" : ""}`}
          onClick={() => setActiveTab("addAppointment")}
        >
          Add Appointment
        </button>
      </nav>

      {/* Main Content */}
      <div className="appointment-content">
        {activeTab === "myAppointments" && (
          <div>
            <h2 className="section-title">My Appointments</h2>
            {appointments.length === 0 ? (
              <p className="no-appointments">No appointments found.</p>
            ) : (
              <div className="appointments-grid">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className={`appointment-status ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </div>
                    <div className="appointment-doctor">{appointment.doctorName}</div>
                    <div className="appointment-department">{appointment.department}</div>
                    <div className="appointment-date">{new Date(appointment.date).toLocaleString()}</div>
                    <div className="appointment-description">{appointment.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "addAppointment" && (
          <div>
            <h2 className="section-title">Request New Appointment</h2>
            <form className="appointment-form" onSubmit={handleSubmit}>
              <div className="patien_form">
                <label htmlFor="medicalSpecialty">Specialty:</label>
                <select
                  id="medicalSpecialty"
                  name="medicalSpecialty"
                  value={formData.medicalSpecialty}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialty</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="patien_form">
                <label htmlFor="doctorId">Doctor:</label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Doctor</option>
                  {availableDoctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="patien_form">
                <label htmlFor="date">Date:</label>
                <input
                  id="date"
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="patien_form">
                <label htmlFor="description">Description:</label>
                <input
                  id="description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="patien_form">
                <label htmlFor="notes">Notes:</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes for the doctor"
                />
              </div>

              <button type="submit" className="submit-btn">Request Appointment</button>
            </form>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Appointment;