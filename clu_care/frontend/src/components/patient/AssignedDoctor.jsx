import React from "react";
import "./AssignedDoctor.css";

const AssignedDoctor = ({ doctor }) => {
  if (!doctor) return <div className="no-doctor">No assigned doctor.</div>;

  return (
    <div className="assigned-doctor-container">
      <div className="doctor-card">
        <div className="doctor-header">
          <h2 className="doctor-name">{doctor.name}</h2>
          <p className="doctor-title">Your Primary Care Physician</p>
        </div>
        
        <div className="doctor-details">
          <div className="detail-item">
            <div className="detail-icon">📧</div>
            <div className="detail-content">
              <p className="detail-label">Email</p>
              <p className="detail-value email">{doctor.email}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">🏥</div>
            <div className="detail-content">
              <p className="detail-label">Department</p>
              <p className="detail-value">{doctor.department}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">🎯</div>
            <div className="detail-content">
              <p className="detail-label">Specialization</p>
              <p className="detail-value">{doctor.specialization}</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AssignedDoctor;