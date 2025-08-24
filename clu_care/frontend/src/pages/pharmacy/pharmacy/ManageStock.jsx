import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaRedo, FaBox, FaTag, 
  FaIndustry, FaMoneyBillWave, FaBoxes, FaCalendarAlt, FaSort, 
  FaSortUp, FaSortDown, FaExclamationTriangle
} from "react-icons/fa";

const ManageStock = () => {
  const [stock, setStock] = useState([]);
  const [originalStock, setOriginalStock] = useState([]);
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    sku: "",
    type: "",
    manufacturer: "",
    price: "",
    quantity: "",
    expiryDate: "",
  });
  const [reduceQty, setReduceQty] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isEditing, setIsEditing] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Fetch stock data
  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/manage-stock");
      setStock(response.data);
      setOriginalStock(response.data);
      checkLowStock(response.data);
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for low stock items
  const checkLowStock = (stockData) => {
    const lowStock = stockData.filter(item => item.quantity < 10);
    setLowStockItems(lowStock);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? 
        (isNaN(value) ? prev[name] : value) : value
    }));
  };

  // Add new stock
  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5000/manage-stock", formData);
      await fetchStock();
      resetForm();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  // Update stock
  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:5000/manage-stock", formData);
      await fetchStock();
      resetForm();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // Delete stock
  const handleDelete = async (medicineId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/manage-stock?medicineId=${medicineId}`);
        await fetchStock();
      } catch (error) {
        console.error("Error deleting stock:", error);
      }
    }
  };

  // Reduce quantity
  const handleReduceQuantity = async (medicineId) => {
    if (!reduceQty[medicineId] || reduceQty[medicineId] <= 0) {
      alert("Please enter a valid quantity to reduce");
      return;
    }

    try {
      const response = await axios.put("http://localhost:5000/manage-stock", {
        medicineId: parseInt(medicineId),
        reduceQuantity: parseInt(reduceQty[medicineId])
      });

      if (response.data.error) {
        alert(response.data.error);
      } else {
        alert(`Stock reduced by ${reduceQty[medicineId]}. New quantity: ${response.data.newQuantity}`);
        await fetchStock();
        setReduceQty({ ...reduceQty, [medicineId]: "" });
      }
    } catch (error) {
      console.error("Error reducing quantity:", error);
      alert("Failed to reduce quantity");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      medicineId: "",
      name: "",
      sku: "",
      type: "",
      manufacturer: "",
      price: "",
      quantity: "",
      expiryDate: "",
    });
    setIsEditing(false);
  };

  // Prepare for editing
  const handleEdit = (item) => {
    setFormData({
      medicineId: item.medicineId.toString(),
      name: item.name,
      sku: item.sku,
      type: item.type,
      manufacturer: item.manufacturer,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      expiryDate: item.expiryDate
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search & reorder results
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setStock(originalStock);
      return;
    }

    const matched = originalStock.filter(
      (item) =>
        String(item.medicineId || "").toLowerCase().includes(value) ||
        String(item.name || "").toLowerCase().includes(value) ||
        String(item.type || "").toLowerCase().includes(value) ||
        String(item.manufacturer || "").toLowerCase().includes(value)
    );

    const nonMatched = originalStock.filter((item) => !matched.includes(item));
    setStock([...matched, ...nonMatched]);
  };

  // Sort stock
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...stock].sort((a, b) => {
      // Handle numeric fields differently
      if (key === 'price' || key === 'quantity') {
        return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
      }
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setStock(sortedData);
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

  // Check if expiry date is within 30 days
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaBox style={{ marginRight: '10px' }} />
          Pharmacy Inventory Management
        </h1>
        <p style={styles.subtitle}>Manage and track your medical inventory</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div style={styles.alert}>
          <strong>Low Stock Alert:</strong> {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum threshold
        </div>
      )}

      {/* Search and Actions */}
      <div style={styles.searchActionContainer}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by ID, Name, Type, Manufacturer..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
        <button 
          style={styles.refreshButton}
          onClick={fetchStock}
          disabled={isLoading}
        >
          <FaRedo style={{ marginRight: '5px' }} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Inventory Form */}
      <div style={styles.formContainer}>
        <h3 style={styles.formTitle}>
          {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </h3>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Medicine ID</label>
            <input
              type="text"
              name="medicineId"
              value={formData.medicineId}
              onChange={handleChange}
              style={styles.input}
              placeholder="MED-001"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Medicine Name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              style={styles.input}
              placeholder="SKU-001"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={styles.input}
              placeholder="Tablet/Syringe/etc"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              style={styles.input}
              placeholder="Manufacturer Name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={styles.input}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={styles.input}
              placeholder="0"
              min="0"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.formButtons}>
          {isEditing ? (
            <>
              <button style={styles.updateButton} onClick={handleUpdate}>
                <FaEdit style={{ marginRight: '5px' }} />
                Update Item
              </button>
              <button style={styles.cancelButton} onClick={resetForm}>
                Cancel
              </button>
            </>
          ) : (
            <button style={styles.addButton} onClick={handleAdd}>
              <FaPlus style={{ marginRight: '5px' }} />
              Add New Item
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading inventory data...</p>
        </div>
      ) : stock.length === 0 ? (
        <div style={styles.emptyState}>
          <FaBox size={48} style={{ color: '#6c757d', marginBottom: '15px' }} />
          <h3>No Inventory Items Found</h3>
          <p>There are currently no items in your inventory.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader} onClick={() => requestSort('medicineId')}>
                  <div style={styles.headerContent}>
                    <FaBox style={{ marginRight: '5px' }} />
                    ID {getSortIcon('medicineId')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('name')}>
                  <div style={styles.headerContent}>
                    Name {getSortIcon('name')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('sku')}>
                  <div style={styles.headerContent}>
                    <FaTag style={{ marginRight: '5px' }} />
                    SKU {getSortIcon('sku')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('type')}>
                  <div style={styles.headerContent}>
                    Type {getSortIcon('type')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('manufacturer')}>
                  <div style={styles.headerContent}>
                    <FaIndustry style={{ marginRight: '5px' }} />
                    Manufacturer {getSortIcon('manufacturer')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('price')}>
                  <div style={styles.headerContent}>
                    <FaMoneyBillWave style={{ marginRight: '5px' }} />
                    Price {getSortIcon('price')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('quantity')}>
                  <div style={styles.headerContent}>
                    <FaBoxes style={{ marginRight: '5px' }} />
                    Qty {getSortIcon('quantity')}
                  </div>
                </th>
                <th style={styles.tableHeader} onClick={() => requestSort('expiryDate')}>
                  <div style={styles.headerContent}>
                    <FaCalendarAlt style={{ marginRight: '5px' }} />
                    Expiry {getSortIcon('expiryDate')}
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item, index) => (
                <tr 
                  key={index} 
                  style={{
                    ...styles.tableRow,
                    backgroundColor: item.quantity < 5 ? '#fff8f8' : 
                                     item.quantity < 10 ? '#fffaf2' : 'white',
                    borderLeft: item.quantity < 5 ? '4px solid #ff6b6b' : 
                                   item.quantity < 10 ? '4px solid #ffd43b' : '4px solid transparent'
                  }}
                  className="inventory-row"
                >
                  <td style={styles.tableCell}>{item.medicineId}</td>
                  <td style={styles.tableCell}>{item.name}</td>
                  <td style={styles.tableCell}>{item.sku}</td>
                  <td style={styles.tableCell}>{item.type}</td>
                  <td style={styles.tableCell}>{item.manufacturer}</td>
                  <td style={styles.tableCell}>${parseFloat(item.price).toFixed(2)}</td>
                  <td style={{
                    ...styles.tableCell,
                    color: item.quantity < 5 ? '#ff6b6b' : 
                          item.quantity < 10 ? '#f08c00' : 'inherit',
                    fontWeight: item.quantity < 10 ? 'bold' : 'normal'
                  }}>
                    {item.quantity}
                  </td>
                  <td style={{
                    ...styles.tableCell,
                    color: isExpiringSoon(item.expiryDate) ? '#ff6b6b' : 'inherit',
                    fontWeight: isExpiringSoon(item.expiryDate) ? 'bold' : 'normal'
                  }}>
                    {formatDate(item.expiryDate)}
                  </td>
                  <td style={styles.tableCell}>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={reduceQty[item.medicineId] || ""}
                          onChange={(e) =>
                            setReduceQty({
                              ...reduceQty,
                              [item.medicineId]: e.target.value,
                            })
                          }
                          placeholder="Reduce Qty"
                          className="w-20 p-1 border rounded text-sm"
                          min="1"
                          max={item.quantity}
                        />
                        <button
                          onClick={() => handleReduceQuantity(item.medicineId)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Reduce
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          style={styles.editButton}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.medicineId)}
                          style={styles.deleteButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles (same as before)
const styles = {
  container: {
    padding: "25px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f9fa",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "1400px",
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
  alert: {
    backgroundColor: '#fff3bf',
    color: '#5c3c00',
    padding: '10px 15px',
    borderRadius: '5px',
    marginBottom: '20px',
    borderLeft: '4px solid #ffd43b',
    display: 'flex',
    alignItems: 'center',
  },
  searchActionContainer: {
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
    transition: "all 0.3s ease",
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
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '5px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
  },
  addButton: {
    background: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  updateButton: {
    background: '#17a2b8',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
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
    transition: "background 0.2s ease",
    position: "sticky",
    top: "0",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
  },
  tableRow: {
    transition: "all 0.2s ease",
    borderBottom: "1px solid #eee",
  },
  tableCell: {
    padding: "12px 15px",
    color: "#495057",
  },
  editButton: {
    background: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
};

// Add CSS animations
const cssStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .inventory-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  th:hover {
    background: #0069d9 !important;
  }

  input:focus {
    border-color: #007bff !important;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  button:active {
    transform: translateY(0);
  }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.innerHTML = cssStyles;
document.head.appendChild(styleElement);

export default ManageStock;