import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaUserMd,
  FaUserNurse,
  FaUserCog,
  FaUserTie,
  FaIdBadge,
  FaPlus
} from "react-icons/fa";
import './StaffTable.css';

const StaffTable = () => {
  const [staff, setStaff] = useState({
    doctors: [],
    nurses: [],
    otherStaff: []
  });
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState({ doctors: 0, nurses: 0, otherStaff: 0 });
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    department: '',
    specialization: '',
    qualifications: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    password: ''
  });

  // Fetch staff list
const fetchStaff = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/staff");
    const data = await res.json();

    // Group staff by role
    const grouped = {
      doctors: data.filter(s => s.role.toLowerCase() === 'doctor'),
      nurses: data.filter(s => s.role.toLowerCase() === 'nurse'),
      otherStaff: data.filter(s => !['doctor','nurse'].includes(s.role.toLowerCase()))
    };

    setStaff(grouped);
  } catch (err) {
    console.error("Error fetching staff:", err);
  }
};


  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  // Filter staff by search term
  const filterStaff = (staffList) => {
    return staffList.filter((member) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (member?.name || '').toLowerCase().includes(searchLower) ||
        (member?.role || '').toLowerCase().includes(searchLower) ||
        (member?.department || '').toLowerCase().includes(searchLower) ||
        (member?.email || '').toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredDoctors = filterStaff(staff.doctors);
  const filteredNurses = filterStaff(staff.nurses);
  const filteredOtherStaff = filterStaff(staff.otherStaff);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `http://127.0.0.1:5000/api/staff/${editingId}`
        : `http://127.0.0.1:5000/api/staff`;

      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      fetchStaff(); // Refresh staff list
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'doctor',
        department: '',
        specialization: '',
        qualifications: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        password: ''
      });
      setEditingId(null);
      setOpenDialog(false);

    } catch (error) {
      console.error("Error saving staff:", error);
    } finally {
      setLoading(false);
    }
  };

  
  // Edit staff
  const handleEdit = (staff) => {
    setFormData(staff);
    setEditingId(staff._id);
    setOpenDialog(true);
  };

  // Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/staff/${id}`, { method: "DELETE" });
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return <FaUserMd />;
      case 'nurse': return <FaUserNurse />;
      case 'technician': return <FaUserCog />;
      case 'admin': return <FaUserTie />;
      default: return <FaIdBadge />;
    }
  };

  // Get status chip
  const getStatusChip = (status) => {
    if (!status) return <span className="status-chip unknown">Unknown</span>;
    switch (status.toLowerCase()) {
      case "active": return <span className="status-chip active">Active</span>;
      case "inactive": return <span className="status-chip inactive">Inactive</span>;
      case "on leave": return <span className="status-chip on-leave">On Leave</span>;
      default: return <span className="status-chip">{status}</span>;
    }
  };

  // Render staff table for a specific category
  const renderStaffTable = (category, staffList, filteredList) => {
    if (staffList.length === 0 && filteredList.length === 0) return null;

    return (
      <div key={category} className="staff-category-section">
        <h3 className="staff-category-title">
          {category === 'doctors' ? 'Doctors' : 
           category === 'nurses' ? 'Nurses' : 'Other Staff'}
          <span className="staff-count"> ({filteredList.length})</span>
        </h3>

        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList
                  .slice(page[category] * rowsPerPage, page[category] * rowsPerPage + rowsPerPage)
                  .map((member) => (
                    <tr key={member._id}>
                      <td>
                        <div className="staff-info-cell">
                          <div className="staff-avatar">{member.name.charAt(0)}</div>
                          <div className="staff-details">
                            <div className="staff-name">{member.name}</div>
                            <div className="staff-id">ID: {member.staffId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="staff-role-cell">
                          {getRoleIcon(member.role)}
                          <span>{member.role}</span>
                        </div>
                      </td>
                      <td>{member.department}</td>
                      <td>
                        <div className="staff-email">{member.email}</div>
                        <div className="staff-phone">{member.phone}</div>
                      </td>
                      <td>{getStatusChip(member.status)}</td>
                      <td className="staff-actions-cell">
                        <button className="staff-action-btn edit" onClick={() => handleEdit(member)}>
                          <FaEdit />
                        </button>
                        <button className="staff-action-btn delete" onClick={() => handleDelete(member._id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    No {category === 'doctors' ? 'doctors' : 
                        category === 'nurses' ? 'nurses' : 'staff'} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for this category */}
{filteredList.length > 0 && (
  <div className="staff-pagination">
    <div className="rows-per-page">
      <span>Rows per page:</span>
      <select 
        value={rowsPerPage} 
        onChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage({ doctors: 0, nurses: 0, otherStaff: 0 });
        }}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
      </select>
    </div>
    <div className="pagination-info">
      {page[category] * rowsPerPage + 1}-
      {Math.min((page[category] + 1) * rowsPerPage, filteredList.length)} of {filteredList.length}
    </div>
    <div className="pagination-controls">
      <button 
        onClick={() => setPage(p => ({ ...p, [category]: Math.max(p[category] - 1, 0) }))} 
        disabled={page[category] === 0}
      >
        Previous
      </button>
      <button 
        onClick={() => setPage(p => ({ 
          ...p, 
          [category]: (p[category] + 1) * rowsPerPage < filteredList.length ? p[category] + 1 : p[category]
        }))} 
        disabled={(page[category] + 1) * rowsPerPage >= filteredList.length}
      >
        Next
      </button>
    </div>
  </div>
)}
      </div>
    );
  };

  return (
    <div className="staff-table-container">
      {/* Search Bar */}
      <input
        type="text"
        className="staff-search-input"
        placeholder="Search Staff..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Add Staff Button */}
      <div className="staff-add-button-container">
        <button className="staff-add-button" onClick={() => setOpenDialog(true)}>
          <FaPlus /> Add Staff Member
        </button>
      </div>

      {/* Render tables for each category */}
      {renderStaffTable('doctors', staff.doctors, filteredDoctors)}
      {renderStaffTable('nurses', staff.nurses, filteredNurses)}
      {renderStaffTable('otherStaff', staff.otherStaff, filteredOtherStaff)}

      {/* Add/Edit Staff Dialog */}
      {openDialog && (
        <div className="staff-dialog-overlay">
          <div className="staff-dialog">
            <h2>{editingId ? "Edit Staff" : "Add New Staff Member"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="staff_form">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="staff_form">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="staff_form">
                  <label>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="staff_form">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="technician">Technician</option>

                  </select>
                </div>
                <div className="staff_form">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} required>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="staff_form">
                  <label>Specialization</label>
                  <input 
                    type="text" 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    disabled={formData.role !== 'doctor'}
                  />
                </div>
                <div className="staff_form">
                  <label>Qualifications</label>
                  <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} />
                </div>
                <div className="staff_form">
                  <label>Join Date</label>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
                </div>
                <div className="staff_form">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="active">Active</option>
                    <option value="on leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="staff_form">
                  <label>Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required={!editingId}
                    placeholder={editingId ? "Leave blank to keep current" : ""}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button type="button" className="dialog-btn cancel" onClick={() => setOpenDialog(false)}>
                  Cancel
                </button>
                <button type="submit" className="dialog-btn submit" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  
    );

};



export default StaffTable;