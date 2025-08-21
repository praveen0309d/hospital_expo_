import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Tooltip,
  Badge
} from "@mui/material";
import {
  Bed as BedIcon,
  Person as PersonIcon,
  EventAvailable as AvailableIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon
} from "@mui/icons-material";
import axios from "axios";
import "./BedOccupancy.css";

const BedOccupancy = () => {
  const [wards, setWards] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Fetch beds from backend
  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/beds");
        setWards(res.data || []);
      } catch (err) {
        console.error("Error fetching beds:", err);
        setWards([]);
      }
    };
    fetchBeds();
  }, []);

  const handleOpen = (bed, wardName) => {
    setSelectedBed({ ...bed, wardName });
  };

  const handleClose = () => {
    setSelectedBed(null);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // Compute stats
  const totalBeds = wards.reduce((acc, ward) => acc + ward.beds.length, 0);
  const occupiedBeds = wards.reduce(
    (acc, ward) => acc + ward.beds.filter(b => b.status === "Admitted").length,
    0
  );
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="bed-container">
      {/* Header */}
      <div className="header-section">
        <div className="title-section">
          <HospitalIcon fontSize="large" color="primary" />
          <h2>Bed Occupancy Management</h2>
        </div>
        <div className="controls-section">
          <Tooltip title={`Switch to ${viewMode === "grid" ? "List" : "Grid"} view`}>
            <Button 
              variant="outlined" 
              onClick={toggleViewMode}
              startIcon={viewMode === "grid" ? <AvailableIcon /> : <BedIcon />}
            >
              {viewMode === "grid" ? "List View" : "Grid View"}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <Badge badgeContent={totalBeds} color="primary">
            <BedIcon fontSize="large" />
          </Badge>
          <span>Total Beds</span>
        </div>
        <div className="stat-card">
          <Badge badgeContent={occupiedBeds} color="error">
            <PersonIcon fontSize="large" />
          </Badge>
          <span>Occupied</span>
        </div>
        <div className="stat-card">
          <Badge badgeContent={availableBeds} color="success">
            <AvailableIcon fontSize="large" />
          </Badge>
          <span>Available</span>
        </div>
      </div>

      {/* Wards */}
      {wards.map((ward) => (
         <div key={ward._id} className="ward-card">
<h3>{ward.specialty.charAt(0).toUpperCase() + ward.specialty.slice(1)}</h3>
  {/* instead of ward.name */}
    <p>Total Beds: {ward.beds.length}</p>

          {viewMode === "grid" ? (
            <div className="bed-grid">
              {ward.beds.map((bed) => (
                <div
                  key={`${ward._id}-${bed.bedNumber}`}
                  className={`bed-box ${bed.status === "Available" ? "available" : "occupied"}`}
                  onClick={() => handleOpen(bed, ward.name)}
                >
                  <div className="bed-number">
                    <BedIcon /> {bed.bedNumber}
                  </div>
                  <div className="bed-status">
                    {bed.status === "Available" ? (
                      <span className="available-text">Available</span>
                    ) : (
                      <>
                        <PersonIcon fontSize="small" />
                        <span>{bed.patient?.name.split(" ")[0]}</span>
                      </>
                    )}
                  </div>
                  {bed.status !== "Available" && (
                    <Tooltip title="More info">
                      <InfoIcon className="info-icon" />
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bed-list">
              <table>
                <thead>
                  <tr>
                    <th>Bed #</th>
                    <th>Status</th>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Diagnosis</th>
                    <th>Doctor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ward.beds.map((bed) => (
                    <tr key={`${ward._id}-${bed.bedNumber}`}>
                      <td>{bed.bedNumber}</td>
                      <td>
                        <span className={`status-badge ${bed.status.toLowerCase()}`}>
                          {bed.status}
                        </span>
                      </td>
                      <td>{bed.patient?.name || "-"}</td>
                      <td>{bed.patient?.age || "-"}</td>
                      <td>{bed.patient?.gender || "-"}</td>
                      <td>{bed.patient?.diagnosis || "-"}</td>
                      <td>{bed.patient?.doctor || "-"}</td>
                      <td>
                        <Button 
                          size="small" 
                          onClick={() => handleOpen(bed, ward.name)}
                          disabled={bed.status === "Available"}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Modal */}
      <Modal open={!!selectedBed} onClose={handleClose}>
        <Box className="modal-box">
          <div className="modal-header">
            <Typography variant="h5" component="h2">
              {selectedBed?.patient ? "Patient Details" : "Bed Available"}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {selectedBed?.patient ? (
            <div className="patient-details">
              <div className="detail-row">
                <span className="detail-label">Ward:</span>
                <span className="detail-value">{selectedBed.wardName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bed Number:</span>
                <span className="detail-value">{selectedBed.bedNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Patient Name:</span>
                <span className="detail-value">{selectedBed.patient.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age/Gender:</span>
                <span className="detail-value">{selectedBed.patient.age} / {selectedBed.patient.gender}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${selectedBed.status.toLowerCase()}`}>
                  {selectedBed.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Diagnosis:</span>
                <span className="detail-value">{selectedBed.patient.diagnosis}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Attending Doctor:</span>
                <span className="detail-value">{selectedBed.patient.doctor}</span>
              </div>
              {/* <div className="modal-actions">
                <Button variant="contained" color="primary">
                  View Full Profile
                </Button>
                <Button variant="outlined" color="secondary">
                  Transfer Bed
                </Button>
              </div> */}
            </div>
          ) : (
            <div className="available-bed">
              <AvailableIcon fontSize="large" color="success" />
              <Typography variant="h6" gutterBottom>
                Bed {selectedBed?.bedNumber} is Available
              </Typography>
              <Button variant="contained" color="primary">
                Assign Patient
              </Button>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default BedOccupancy;
