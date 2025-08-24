import React, { useState, useEffect } from "react";
import "./PatientPrediction.css";

function PatientPrediction() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  // Set default date to tomorrow + fetch data
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);

    fetchPerformanceData();
    fetchHistoricalData();
  }, []);

  
  const fetchPerformanceData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/models/performance");
      const data = await res.json();
      setPerformanceData(data);
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/data/features");
      const data = await res.json();
      setHistoricalData(data);
    } catch (err) {
      console.error("Failed to fetch historical data:", err);
    }
  };

  const handlePrediction = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/predict?date=${date}`
      );
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPredictionResult(data);
      }
    } catch (err) {
      setError("Failed to fetch prediction. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetrainModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/models/retrain", {
        method: "POST",
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        alert("Models retrained successfully!");
        fetchPerformanceData();
      }
    } catch (err) {
      setError("Failed to retrain models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Hospital Resource Forecasting System</h1>
          <p>Predict patient admissions, bed requirements, and staff needs</p>
        </div>
      </header>

      <div className="container">
        <div className="grid-container">
          {/* Left Section */}
          <div className="form-section">
            <div className="prediction-form card">
              <h2>Resource Prediction</h2>
              <form onSubmit={handlePrediction}>
                <div className="predict_patiet">
                  <label htmlFor="date-input">Select a future date:</label>
                  <input
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Predicting..." : "Predict Resources"}
                </button>
              </form>

              {/* <div className="retrain-section">
                <button
                  onClick={handleRetrainModels}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Retrain Models
                </button>
                <p className="help-text">Retrain models with latest data</p>
              </div> */}
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {predictionResult && !error && (
              <div className="results-display card">
                <h2>Prediction Results for {predictionResult.date}</h2>
                <div className="results-grid">
                  <div className="result-card">
                    <h3>Patient Admissions</h3>
                    <p className="bed-value">
                      {predictionResult.predicted_patients}
                    </p>
                  </div>
                  <div className="result-card">
                    <h3>Beds Needed</h3>
                    <p className="bed-value">
                      {predictionResult.predicted_beds_needed}
                    </p>
                  </div>
                  <div className="result-card">
                    <h3>Staff Needed</h3>
                    <p className="bed-value">
                      {predictionResult.predicted_staff_needed}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="visualization-section">
            <div className="model-visualization card">
              <h2>Model Performance</h2>
              {performanceData ? (
                <div className="performance-metrics">
                  {Object.entries(performanceData).map(([model, metrics]) => (
                    <div key={model} className="metric-card">
                      <h3>{model.toUpperCase()} Model</h3>
                      {metrics.error ? (
                        <p>{metrics.error}</p>
                      ) : (
                        <div className="metric-grid">
                          <div className="metric">
                            <span>MAE: {metrics.mae}</span>
                          </div>
                          <div className="metric">
                            <span>MSE: {metrics.mse}</span>
                          </div>
                          <div className="metric">
                            <span>RMSE: {metrics.rmse}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading performance data...</p>
              )}
            </div>

            <div className="data-visualization card">
              <h2>Historical Data</h2>
              {historicalData &&
              historicalData.data &&
              historicalData.data.length > 0 ? (
                <div className="data-summary">
                  <p>Dataset contains {historicalData.count} records</p>
                  <div className="summary-stats">
                    <div className="stat">
                      <span>Date Range: </span>
                      <span>
                        {new Date(
                          historicalData.data[0].date
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          historicalData.data[
                            historicalData.data.length - 1
                          ].date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="stat">
                      <span>Avg. Admissions: </span>
                      <span>
                        {Math.round(
                          historicalData.data.reduce(
                            (sum, item) =>
                              sum + parseInt(item.NO_OF_ADMISSIONS || 0, 10),
                            0
                          ) / historicalData.data.length
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading historical data...</p>
              )}
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
}

export default PatientPrediction;
