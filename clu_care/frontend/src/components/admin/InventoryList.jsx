import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faPlus,
  faBoxOpen,
  faPills,
  faSyringe,
  faFlask,
  faBone,
  faHeartbeat,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './InventoryList.css';

const InventoryList = ({ 
  inventory = [], 
  onEdit, 
  onDelete, 
  onView, 
  showAddButton = true,
  categories = [],
  departments = []
}) => {
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Add Item Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'medication',
    department: '',
    quantity: 0,
    unit: '',
    supplier: '',
    expiryDate: '',
    price: 0,
    threshold: 10,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
    
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically call your API
      // await api.post('/inventory', formData);
      
      // Reset form
      setFormData({
        name: '',
        category: 'medication',
        department: '',
        quantity: 0,
        unit: '',
        supplier: '',
        expiryDate: '',
        price: 0,
        threshold: 10,
        notes: ''
      });
      setOpenDialog(false);
      
      // Refresh inventory or call success callback
    } catch (error) {
      console.error('Error adding inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'medication': return <FontAwesomeIcon icon={faPills} />;
      case 'equipment': return <FontAwesomeIcon icon={faFlask} />;
      case 'supplies': return <FontAwesomeIcon icon={faBoxOpen} />;
      case 'vaccine': return <FontAwesomeIcon icon={faSyringe} />;
      case 'orthopedic': return <FontAwesomeIcon icon={faBone} />;
      case 'cardiac': return <FontAwesomeIcon icon={faHeartbeat} />;
      default: return <FontAwesomeIcon icon={faBoxOpen} />;
    }
  };

  // Get stock status
  const getStockStatus = (quantity, threshold) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= threshold) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="inventory-container">
      {/* Filters and Search */}
      <div className="inventory-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Department:</label>
          <select 
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Item Button */}
      {showAddButton && (
        <button 
          className="add-item-button"
          onClick={() => setOpenDialog(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Item
        </button>
      )}

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Department</th>
              <th>Quantity</th>
              <th>Supplier</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        {item.description && (
                          <div className="item-description">{item.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="category-cell">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td>{item.department || 'N/A'}</td>
                    <td>
                      <div className={`quantity-cell ${getStockStatus(item.quantity, item.threshold || 10)}`}>
                        {item.quantity} {item.unit}
                      </div>
                    </td>
                    <td>{item.supplier || 'N/A'}</td>
                    <td>{item.expiryDate || 'N/A'}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view"
                        onClick={() => onView && onView(item.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => onEdit && onEdit(item.id)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => onDelete && onDelete(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredInventory.length > 0 && (
        <div className="inventory-pagination">
          <div className="rows-per-page">
            <span>Items per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={handleChangeRowsPerPage}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="pagination-info">
            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredInventory.length)} of {filteredInventory.length}
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setPage(p => 
                (p + 1) * rowsPerPage < filteredInventory.length ? p + 1 : p
              )}
              disabled={(page + 1) * rowsPerPage >= filteredInventory.length}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      {openDialog && (
        <div className="inventory-dialog-overlay">
          <div className="inventory-dialog">
            <h2>Add New Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity*</label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    name="unit"
                    placeholder="e.g., boxes, pieces"
                    value={formData.unit}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input
                    type="number"
                    name="threshold"
                    min="1"
                    value={formData.threshold}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;