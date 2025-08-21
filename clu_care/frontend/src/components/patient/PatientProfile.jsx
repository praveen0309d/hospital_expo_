import React from "react";
import './PatientProfile.css'
const PatientProfile = ({ patient }) => {
  if (!patient) return <div className="profile-error">No profile data available.</div>;

  // Get status color based on patient status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'stable': return '#10B981';
      case 'critical': return '#EF4444';
      case 'recovering': return '#F59E0B';
      case 'observation': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
        </div>
        <div className="profile-title">
          <h2>{patient.name}</h2>
          <p>Patient Profile</p>
        </div>
        <div 
          className="profile-status"
          style={{ backgroundColor: getStatusColor(patient.status) }}
        >
          {patient.status || 'Unknown Status'}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Patient ID</span>
              <span className="info-value">{patient.patientId || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{patient.age || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{patient.gender || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{patient.type || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Medical Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Medical Specialty</span>
              <span className="info-value">{patient.medicalSpecialty || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ward Number</span>
              <span className="info-value">{patient.wardNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cart Number</span>
              <span className="info-value">{patient.cartNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Admission Date</span>
              <span className="info-value">{patient.admissionDate || 'N/A'}</span>
            </div>
          </div>
        </div>

        {patient.bloodGroup && (
          <div className="profile-section">
            <h3>Health Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Blood Group</span>
                <span className="info-value">{patient.bloodGroup}</span>
              </div>
              {patient.allergies && (
                <div className="info-item">
                  <span className="info-label">Allergies</span>
                  <span className="info-value">{patient.allergies}</span>
                </div>
              )}
              {patient.conditions && (
                <div className="info-item">
                  <span className="info-label">Medical Conditions</span>
                  <span className="info-value">{patient.conditions}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {patient.contact && (
          <div className="profile-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              {patient.contact.phone && (
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{patient.contact.phone}</span>
                </div>
              )}
              {patient.contact.email && (
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{patient.contact.email}</span>
                </div>
              )}
              {patient.contact.address && (
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">{patient.contact.address}</span>
                </div>
              )}
              {patient.contact.emergencyContact && (
                <div className="info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">{patient.contact.emergencyContact}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PatientProfile;