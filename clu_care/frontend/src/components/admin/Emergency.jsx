import React, { useState, useEffect } from 'react';
import './Emergency.css';
import api from '../../services/api';

const Emergency = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    medicalSpecialty: '',
    assignedDoctor: '',
    wardNumber: '',
    cartNumber: ''
  });

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch available doctors for selected specialty
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.medicalSpecialty) {
        setAvailableDoctors([]);
        return;
      }
      try {
        const res = await api.get(`http://localhost:5000/staff/available?specialty=${formData.medicalSpecialty}`);
        setAvailableDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [formData.medicalSpecialty]);

  useEffect(() => {
    fetchPatients();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const patientData = {
        ...formData,
        type: 'IPD', // Default to Inpatient for emergency
        assignedDoctor: selectedDoctor?._id || null,
        status: 'admitted'
      };

      await api.post('/patients', patientData);
      
      // Reset form and close
      setShowAddForm(false);
      setFormData({
        name: '',
        age: '',
        gender: 'male',
        medicalSpecialty: '',
        assignedDoctor: '',
        wardNumber: '',
        cartNumber: ''
      });
      setSelectedDoctor(null);
      
      // Refresh patient list
      fetchPatients();
      alert('Patient added successfully!');
    } catch (err) {
      console.error('Error adding patient:', err);
      alert('Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.patientId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="emergency-container">
      <h2>Emergency Department - Patient Overview</h2>
      
      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)} 
          className="add-patient-btn emergency-btn"
        >
          + Add New Patient
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : (
        <table className="emergency-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Specialist</th>
              <th>Doctor</th>
              <th>Ward</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.medicalSpecialty || 'Not specified'}</td>
                  <td>{p.assignedDoctorName || p.assignedDoctor?.name || 'Unassigned'}</td>
                  <td>{p.wardNumber || '-'}</td>
                  <td>{p.cartNumber || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No patients found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add Patient Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content emergency-modal">
            <div className="modal-header">
              <h3>Add New Emergency Patient</h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="emergency-form">
              <div className="form-row">
                <div className="emg_form">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="emg_form">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="emg_form">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="emg_form">
                  <label>Specialty *</label>
                  <select
                    name="medicalSpecialty"
                    value={formData.medicalSpecialty}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {departments.map(d => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="emg_form">
                  <label>Assigned Doctor</label>
                  <select
                    value={selectedDoctor?._id || ''}
                    onChange={(e) => {
                      const doc = availableDoctors.find(d => d._id === e.target.value);
                      setSelectedDoctor(doc || null);
                    }}
                  >
                    <option value="">Select Doctor</option>
                    {availableDoctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="emg_form">
                  <label>Ward Number</label>
                  <input
                    type="text"
                    name="wardNumber"
                    value={formData.wardNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="emg_form">
                  <label>Room/Cart Number</label>
                  <input
                    type="text"
                    name="cartNumber"
                    value={formData.cartNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;