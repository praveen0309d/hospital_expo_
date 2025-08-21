import os
from flask import Blueprint, request, jsonify,send_from_directory
from pymongo import MongoClient
from bson.json_util import dumps
from bson import ObjectId
import datetime

patient_bp = Blueprint("patient_bp", __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client.hospital_db

# Get patient info by patientId
@patient_bp.route("/<patient_id>", methods=["GET"])
def get_patient(patient_id):
    try:
        patient = db.patients.find_one({"patientId": patient_id})
        if not patient:
            return jsonify({"message": "Patient not found"}), 404

        # Fetch assigned doctor details
        assigned_doctor = None
        if "assignedDoctor" in patient and patient["assignedDoctor"]:
            assigned_doctor = db.staff.find_one({"_id": patient["assignedDoctor"]})
            if assigned_doctor:
                assigned_doctor = {
                    "name": assigned_doctor.get("name"),
                    "department": assigned_doctor.get("department"),
                    "specialization": assigned_doctor.get("specialization"),
                    "email": assigned_doctor.get("email")
                }

        # Prepare patient data
        patient_data = {
            "patientId": patient.get("patientId"),
            "name": patient.get("name"),
            "age": patient.get("age"),
            "gender": patient.get("gender"),
            "type": patient.get("type"),
            "medicalSpecialty": patient.get("medicalSpecialty"),
            "contact": patient.get("contact", {}),
            "insurance": patient.get("insurance", {}),
            "wardNumber": patient.get("wardNumber", ""),
            "cartNumber": patient.get("cartNumber", ""),
            "admissionDate": patient.get("admissionDate", ""),
            "status": patient.get("status", ""),
            "assignedDoctor": assigned_doctor,
            "appointments": patient.get("appointments", []),
            "prescriptions": patient.get("prescriptions", []),
            "labReports": patient.get("labReports", [])
        }

        return jsonify(patient_data), 200

    except Exception as e:
        print(f"❌ Error fetching patient: {str(e)}")
        return jsonify({"message": "Error fetching patient", "error": str(e)}), 500


# ✅ Get prescriptions for a patient
@patient_bp.route("/<patient_id>/prescriptions", methods=["GET"])
def get_prescriptions(patient_id):
    try:
        patient = db.patients.find_one({"patientId": patient_id})
        if not patient:
            return jsonify({"message": "Patient not found"}), 404

        prescriptions = patient.get("prescriptions", [])
        return jsonify(prescriptions), 200

    except Exception as e:
        print(f"❌ Error fetching prescriptions: {str(e)}")
        return jsonify({"message": "Error fetching prescriptions", "error": str(e)}), 500


# Get all patients
@patient_bp.route("/", methods=["GET"])
def get_all_patients():
    try:
        patients = list(db.patients.find())
        return dumps(patients), 200
    except Exception as e:
        print(f"❌ Error fetching patients: {str(e)}")
        return jsonify({"message": "Error fetching patients", "error": str(e)}), 500



# Absolute path to your uploads folder
UPLOAD_FOLDER = r"C:\Users\prave\OneDrive\Documents\hospital_expo_\clu_care\backend\uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Route to serve uploaded files (PDF, images)
@patient_bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    try:
        # as_attachment=False => opens in browser
            return send_from_directory(
        'uploads',  # folder where files are stored
        filename,
        as_attachment=True
    )
    except FileNotFoundError:
        return "File not found on server", 404

