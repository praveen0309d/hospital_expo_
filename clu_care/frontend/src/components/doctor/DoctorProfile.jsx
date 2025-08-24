import React, { useEffect, useState } from "react";
import axios from "axios";

import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaHospital, 
  FaStethoscope, 
  FaGraduationCap, 
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaSpinner
} from "react-icons/fa";
import "./DoctorProfile.css";

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const doctorId = localStorage.getItem("userId");

  useEffect(() => {
    if (!doctorId) {
      setError("Doctor ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/staff/${doctorId}`);
        setDoctor(response.data);
      } catch (err) {
        console.error("Failed to fetch doctor data:", err);
        setError("Failed to fetch doctor data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleToggleStatus = async () => {
    if (!doctor || updating) return;

    const newStatus = doctor.status === "active" ? "inactive" : "active";
    setUpdating(true);

    try {
      await axios.put(
        `http://localhost:5000/api/staff/${doctorId}/status`,
        { status: newStatus },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          } 
        }
      );

      setDoctor((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="doctor-profile-loading">
      <FaSpinner className="loading-spinner" />
      <p>Loading doctor profile...</p>
    </div>
  );

  if (error) return (
    <div className="doctor-profile-error">
      <div className="error-icon">⚠️</div>
      <h3>Error Loading Profile</h3>
      <p>{error}</p>
      <button 
        className="retry-btn"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );

  if (!doctor) return (
    <div className="doctor-profile-error">
      <div className="error-icon">👨‍⚕️</div>
      <h3>No Doctor Data Found</h3>
      <p>Unable to load your profile information.</p>
    </div>
  );

  return (
    <div className="doctor-profile-container">

      <div className="profile-content">
        {/* Profile Card */}


        {/* Details Card */}
        <div className="details-card">
          <h3 className="details-title">
            <FaUser className="details-icon" />
            Personal Information
          </h3>

          <div className="details-grid">
            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <label>Email Address</label>
                <p>{doctor.email || "Not provided"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaPhone className="detail-icon" />
              <div className="detail-content">
                <label>Phone Number</label>
                <p>{doctor.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaHospital className="detail-icon" />
              <div className="detail-content">
                <label>Department</label>
                <p>{doctor.department || "Not specified"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaStethoscope className="detail-icon" />
              <div className="detail-content">
                <label>Specialization</label>
                <p>{doctor.specialization || "Not specified"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaGraduationCap className="detail-icon" />
              <div className="detail-content">
                <label>Qualifications</label>
                <p>{doctor.qualifications || "Not provided"}</p>
              </div>
            </div>

            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-content">
                <label>Join Date</label>
                <p>{formatDate(doctor.joinDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="additional-info-card">
          <h3 className="additional-info-title">Additional Information</h3>
          <div className="additional-info-content">
            <p>
              Your profile information is used to help patients find and connect with you. 
              Keep your availability status updated to receive appointment requests.
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;