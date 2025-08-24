import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const ChatBot = () => {
  const [name, setName] = useState("");
  const [patientType, setPatientType] = useState("");
  const [patientId, setPatientId] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [avatarAnimation, setAvatarAnimation] = useState('idle');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Avatar animation cycle
  useEffect(() => {
    const avatarIntervals = setInterval(() => {
      const animations = ['blink', 'nod', 'idle'];
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      setAvatarAnimation(randomAnimation);
      
      setTimeout(() => setAvatarAnimation('idle'), 2000);
    }, 8000);

    return () => clearInterval(avatarIntervals);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validatePatientId = async (patientId) => {
    try {
      setIsValidating(true);
      setValidationError("");
      
      const response = await axios.get(`http://localhost:5000/api/patients/validate/${patientId}`);
      
      if (response.data.valid) {
        return { isValid: true, patientData: response.data.patient };
      } else {
        return { isValid: false, patientData: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error validating patient ID:', error);
      if (error.response?.status === 404) {
        return { isValid: false, patientData: null, error: 'Patient ID not found' };
      } else {
        return { isValid: false, patientData: null, error: 'Validation service unavailable. Please try again later.' };
      }
    } finally {
      setIsValidating(false);
    }
  };

  const submitName = async () => {
    if (name.trim() && patientType) {
      if (patientType === "existing") {
        if (!patientId.trim()) {
          setValidationError("Please enter your Patient ID");
          return;
        }
        
        const validationResult = await validatePatientId(patientId.trim());
        
        if (!validationResult.isValid) {
          setValidationError(validationResult.error || "Invalid Patient ID. Please check and try again.");
          return;
        }
      }
      
      setNameSubmitted(true);
      let welcomeMessage = `Hello ${name}! `;
      
      if (patientType === "existing") {
        const validationResult = await validatePatientId(patientId.trim());
        if (validationResult.isValid && validationResult.patientData) {
          const patient = validationResult.patientData;
          welcomeMessage += `Welcome back to MediCare Hospital! I see you're in Ward ${patient.wardNumber} (Cart ${patient.cartNumber}) under ${patient.assignedDoctor}. How can I assist you today?`;
        } else {
          welcomeMessage += `Welcome back to MediCare Hospital! How can I assist you today?`;
        }
      } else {
        welcomeMessage += "Welcome to MediCare Hospital! As a new patient, I'm here to help you get started. How can I assist you today?";
      }
      
      setMessages([{ 
        from: "bot", 
        text: welcomeMessage,
        time: new Date()
      }]);
    } else {
      setValidationError("Please enter your name and select patient type");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = { from: "user", text: input, time: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const requestData = {
        message: input,
        name: name,
        patientType: patientType,
        patientId: patientId
      };

      if (patientType === "existing") {
        const validationResult = await validatePatientId(patientId);
        if (validationResult.isValid && validationResult.patientData) {
          const patient = validationResult.patientData;
          requestData.ward = patient.wardNumber;
          requestData.room = patient.cartNumber;
        }
      }
      
      const res = await axios.post("http://localhost:5000/chat", requestData);

      setIsTyping(false);
      
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { from: "bot", text: res.data.response, time: new Date() }
        ]);
        setIsSending(false);
      }, 500);
      
    } catch (err) {
      setIsTyping(false);
      setIsSending(false);
      setMessages([
        ...newMessages,
        { from: "bot", text: "Sorry, I'm having trouble connecting to the server. Please try again later.", time: new Date() }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending && !isValidating) {
      if (!nameSubmitted) {
        submitName();
      } else {
        sendMessage();
      }
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (validationError && patientId) {
      setValidationError("");
    }
  }, [validationError, patientId]);

  if (!nameSubmitted) {
    return (
      <div className="hero-container">
        {/* Animated Background Elements */}
        <div className="animated-background">
          <div className="floating-medical-icons">
            <div className="medical-icon">❤️</div>
            <div className="medical-icon">🩺</div>
            <div className="medical-icon">💊</div>
            <div className="medical-icon">🏥</div>
            <div className="medical-icon">🩹</div>
            <div className="medical-icon">🔬</div>
          </div>
          <div className="pulse-rings">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>

        <div className="hero-content">
          {/* Animated AI Doctor Avatar */}
          <div className="ai-doctor-section">
            <div className="avatar-container">
              <div className={`ai-avatar ${avatarAnimation}`}>
                <div className="avatar-face">👨‍⚕️</div>
                <div className="avatar-glow"></div>
                <div className="avatar-particles">
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
              </div>
              <div className="avatar-orbits">
                <div className="orbit"></div>
                <div className="orbit"></div>
                <div className="orbit"></div>
              </div>
            </div>
            
            <div className="welcome-text">
              <h1 className="hero-title">
                <span className="title-word">Welcome to</span>
                <span className="title-word highlight">CluCare AI</span>
              </h1>
              <p className="hero-subtitle">
                Your intelligent healthcare assistant, available 24/7
              </p>
            </div>
          </div>

          {/* Animated Features Grid */}
          <div className="features-grid">
            <div className="feature-card" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">⚡</div>
              <h3>Instant Support</h3>
              <p>Get immediate answers to your health questions</p>
            </div>
            <div className="feature-card" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">🎯</div>
              <h3>Personalized Care</h3>
              <p>Tailored medical advice based on your needs</p>
            </div>
            <div className="feature-card" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">🛡️</div>
              <h3>Secure & Private</h3>
              <p>DPDP compliant healthcare conversations</p>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="stats-container">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Patients Served</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          {/* Patient Form with Animations */}
          <div className="patient-form-container">
            <div className="form-header">
              <h2>Let's Get Started</h2>
              <p>Join thousands of patients who trust our AI healthcare system</p>
            </div>

            <div className="patient-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Are you a new or existing patient? *</label>
                <div className="patient-type-buttons">
                  <button
                    type="button"
                    className={`patient-type-btn ${patientType === 'new' ? 'active' : ''}`}
                    onClick={() => setPatientType('new')}
                  >
                    <span className="btn-icon">👤</span>
                    New Patient
                  </button>
                  <button
                    type="button"
                    className={`patient-type-btn ${patientType === 'existing' ? 'active' : ''}`}
                    onClick={() => setPatientType('existing')}
                  >
                    <span className="btn-icon">🔄</span>
                    Existing Patient
                  </button>
                </div>
              </div>

              {patientType === 'existing' && (
                <div className="form-group">
                  <label className="form-label">Patient ID *</label>
                  <input
                    className={`patient-id-input ${validationError ? 'error' : ''}`}
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter your patient ID (e.g., P-68a31ac5)"
                    onKeyDown={handleKeyDown}
                    disabled={isValidating}
                  />
                  {isValidating && (
                    <div className="validation-loading">
                      <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                      Validating Patient ID...
                    </div>
                  )}
                  {validationError && (
                    <div className="validation-error">❌ {validationError}</div>
                  )}
                </div>
              )}

              <button 
                className="start-chat-btn" 
                onClick={submitName}
                disabled={isValidating || !name.trim() || !patientType}
              >
                {isValidating ? (
                  <div className="btn-loading">
                    <div className="loading-spinner"></div>
                    Validating...
                  </div>
                ) : (
                  <>
                    <span className="btn-sparkle">✨</span>
                    Start Healthcare Journey
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>

              <div className="trust-badges">
                <div className="badge">🔒 DPDP Compliant</div>
                <div className="badge">⭐ 4.9/5 Rating</div>
                <div className="badge">👨‍⚕️ Doctor Approved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Wave Bottom */}
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span className="chatbot-header-icon">💬</span>
        <h2>MediCare Assistant - {name} {patientId && `(ID: ${patientId})`}</h2>
        <span className="online-indicator"></span>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            <div className="message-content">
              {msg.text}
            </div>
            <span className="message-time">{formatTime(msg.time)}</span>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="heartbeat-container">
              <div className="heartbeat-animation">
                <div className="heart">❤️</div>
              </div>
            </div>
            <span className="typing-text">AI Doctor is analyzing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>
      
      <div className="chatbot-input-area">
        <input
          className="chatbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your symptoms or ask a health question..."
          disabled={isSending}
        />
        <button 
          className={`chatbot-send-btn ${isSending ? 'sending' : ''}`} 
          onClick={sendMessage}
          disabled={isSending}
        >
          {isSending ? (
            <div className="send-spinner"></div>
          ) : (
            <span className="send-icon">➤</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;