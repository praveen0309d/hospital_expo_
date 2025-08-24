import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaPlus, FaPrint, FaEye, FaFileMedical, FaTimes } from "react-icons/fa";
import "./ViewPrescriptions.css";

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/all-prescriptions");
        if (!res.ok) throw new Error("Failed to fetch prescriptions");
        const data = await res.json();
        setPrescriptions(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching prescriptions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Filter prescriptions by patient name or ID
  const filteredPrescriptions = prescriptions.filter(
    (pres) =>
      pres.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.patientId?.toString().includes(searchTerm)
  );

  // Print single patient prescription
  const handlePrint = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Use setTimeout to ensure state update happens before printing
    setTimeout(() => {
      const printContent = printRef.current;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reload after a short delay to ensure print completes
      setTimeout(() => window.location.reload(), 100);
    }, 100);
  };

  // View prescription details
  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
  };

  if (loading) return <div className="loading">Loading prescriptions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="prescriptions-container">
      {/* Hidden print content */}
      <div ref={printRef} style={{ display: 'none' }}>
        {selectedPrescription && (
          <div className="prescription-print">
            <div className="print-header">
              <h2>Medical Prescription</h2>
              <div className="clinic-info">
                <h3>Healthcare Clinic</h3>
                <p>123 Medical Center Drive</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
            
            <div className="print-patient-info">
              <div className="patient-details">
                <p><strong>Patient ID:</strong> {selectedPrescription.patientId}</p>
                <p><strong>Name:</strong> {selectedPrescription.patientName}</p>
                <p><strong>Date:</strong> {selectedPrescription.date}</p>
              </div>
              <div className="doctor-details">
                <p><strong>Prescribing Doctor:</strong> {selectedPrescription.doctorName || "Dr. Smith"}</p>
                <p><strong>License No:</strong> MED123456</p>
              </div>
            </div>

            <div className="print-medicines">
              <h4>Medication Prescribed</h4>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Instructions</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription.medicines?.map((med, i) => {
                    // Handle both string and object formats
                    if (typeof med === 'string') {
                      const parts = med.split(' - ');
                      return (
                        <tr key={i}>
                          <td>{parts[0] || med}</td>
                          <td>{parts[1] || 'As prescribed'}</td>
                          <td>{parts[2] || 'Take as directed'}</td>
                          <td>{parts[3] || '7 days'}</td>
                        </tr>
                      );
                    } else {
                      // Handle object format
                      return (
                        <tr key={i}>
                          <td>{med.name || 'Unknown'}</td>
                          <td>{med.dosage || 'As prescribed'}</td>
                          <td>{med.time || 'Take as directed'}</td>
                          <td>{med.duration || '7 days'}</td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            <div className="print-footer">
              <div className="doctor-signature">
                <p>_________________________</p>
                <p>Dr. {selectedPrescription.doctorName || "Smith"}<br />
                License No: MED123456<br />
                Date: {selectedPrescription.date}</p>
              </div>
              <div className="total-price">
                <p><strong>Total: ₹{selectedPrescription.totalPrice || '0.00'}</strong></p>
              </div>
            </div>

            <div className="print-notes">
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>Take medication as prescribed</li>
                <li>Complete the full course unless otherwise directed</li>
                <li>Contact your doctor if side effects occur</li>
                <li>Store medications in a cool, dry place</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="prescriptions-header">
        <h1>
          <FaFileMedical className="header-icon" />
          Prescription Management
        </h1>
        <p>View and manage all patient prescriptions</p>
      </div>

      <div className="prescriptions-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Patient ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="add-button"
          onClick={() => window.location.href = "/add-prescription"}
        >
          <FaPlus className="button-icon" />
          Add Prescription
        </button>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="no-prescriptions">
          <FaFileMedical size={48} />
          <h3>No Prescriptions Found</h3>
          <p>{searchTerm ? "No prescriptions match your search criteria." : "There are no prescriptions in the system yet."}</p>
        </div>
      ) : (
        <div className="prescriptions-table-container">
          <table className="prescriptions-table">
            <thead>
              <tr>
                <th>Prescription #</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Medications</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((pres, index) => (
                <tr key={index} className="prescription-row">
                  <td className="prescription-number">{pres.prescriptionNumber || `PR-${index + 1}`}</td>
                  <td className="patient-id">{pres.patientId}</td>
                  <td className="patient-name">{pres.patientName}</td>
                  <td className="doctor-name-view">{pres.doctorName || "-"}</td>
                  {/* <td className="prescription-date">{pres.date}</td> */}
                  <td className="medications">
                    <div className="medications-list">
                      {pres.medicines.slice(0, 2).map((med, i) => {
                        const medicineName = typeof med === 'string' ? med.split(' - ')[0] : med.name;
                        return (
                          <span key={i} className="medication-tag">
                            {medicineName}
                          </span>
                        );
                      })}
                      {pres.medicines.length > 2 && (
                        <span className="more-meds">+{pres.medicines.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="total-price">₹{pres.totalPrice || '0.00'}</td>
                  <td className="actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetails(pres)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="print-btn"
                      onClick={() => handlePrint(pres)}
                      title="Print Prescription"
                    >
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prescription Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedPrescription(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Patient Information</h4>
                <p><strong>ID:</strong> {selectedPrescription.patientId}</p>
                <p><strong>Name:</strong> {selectedPrescription.patientName}</p>
                <p><strong>Date:</strong> {selectedPrescription.date}</p>
              </div>
              
              <div className="detail-section">
                <h4>Prescribing Doctor</h4>
                <p>{selectedPrescription.doctorName || "Not specified"}</p>
              </div>

              <div className="detail-section">
                <h4>Medications</h4>
                <ul className="medications-detail">
                  {selectedPrescription.medicines.map((med, i) => {
                    if (typeof med === 'string') {
                      return <li key={i}>{med}</li>;
                    } else {
                      return (
                        <li key={i}>
                          <strong>{med.name}</strong> - {med.dosage} - {med.time} {med.duration && `- ${med.duration}`}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>

              {selectedPrescription.totalPrice && (
                <div className="detail-section">
                  <h4>Total Price: ₹{selectedPrescription.totalPrice}</h4>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="print-modal-btn"
                onClick={() => handlePrint(selectedPrescription)}
              >
                <FaPrint /> Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPrescriptions;