import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaRedo, FaBox, FaTag, 
  FaIndustry, FaMoneyBillWave, FaBoxes, FaCalendarAlt, FaSort, 
  FaSortUp, FaSortDown, FaExclamationTriangle
} from "react-icons/fa";
import "./ManageStock.css";

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
      const response = await axios.get("http://localhost:5000/appointments/manage-stock");
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
      await axios.post("http://localhost:5000/appointments/manage-stock", formData);
      await fetchStock();
      resetForm();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  // Update stock
  const handleUpdate = async () => {
    try {
      await axios.put("http://localhost:5000/appointments/manage-stock", formData);
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
        await axios.delete(`http://localhost:5000/appointments/manage-stock?medicineId=${medicineId}`);
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
      const response = await axios.put("http://localhost:5000/appointments/manage-stock", {
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
    <div className="manage-stock-container">
      <div className="manage-stock-header">
        <h1 className="manage-stock-title">
          <FaBox className="title-icon" />
          Pharmacy Inventory Management
        </h1>
        <p className="manage-stock-subtitle">Manage and track your medical inventory</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <FaExclamationTriangle className="alert-icon" />
          <strong>Low Stock Alert:</strong> {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum threshold
        </div>
      )}

      {/* Search and Actions */}
      <div className="search-action-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, Name, Type, Manufacturer..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          className="refresh-button"
          onClick={fetchStock}
          disabled={isLoading}
        >
          <FaRedo className="button-icon" />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Inventory Form */}
      <div className="inventory-form-container">
        <h3 className="form-title">
          {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Medicine ID</label>
            <input
              type="text"
              name="medicineId"
              value={formData.medicineId}
              onChange={handleChange}
              className="form-input"
              placeholder="MED-001"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Medicine Name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="form-input"
              placeholder="SKU-001"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input"
              placeholder="Tablet/Syringe/etc"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="form-input"
              placeholder="Manufacturer Name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              placeholder="0"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
        <div className="form-buttons">
          {isEditing ? (
            <>
              <button className="update-button" onClick={handleUpdate}>
                <FaEdit className="button-icon" />
                Update Item
              </button>
              <button className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
            </>
          ) : (
            <button className="add-button" onClick={handleAdd}>
              <FaPlus className="button-icon" />
              Add New Item
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading inventory data...</p>
        </div>
      ) : stock.length === 0 ? (
        <div className="empty-state">
          <FaBox size={48} className="empty-icon" />
          <h3>No Inventory Items Found</h3>
          <p>There are currently no items in your inventory.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="table-header" onClick={() => requestSort('medicineId')}>
                  <div className="header-content">
                    <FaBox className="header-icon" />
                    ID {getSortIcon('medicineId')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('name')}>
                  <div className="header-content">
                    Name {getSortIcon('name')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('sku')}>
                  <div className="header-content">
                    <FaTag className="header-icon" />
                    SKU {getSortIcon('sku')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('type')}>
                  <div className="header-content">
                    Type {getSortIcon('type')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('manufacturer')}>
                  <div className="header-content">
                    <FaIndustry className="header-icon" />
                    Manufacturer {getSortIcon('manufacturer')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('price')}>
                  <div className="header-content">
                    <FaMoneyBillWave className="header-icon" />
                    Price {getSortIcon('price')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('quantity')}>
                  <div className="header-content">
                    <FaBoxes className="header-icon" />
                    Qty {getSortIcon('quantity')}
                  </div>
                </th>
                <th className="table-header" onClick={() => requestSort('expiryDate')}>
                  <div className="header-content">
                    <FaCalendarAlt className="header-icon" />
                    Expiry {getSortIcon('expiryDate')}
                  </div>
                </th>
                <th className="table-header">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item, index) => (
                <tr 
                  key={index} 
                  className={`inventory-row ${item.quantity < 5 ? 'critical-stock' : item.quantity < 10 ? 'low-stock' : ''}`}
                >
                  <td className="table-cell">{item.medicineId}</td>
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.sku}</td>
                  <td className="table-cell">{item.type}</td>
                  <td className="table-cell">{item.manufacturer}</td>
                  <td className="table-cell">₹{parseFloat(item.price).toFixed(2)}</td>
                  <td className={`table-cell ${item.quantity < 5 ? 'critical-quantity' : item.quantity < 10 ? 'low-quantity' : ''}`}>
                    {item.quantity}
                  </td>
                  <td className={`table-cell ${isExpiringSoon(item.expiryDate) ? 'expiring-soon' : ''}`}>
                    {formatDate(item.expiryDate)}
                  </td>
                  <td className="table-cell">
                    <div className="action-container">
                      <div className="reduce-quantity-group">
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
                          className="reduce-input"
                          min="1"
                          max={item.quantity}
                        />
                        <button
                          onClick={() => handleReduceQuantity(item.medicineId)}
                          className="reduce-button"
                        >
                          Reduce
                        </button>
                      </div>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(item)}
                          className="edit-button"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.medicineId)}
                          className="delete-button"
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

export default ManageStock;