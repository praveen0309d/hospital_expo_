import React, { useEffect, useState } from "react";
import './Prescription.css'
import API_URL from "../../services/api";
const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const token = localStorage.getItem("authToken");

    if (!user || !user.patientId) {
      setError("No patient ID found in localStorage");
      setLoading(false);
      return;
    }

    const fetchPrescriptions = async () => {
      try {
        const res = await fetch(
          `${API_URL}/mypatient/${user.patientId}/prescriptions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch prescriptions (${res.status})`);
        }

        const data = await res.json();
        // ✅ FIX: backend already returns an array
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) return <p>Loading prescriptions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

return (
    <div className="prescriptions-container">
      <h2 className="prescriptions-title">My Prescriptions</h2>

      {prescriptions.length === 0 ? (
        <p className="no-prescriptions">No prescriptions found.</p>
      ) : (
        <div className="prescriptions-grid">
          {prescriptions.map((pres, idx) => (
            <div key={idx} className="prescription-card cool">
              <span className="prescription-date">
                {new Date(pres.date).toLocaleDateString()}
              </span>
              
              <div className="prescription-header">
                <h3 className="prescription-title">Prescription #{idx + 1}</h3>
                {pres.doctorName && (
                  <p className="prescription-doctor">Prescribed by: {pres.doctorName}</p>
                )}
              </div>

<div className="medicine-list">
  {(pres.medicines || pres.medications || []).map((med, medIndex) => (
    <div key={medIndex} className="medicine-item">
      <span className="medicine-name">{med.name}</span>
      <span className="medicine-details">
        {med.dosage || med.dose} • {med.time || med.frequency}
      </span>
    </div>
  ))}
</div>

              {pres.instructions && (
                <div className="instructions">
                  <strong>Instructions:</strong> {pres.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
