import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaFileMedical, FaUserInjured, FaUserMd, FaPills, FaCalendarAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [originalPrescriptions, setOriginalPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Fetch prescriptions from backend
  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      // Correct the endpoint to match your Flask backend
      const response = await axios.get("http://localhost:5000/view-prescriptions");
      setPrescriptions(response.data);
      setOriginalPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Search with ordering matched first
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setPrescriptions(originalPrescriptions);
      return;
    }

    const matched = originalPrescriptions.filter(item =>
      String(item.prescriptionId || "").toLowerCase().includes(value) ||
      String(item.patientName || "").toLowerCase().includes(value) ||
      String(item.doctorName || "").toLowerCase().includes(value) ||
      String(item.medicine || "").toLowerCase().includes(value)
    );

    const nonMatched = originalPrescriptions.filter(item => !matched.includes(item));
    setPrescriptions([...matched, ...nonMatched]);
  };

  // Sort prescriptions
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...prescriptions].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setPrescriptions(sortedData);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaFileMedical style={{ marginRight: '10px' }} />
          Prescription Management
        </h1>
        <p style={styles.subtitle}>View and manage all patient prescriptions</p>
      </div>

      {/* Search and Filter Bar */}
      <div style={styles.searchFilterContainer}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by ID, Patient, Doctor, or Medicine..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
        
        <button 
          style={styles.refreshButton}
          onClick={fetchPrescriptions}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Prescription Table */}
      {isLoading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div style={styles.emptyState}>
          <FaFileMedical size={48} style={{ color: '#6c757d', marginBottom: '15px' }} />
          <h3>No Prescriptions Found</h3>
          <p>There are currently no prescriptions in the system.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader} onClick={() => requestSort('prescriptionId')}>
                  <div style={styles.headerContent}>
                    <FaFileMedical style={{ marginRight: '5px' }} />
                    ID {getSortIcon('prescriptionId')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('patientName')}>
                  <div style={styles.headerContent}>
                    <FaUserInjured style={{ marginRight: '5px' }} />
                    Patient {getSortIcon('patientName')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('doctorName')}>
                  <div style={styles.headerContent}>
                    <FaUserMd style={{ marginRight: '5px' }} />
                    Doctor {getSortIcon('doctorName')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('medicine')}>
                  <div style={styles.headerContent}>
                    <FaPills style={{ marginRight: '5px' }} />
                    Medicine {getSortIcon('medicine')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('quantity')}>
                  <div style={styles.headerContent}>
                    Qty {getSortIcon('quantity')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('dateIssued')}>
                  <div style={styles.headerContent}>
                    <FaCalendarAlt style={{ marginRight: '5px' }} />
                    Date {getSortIcon('dateIssued')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((item, index) => (
                <tr 
                  key={index} 
                  style={styles.tableRow}
                  onClick={() => setSelectedPrescription(item)}
                  className="prescription-row"
                >
                  <td style={styles.tableCell}>{item.prescriptionId}</td>
                  <td style={styles.tableCell}>{item.patientName}</td>
                  <td style={styles.tableCell}>{item.doctorName}</td>
                  <td style={styles.tableCell}>{item.medicine}</td>
                  <td style={styles.tableCell}>{item.quantity || "N/A"}</td>
                  <td style={styles.tableCell}>{formatDate(item.dateIssued)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Prescription Details</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setSelectedPrescription(null)}
              >
                &times;
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Prescription ID:</span>
                <span>{selectedPrescription.prescriptionId}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Patient Name:</span>
                <span>{selectedPrescription.patientName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Doctor Name:</span>
                <span>{selectedPrescription.doctorName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Medicine:</span>
                <span>{selectedPrescription.medicine}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Quantity:</span>
                <span>{selectedPrescription.quantity || "N/A"}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Date Issued:</span>
                <span>{formatDate(selectedPrescription.dateIssued)}</span>
              </div>
              {/* Add more details as needed */}
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={styles.printButton}
                onClick={() => window.print()}
              >
                Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Styles
const styles = {
  container: {
    padding: "25px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f9fa",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "1200px",
    margin: "20px auto",
  },
  header: {
    marginBottom: "25px",
    textAlign: "center",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "16px",
  },
  searchFilterContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: "10px 15px",
    borderRadius: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    flex: "1",
    minWidth: "300px",
  },
  searchIcon: {
    color: "#6c757d",
    marginRight: "10px",
    fontSize: "16px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    flex: "1",
    fontSize: "14px",
    background: "transparent",
  },
  refreshButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#007bff",
    color: "#fff",
    padding: "12px 15px",
    textAlign: "left",
    cursor: "pointer",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
  },
  tableRow: {
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  tableCell: {
    padding: "12px 15px",
    color: "#495057",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  loadingSpinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    color: "#6c757d",
  },
  modalOverlay: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000",
  },
  modal: {
    background: "#fff",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "600px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  modalHeader: {
    background: "#007bff",
    color: "#fff",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
  },
  modalBody: {
    padding: "20px",
  },
  detailRow: {
    display: "flex",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  detailLabel: {
    fontWeight: "600",
    width: "150px",
    color: "#495057",
  },
  modalFooter: {
    padding: "15px 20px",
    background: "#f8f9fa",
    display: "flex",
    justifyContent: "flex-end",
  },
  printButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ViewPrescriptions;