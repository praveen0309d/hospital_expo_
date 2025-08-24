const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper function to read patients data
const readPatientsData = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/patients.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading patients data:', error);
    return [];
  }
};

// Validate patient ID endpoint
router.get('/validate/:patientId', (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patients = readPatientsData();
    const patient = patients.find(p => p.patientId === patientId);
    
    if (patient) {
      res.json({
        valid: true,
        patient: {
          name: patient.name,
          patientId: patient.patientId,
          wardNumber: patient.wardNumber,
          cartNumber: patient.cartNumber,
          assignedDoctor: patient.assignedDoctor,
          medicalSpecialty: patient.medicalSpecialty,
          status: patient.status,
          type: patient.type,
          bloodGroup: patient.bloodGroup
        }
      });
    } else {
      res.status(404).json({
        valid: false,
        message: 'Patient ID not found in our records'
      });
    }
  } catch (error) {
    console.error('Error validating patient:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get patient details endpoint (optional)
router.get('/:patientId', (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patients = readPatientsData();
    const patient = patients.find(p => p.patientId === patientId);
    
    if (patient) {
      res.json({
        success: true,
        patient: patient
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;