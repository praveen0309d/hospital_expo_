import React, { useState } from "react";

const PatientPrediction = () => {
    const [form, setForm] = useState({
        age: "",
        gender: "",
        symptoms: "",
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPrediction(null);
        // Replace with your API endpoint
        try {
            // Example: const res = await fetch("/api/predict", { ... });
            // For now, mock prediction:
            setTimeout(() => {
                setPrediction("High Risk");
                setLoading(false);
            }, 1000);
        } catch (err) {
            setPrediction("Error predicting risk.");
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
            <h2>Patient Risk Prediction</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Age:
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            required
                            style={{ marginLeft: 8, width: 80 }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Gender:
                        <select name="gender" value={form.gender} onChange={handleChange} required style={{ marginLeft: 8 }}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        Symptoms:
                        <input
                            type="text"
                            name="symptoms"
                            value={form.symptoms}
                            onChange={handleChange}
                            placeholder="Comma separated"
                            required
                            style={{ marginLeft: 8, width: 200 }}
                        />
                    </label>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Predicting..." : "Predict Risk"}
                </button>
            </form>
            {prediction && (
                <div style={{ marginTop: 24, fontWeight: "bold" }}>
                    Prediction: {prediction}
                </div>
            )}
        </div>
    );
};

export default PatientPrediction;