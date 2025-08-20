import React, { useState } from "react";
import "./Login.css";
import logo from '../assets/logo.png';

function Login() {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const Spinner = () => (
    <div className="spinner"></div>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Input validation
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      console.log("Sending login request...");
      
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ role, email, password })
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log("Login Success:", data);
      
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Redirect to dashboard
      window.location.href = data.redirect || `/${data.user.role}/dashboard`;
      
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Role colors mapping
  const roleColors = {
    patient: "#2E86C1",
    doctor: "#1ABC9C", 
    admin: "#F5B041",
    pharmacy: "#28B463"
  };

  // Demo credentials for testing
  const demoCredentials = {
    patient: { email: "praveen@gmail.com", password: "12334" },
    doctor: { email: "praveen2006@gmail.com", password: "prav@123" },
    admin: { email: "admin@clucare.com", password: "admin123" },
    pharmacy: { email: "pharmacy@clucare.com", password: "pharmacy123" }
  };

  const fillDemoCredentials = () => {
    setEmail(demoCredentials[role]?.email || "");
    setPassword(demoCredentials[role]?.password || "");
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-branding">
          <img src={logo} alt="CluCare Logo" className="login-logo" />
          <div className="login-header">
            <h2>Welcome to CluCare</h2>
            <p>Please login to access your account</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="role-selection">
            <label>I am a:</label>
            <div className="role-options">
              {["patient", "doctor", "admin", "pharmacy"].map((r) => (
                <label 
                  key={r} 
                  className="role-option"
                  style={{ 
                    backgroundColor: role === r ? roleColors[r] : "#F8F9F9",
                    borderColor: roleColors[r],
                    color: role === r ? "white" : "#333"
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    disabled={loading}
                  />
                  <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
            style={{ backgroundColor: roleColors[role] }}
          >
            {loading ? <Spinner /> : 'Login'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;