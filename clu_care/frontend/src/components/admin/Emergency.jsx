import React, { useState, useEffect } from 'react';
import { FaAmbulance, FaUserMd, FaExclamationTriangle, FaProcedures, FaBed } from 'react-icons/fa';

const Emergency = () => {
  const [emergencyCases, setEmergencyCases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [availableBeds, setAvailableBeds] = useState({});
  const [formData, setFormData] = useState({
    patientName: '',
    condition: '',
    location: '',
    priority: 'medium',
    description: '',
    assignedDoctor: '',
    criticalWard: '',
    bedNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Fetch emergency cases, doctors, and wards on component mount
  useEffect(() => {
    fetchEmergencyCases();
    fetchDoctors();
    fetchWards();
  }, []);

  const fetchEmergencyCases = async () => {
    try {
      const response = await fetch('/api/emergency');
      const data = await response.json();
      setEmergencyCases(data);
    } catch (error) {
      console.error('Error fetching emergency cases:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors?available=true');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await fetch('/api/wards');
      const data = await response.json();
      setWards(data);
      
      // Fetch available beds for each ward
      const bedsData = {};
      for (const ward of data) {
        const bedResponse = await fetch(`/api/wards/${ward._id}/available-beds`);
        const bedData = await bedResponse.json();
        bedsData[ward._id] = bedData.availableBeds;
      }
      setAvailableBeds(bedsData);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  // Automatically suggest doctors and wards based on condition
  useEffect(() => {
    if (formData.condition) {
      const specialty = getSpecialtyFromCondition(formData.condition);
      const suitableDoctors = doctors.filter(doctor => 
        doctor.department.toLowerCase().includes(specialty.toLowerCase())
      );
      
      // Find appropriate ward based on specialty
      const suitableWard = wards.find(ward => 
        ward.specialty && ward.specialty.toLowerCase() === specialty.toLowerCase()
      );
      
      if (suitableDoctors.length > 0 && !formData.assignedDoctor) {
        setFormData(prev => ({
          ...prev,
          assignedDoctor: suitableDoctors[0]._id
        }));
      }
      
      if (suitableWard && !formData.criticalWard) {
        setFormData(prev => ({
          ...prev,
          criticalWard: suitableWard._id
        }));
        
        // Check if ward has available beds
        if (availableBeds[suitableWard._id] <= 0) {
          setSuccess(`Warning: ${suitableWard.name} is full. Please select another ward.`);
          setTimeout(() => setSuccess(''), 5000);
        }
      }
    }
  }, [formData.condition, doctors, wards, availableBeds]);

  const getSpecialtyFromCondition = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('heart') || conditionLower.includes('cardio') || 
        conditionLower.includes('chest pain')) {
      return 'cardiology';
    } else if (conditionLower.includes('brain') || conditionLower.includes('neuro') ||
               conditionLower.includes('stroke')) {
      return 'neurology';
    } else if (conditionLower.includes('bone') || conditionLower.includes('fracture') || 
               conditionLower.includes('ortho')) {
      return 'orthopedics';
    } else if (conditionLower.includes('child') || conditionLower.includes('pediatric')) {
      return 'pediatrics';
    } else if (conditionLower.includes('preg') || conditionLower.includes('birth') || 
               conditionLower.includes('obstetrics') || conditionLower.includes('labor')) {
      return 'maternity';
    } else if (conditionLower.includes('burn') || conditionLower.includes('fire')) {
      return 'burn';
    } else if (conditionLower.includes('infectious') || conditionLower.includes('covid') ||
               conditionLower.includes('isolation')) {
      return 'isolation';
    } else if (conditionLower.includes('critical') || conditionLower.includes('icu')) {
      return 'icu';
    }
    
    return 'general';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Get ward name from selected ward ID
          criticalWard: wards.find(w => w._id === formData.criticalWard)?.name
        }),
      });
      
      if (response.ok) {
        setSuccess('Emergency case created successfully!');
        setFormData({
          patientName: '',
          condition: '',
          location: '',
          priority: 'medium',
          description: '',
          assignedDoctor: '',
          criticalWard: '',
          bedNumber: ''
        });
        fetchEmergencyCases();
        fetchWards(); // Refresh ward data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('Failed to create emergency case');
      }
    } catch (error) {
      console.error('Error creating emergency case:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveCase = async (caseId) => {
    try {
      const response = await fetch(`/api/emergency/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'resolved' }),
      });
      
      if (response.ok) {
        setSuccess('Case resolved successfully!');
        fetchEmergencyCases();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error resolving case:', error);
    }
  };

  // Filter wards based on priority and condition
const getFilteredWards = () => {
  if (!wards || !Array.isArray(wards)) {
    return []; // always return an array
  }

  return wards.filter(ward => ward.availableBeds > 0);
};


  return (
    <div className="emergency-management">
      <div className="emergency-header">
        <h1><FaAmbulance /> Emergency Department</h1>
        <p>Manage emergency cases and assign critical care</p>
      </div>
      
      <div className="emergency-content">
        <div className="emergency-form-section">
          <h2><FaExclamationTriangle /> New Emergency Case</h2>
          
          <form onSubmit={handleSubmit} className="emergency-form">
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Condition *</label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Chest pain, Fracture, Head injury"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Where was the patient found?"
                />
              </div>
              
              <div className="form-group">
                <label>Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Detailed description of symptoms and situation"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Critical Ward <FaBed /></label>
                <select
                  name="criticalWard"
                  value={formData.criticalWard}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a ward</option>
                  {getFilteredWards().map(ward => (
                    <option 
                      key={ward._id} 
                      value={ward._id}
                      disabled={availableBeds[ward._id] <= 0}
                    >
                      {ward.name} ({ward.specialty}) - 
                      {availableBeds[ward._id] <= 0 ? ' FULL' : ` ${availableBeds[ward._id]} beds available`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Assign Doctor <FaUserMd /></label>
                <select
                  name="assignedDoctor"
                  value={formData.assignedDoctor}
                  onChange={handleInputChange}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} - {doctor.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Processing...' : 'Create Emergency Case'}
            </button>
          </form>
          
          {success && (
            <div className={success.includes('Warning') ? "warning-message" : "success-message"}>
              {success}
            </div>
          )}
        </div>
        
        <div className="emergency-list-section">
          <h2><FaProcedures /> Active Emergency Cases</h2>
          
          {emergencyCases.filter(c => c.status !== 'resolved').length === 0 ? (
            <p className="no-cases">No active emergency cases</p>
          ) : (
            <div className="cases-grid">
              {emergencyCases
                .filter(caseItem => caseItem.status !== 'resolved')
                .map(caseItem => (
                <div key={caseItem._id} className={`case-card priority-${caseItem.priority}`}>
                  <div className="case-header">
                    <h3>{caseItem.patientName}</h3>
                    <span className={`priority-badge ${caseItem.priority}`}>
                      {caseItem.priority}
                    </span>
                  </div>
                  
                  <div className="case-details">
                    <p><strong>Condition:</strong> {caseItem.condition}</p>
                    <p><strong>Location:</strong> {caseItem.location}</p>
                    <p><strong>Ward:</strong> {caseItem.criticalWard || 'Not assigned'}</p>
                    
                    {caseItem.description && (
                      <p><strong>Description:</strong> {caseItem.description}</p>
                    )}
                    
                    {caseItem.assignedDoctor && (
                      <p><strong>Doctor:</strong> {
                        doctors.find(d => d._id === caseItem.assignedDoctor)?.name || 
                        'Doctor assigned'
                      }</p>
                    )}
                    
                    <p><strong>Received:</strong> {new Date(caseItem.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="case-actions">
                    <button 
                      onClick={() => resolveCase(caseItem._id)}
                      className="resolve-btn"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;