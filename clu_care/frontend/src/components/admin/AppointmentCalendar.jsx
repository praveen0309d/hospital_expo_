import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faUserMd,
  faUser,
  faPlus,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import './AppointmentCalendar.css';

// Pure helper functions (don't depend on component props)
function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

const AppointmentCalendar = ({
  appointments = [],
  doctors = [],
  patients = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  onDateChange
}) => {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: formatDate(new Date()),
    time: '09:00',
    duration: 30,
    status: 'scheduled',
    reason: ''
  });

  // Helper functions that depend on component props
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.lastName}` : 'Unknown Doctor';
  };

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Memoized filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const matchesSearch = (
        getPatientName(appt.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDoctorName(appt.doctorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDoctor = filterDoctor === 'all' || appt.doctorId === filterDoctor;
      const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;
      
      const apptDate = new Date(appt.date);
      let inViewPeriod = false;
      
      if (viewMode === 'day') {
        inViewPeriod = apptDate.toDateString() === currentDate.toDateString();
      } else if (viewMode === 'week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        inViewPeriod = apptDate >= weekStart && apptDate <= weekEnd;
      } else {
        inViewPeriod = (
          apptDate.getMonth() === currentDate.getMonth() && 
          apptDate.getFullYear() === currentDate.getFullYear()
        );
      }
      
      return matchesSearch && matchesDoctor && matchesStatus && inViewPeriod;
    });
  }, [appointments, searchTerm, filterDoctor, filterStatus, viewMode, currentDate, patients, doctors]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: formatDate(new Date()),
      time: '09:00',
      duration: 30,
      status: 'scheduled',
      reason: ''
    });
    setSelectedAppointment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAppointment) {
      onEdit?.(selectedAppointment.id, formData);
    } else {
      onAdd?.(formData);
    }
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (appt) => {
    setSelectedAppointment(appt);
    setFormData({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      date: appt.date,
      time: appt.time,
      duration: appt.duration,
      status: appt.status,
      reason: appt.reason || ''
    });
    setShowForm(true);
  };

  // View rendering functions
  const renderHeader = () => {
    let headerText = '';
    if (viewMode === 'day') {
      headerText = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      headerText = `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
                   ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else {
      headerText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return (
      <div className="calendar-header">
        <button onClick={handlePrevious} className="nav-button" aria-label="Previous">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h2>{headerText}</h2>
        <button onClick={handleNext} className="nav-button" aria-label="Next">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    return (
      <div className="day-view">
        <div className="time-column">
          {hours.map(hour => (
            <div key={hour} className="time-slot">
              {hour}:00
            </div>
          ))}
        </div>
        <div className="appointments-column">
          {hours.map(hour => {
            const hourStart = new Date(currentDate);
            hourStart.setHours(hour, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hour + 1, 0, 0, 0);
            
            const hourAppointments = filteredAppointments.filter(appt => {
              const apptStart = new Date(`${appt.date}T${appt.time}`);
              return apptStart >= hourStart && apptStart < hourEnd;
            });

            return (
              <div key={hour} className="hour-slot">
                {hourAppointments.map(appt => (
                  <div 
                    key={appt.id} 
                    className={`appointment-card ${appt.status}`}
                    onClick={() => onView?.(appt.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Appointment with ${getPatientName(appt.patientId)} at ${appt.time}`}
                  >
                    <div className="appointment-time">
                      <FontAwesomeIcon icon={faClock} /> {appt.time}
                    </div>
                    <div className="appointment-patient">
                      <FontAwesomeIcon icon={faUser} /> {getPatientName(appt.patientId)}
                    </div>
                    <div className="appointment-doctor">
                      <FontAwesomeIcon icon={faUserMd} /> {getDoctorName(appt.doctorId)}
                    </div>
                    {appt.reason && (
                      <div className="appointment-reason">
                        {appt.reason}
                      </div>
                    )}
                    <div className="appointment-actions">
                      <button 
                        className="action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(appt);
                        }}
                        aria-label={`Edit appointment with ${getPatientName(appt.patientId)}`}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(appt.id);
                        }}
                        aria-label={`Delete appointment with ${getPatientName(appt.patientId)}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-label"></div>
          {days.map(day => (
            <div key={day.toDateString()} className="day-header">
              <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-number">{day.getDate()}</div>
            </div>
          ))}
        </div>
        
        <div className="week-body">
          {hours.map(hour => (
            <div key={hour} className="week-hour-row">
              <div className="time-label">{hour}:00</div>
              {days.map(day => {
                const dayAppointments = filteredAppointments.filter(appt => {
                  const apptDate = new Date(appt.date);
                  return (
                    apptDate.toDateString() === day.toDateString() &&
                    parseInt(appt.time.split(':')[0]) === hour
                  );
                });

                return (
                  <div 
                    key={`${day.toDateString()}-${hour}`} 
                    className="week-cell"
                    onClick={() => {
                      const newDate = new Date(day);
                      newDate.setHours(hour);
                      setCurrentDate(newDate);
                      setViewMode('day');
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View appointments for ${day.toLocaleDateString()} at ${hour}:00`}
                  >
                    {dayAppointments.map(appt => (
                      <div 
                        key={appt.id} 
                        className={`appointment-dot ${appt.status}`}
                        title={`${appt.time} - ${getPatientName(appt.patientId)}`}
                        aria-hidden="true"
                      ></div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i - daysInMonth - startDay + 1),
        isCurrentMonth: false
      });
    }
    
    return (
      <div className="month-view">
        <div className="month-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="month-day-header">{day}</div>
          ))}
        </div>
        
        <div className="month-body">
          {days.map((day, index) => {
            const dayAppointments = filteredAppointments.filter(appt => {
              const apptDate = new Date(appt.date);
              return apptDate.toDateString() === day.date.toDateString();
            });

            return (
              <div 
                key={index} 
                className={`month-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${
                  day.date.toDateString() === new Date().toDateString() ? 'today' : ''
                }`}
                onClick={() => {
                  setCurrentDate(day.date);
                  setViewMode('day');
                }}
                role="button"
                tabIndex={0}
                aria-label={`${day.date.toLocaleDateString()} - ${dayAppointments.length} appointments`}
              >
                <div className="day-number">{day.date.getDate()}</div>
                <div className="day-appointments">
                  {dayAppointments.slice(0, 3).map(appt => (
                    <div 
                      key={appt.id} 
                      className={`appointment-indicator ${appt.status}`}
                      title={`${appt.time} - ${getPatientName(appt.patientId)}`}
                      aria-hidden="true"
                    ></div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="more-appointments">+{dayAppointments.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="appointment-calendar">
      {/* Calendar Controls */}
      <div className="calendar-controls">
        {renderHeader()}
        
        <div className="view-options">
          <button 
            className={`view-option ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
            aria-label="Day view"
          >
            Day
          </button>
          <button 
            className={`view-option ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
            aria-label="Week view"
          >
            Week
          </button>
          <button 
            className={`view-option ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
            aria-label="Month view"
          >
            Month
          </button>
        </div>
        
        <button 
          className="add-appointment-button"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              date: formatDate(currentDate)
            }));
            setShowForm(true);
          }}
          aria-label="Add new appointment"
        >
          <FontAwesomeIcon icon={faPlus} /> New Appointment
        </button>
      </div>
      
      {/* Filters */}
      <div className="calendar-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search appointments"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="doctor-filter">Doctor:</label>
          <select 
            id="doctor-filter"
            value={filterDoctor} 
            onChange={(e) => setFilterDoctor(e.target.value)}
            aria-label="Filter by doctor"
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>
      
      {/* Calendar View */}
      <div className="calendar-view">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>
      
      {/* Appointment Form Modal */}
      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="appointment-form-modal">
            <h2>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
              <button 
                className="close-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                aria-label="Close appointment form"
              >
                &times;
              </button>
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patientId">Patient*</label>
                  <select
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="doctorId">Doctor*</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Date*</label>
                  <input
                    id="appointmentDate"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="appointmentTime">Time*</label>
                  <input
                    id="appointmentTime"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="appointmentDuration">Duration (minutes)*</label>
                  <input
                    id="appointmentDuration"
                    type="number"
                    name="duration"
                    min="15"
                    max="240"
                    step="15"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="appointmentStatus">Status*</label>
                  <select
                    id="appointmentStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentReason">Reason</label>
                <textarea
                  id="appointmentReason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  aria-label="Appointment reason"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  aria-label="Cancel appointment"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-button"
                  aria-label={selectedAppointment ? "Update appointment" : "Create appointment"}
                >
                  {selectedAppointment ? 'Update Appointment' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;