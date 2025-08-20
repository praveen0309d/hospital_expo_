import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import './AlertFeed.css';
import PropTypes from 'prop-types';

const AlertFeed = ({ alerts: initialAlerts = [], maxAlerts = 10, autoDismiss = true, dismissTime = 5000 }) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [isOpen, setIsOpen] = useState(true);

  // Add new alerts from props
  useEffect(() => {
    if (initialAlerts.length > 0) {
      setAlerts(prev => [
        ...initialAlerts.slice(0, maxAlerts - prev.length),
        ...prev
      ].slice(0, maxAlerts));
    }
  }, [initialAlerts, maxAlerts]);

  // Auto-dismiss alerts
  useEffect(() => {
    if (!autoDismiss || alerts.length === 0) return;

    const timer = setTimeout(() => {
      setAlerts(prev => prev.slice(0, -1));
    }, dismissTime);

    return () => clearTimeout(timer);
  }, [alerts, autoDismiss, dismissTime]);

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon error" />;
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="alert-icon success" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon warning" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="alert-icon info" />;
    }
  };

  const toggleFeed = () => setIsOpen(!isOpen);

  return (
    <div className={`alert-feed-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="alert-feed-header" onClick={toggleFeed}>
        <div className="alert-feed-title">
          <FontAwesomeIcon icon={faBell} />
          <span>Alerts</span>
          {alerts.length > 0 && (
            <span className="alert-count">
              <FontAwesomeIcon icon={faCircle} />
              <span>{alerts.length}</span>
            </span>
          )}
        </div>
        <button className="toggle-feed-btn">
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div className="alert-feed">
          {alerts.length === 0 ? (
            <div className="no-alerts">No new alerts</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-content">
                  {getIcon(alert.type)}
                  <div>
                    <div className="alert-title">{alert.title}</div>
                    {alert.message && <div className="alert-message">{alert.message}</div>}
                    {alert.timestamp && (
                      <div className="alert-timestamp">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  className="dismiss-alert-btn"
                  onClick={() => dismissAlert(alert.id)}
                  aria-label="Dismiss alert"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Prop types validation
AlertFeed.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  maxAlerts: PropTypes.number,
  autoDismiss: PropTypes.bool,
  dismissTime: PropTypes.number,
};

AlertFeed.defaultProps = {
  alerts: [],
  maxAlerts: 10,
  autoDismiss: true,
  dismissTime: 5000,
};

export default AlertFeed;