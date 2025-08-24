import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Prescriptions.css";

function Prescriptions() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [expandedPatients, setExpandedPatients] = useState({});

  // Predefined dropdown data
  const medicineOptions = [
    "Paracetamol", "Amoxicillin", "Cetirizine", "Vitamin D3",
    "Ibuprofen", "Azithromycin", "Loratadine", "Calcium",
    "Metformin", "Atorvastatin", "Aspirin", "Omeprazole"
  ];

  const timeOptions = [
    "Before breakfast", "After breakfast", "Before lunch",
    "After lunch", "Before dinner", "After dinner",
    "At bedtime", "As needed"
  ];

  const dosageOptions = [
    "1 tablet", "2 tablets", "1/2 tablet", "1 capsule",
    "5ml", "10ml", "15ml", "As directed"
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const doctorData = JSON.parse(localStorage.getItem("userData"));
        const doctorId = doctorData?._id;
        if (!doctorId) {
          setError("Doctor ID not found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://127.0.0.1:5000/api/patients/by-doctor/${doctorId}`
        );
        setPatients(res.data || []); // Ensure it's always an array
      } catch (err) {
        console.error(err);
        setError("Error fetching patients data");
        setPatients([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const togglePatientExpansion = (patientId) => {
    setExpandedPatients(prev => ({
      ...prev,
      [patientId]: !prev[patientId]
    }));
  };

  const handleMedicineChange = (patientId, field, value, index = 0) => {
    setFormData((prev) => {
      const patientForm = prev[patientId] || { medicines: [{}], date: new Date().toISOString().split('T')[0] };
      let medicines = [...patientForm.medicines];
      medicines[index] = { ...medicines[index], [field]: value };
      return { ...prev, [patientId]: { ...patientForm, medicines } };
    });
  };

  const handleAddMedicineRow = (patientId) => {
    setFormData((prev) => {
      const patientForm = prev[patientId] || { medicines: [{}], date: new Date().toISOString().split('T')[0] };
      return {
        ...prev,
        [patientId]: {
          ...patientForm,
          medicines: [...patientForm.medicines, {}]
        }
      };
    });
  };

  const handleRemoveMedicineRow = (patientId, index) => {
    setFormData((prev) => {
      const patientForm = prev[patientId];
      if (!patientForm || patientForm.medicines.length <= 1) return prev;
      
      const medicines = patientForm.medicines.filter((_, i) => i !== index);
      return { ...prev, [patientId]: { ...patientForm, medicines } };
    });
  };

  const handleDateChange = (patientId, value) => {
    setFormData((prev) => {
      const patientForm = prev[patientId] || { medicines: [{}], date: value };
      return { ...prev, [patientId]: { ...patientForm, date: value } };
    });
  };

  const handleSubmit = async (patientId) => {
    try {
      const data = formData[patientId];
      if (!data || !data.date || data.medicines.some(med => !med.name || !med.dosage || !med.time)) {
        alert("Please fill all required fields for each medicine");
        return;
      }

      const res = await axios.post(
        `http://127.0.0.1:5000/api/patients/${patientId}/prescriptions`,
        data
      );
      
      alert("Prescription added successfully!");
      
      // Update local state
      setPatients((prev) =>
        prev.map((p) =>
          p._id === patientId
            ? { ...p, prescriptions: [...(p.prescriptions || []), res.data.prescription] }
            : p
        )
      );
      
      // Reset form for this patient
      setFormData((prev) => ({ 
        ...prev, 
        [patientId]: { medicines: [{}], date: new Date().toISOString().split('T')[0] } 
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to add prescription");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="prescriptions-container">
        <div className="prescriptions-loading">
          <div className="loading-spinner"></div>
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="prescriptions-container">
        <div className="prescriptions-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No patients state
  if (!patients || patients.length === 0) {
    return (
      <div className="prescriptions-container">
        <div className="no-patients">
          <h2>No Patients Found</h2>
          <p>You don't have any patients assigned to you yet.</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="prescriptions-container">
      <div className="prescriptions-header">
        <h1>Patient Prescriptions</h1>
        <p>Manage and create prescriptions for your patients</p>
      </div>

      <div className="patients-list">
        {patients.map((patient) => {
          const patientForm = formData[patient._id] || { 
            medicines: [{}], 
            date: new Date().toISOString().split('T')[0] 
          };
          const isExpanded = expandedPatients[patient._id];

          return (
            <div key={patient._id} className="patient-card">
              <div 
                className="patient-summary"
                onClick={() => togglePatientExpansion(patient._id)}
              >
                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p>ID: {patient.patientId} • {patient.age} years • {patient.gender}</p>
                </div>
                <div className="patient-actions">
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="patient-details">
                  {/* Existing Prescriptions */}
                  <div className="existing-prescriptions">
                    <h4>Existing Prescriptions</h4>
                    {patient.prescriptions && patient.prescriptions.length > 0 ? (
                      <div className="prescriptions-grid">
                        {patient.prescriptions.map((prescription, idx) => (
                          <div key={idx} className="prescription-card">
                            <div className="prescription-header">
                              <span className="prescription-date">
                                {new Date(prescription.date).toLocaleDateString()}
                              </span>
                              <span className="prescription-status">Active</span>
                            </div>
                            <div className="medicines-list">
                              {prescription.medicines && prescription.medicines.map((medicine, mIdx) => (
                                <div key={mIdx} className="medicine-item">
                                  <span className="medicine-name">{medicine.name}</span>
                                  <span className="medicine-details">
                                    {medicine.dosage} • {medicine.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-prescriptions">No prescriptions found</p>
                    )}
                  </div>

                  {/* New Prescription Form */}
                  <div className="new-prescription-form">
                    <h4>Add New Prescription</h4>
                    
                    <div className="form-group">
                      <label>Prescription Date</label>
                      <input
                        type="date"
                        value={patientForm.date}
                        onChange={(e) => handleDateChange(patient._id, e.target.value)}
                        className="date-input"
                      />
                    </div>

                    <div className="medicines-form">
                      <label>Medications</label>
                      {patientForm.medicines.map((medicine, idx) => (
                        <div key={idx} className="medicine-row">
                          <select
                            value={medicine.name || ""}
                            onChange={(e) => handleMedicineChange(patient._id, "name", e.target.value, idx)}
                            className="medicine-select"
                            required
                          >
                            <option value="">Select Medicine</option>
                            {medicineOptions.map((med, i) => (
                              <option key={i} value={med}>{med}</option>
                            ))}
                          </select>

                          <select
                            value={medicine.dosage || ""}
                            onChange={(e) => handleMedicineChange(patient._id, "dosage", e.target.value, idx)}
                            className="dosage-select"
                            required
                          >
                            <option value="">Dosage</option>
                            {dosageOptions.map((dosage, i) => (
                              <option key={i} value={dosage}>{dosage}</option>
                            ))}
                          </select>

                          <select
                            value={medicine.time || ""}
                            onChange={(e) => handleMedicineChange(patient._id, "time", e.target.value, idx)}
                            className="time-select"
                            required
                          >
                            <option value="">Timing</option>
                            {timeOptions.map((time, i) => (
                              <option key={i} value={time}>{time}</option>
                            ))}
                          </select>

                          {patientForm.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(patient._id, idx)}
                              className="remove-medicine-btn"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddMedicineRow(patient._id)}
                        className="add-medicine-btn"
                      >
                        + Add Another Medicine
                      </button>
                    </div>

                    <button
                      onClick={() => handleSubmit(patient._id)}
                      className="submit-prescription-btn"
                    >
                      💊 Submit Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Prescriptions;