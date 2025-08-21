from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime

appointment_bp = Blueprint("appointment_bp", __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client.hospital_db

# --- Get all specialties / departments ---
@appointment_bp.route("/departments", methods=["GET"])
def get_departments():
    try:
        depts = db.departments.find()
        dept_list = [d["name"] for d in depts]
        return jsonify(dept_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching departments", "error": str(e)}), 500


# --- Get available doctors for a specialty ---
@appointment_bp.route("/staff/available", methods=["GET"])
def get_available_doctors():
    specialty = request.args.get("specialty")
    if not specialty:
        return jsonify([])

    try:
        doctors = list(db.staff.find(
            {"role": "doctor", "department": specialty},  # match department
            {"name": 1, "department": 1}  # only name & department
        ))

        for doc in doctors:
            doc["_id"] = str(doc["_id"])

        return jsonify(doctors), 200
    except Exception as e:
        return jsonify({"message": "Error fetching doctors", "error": str(e)}), 500


# --- Add a new appointment ---
@appointment_bp.route("/add", methods=["POST"])
def add_appointment():
    data = request.get_json()
    patient_id = data.get("patientId")
    doctor_id = data.get("doctorId")
    date = data.get("date")
    description = data.get("description", "")
    notes = data.get("notes", "")

    if not patient_id or not doctor_id or not date:
        return jsonify({"message": "Patient, Doctor, and Date are required"}), 400

    appointment = {
        "patientId": patient_id,
        "doctorId": ObjectId(doctor_id),
        "date": date,
        "description": description,
        "notes": notes,
        "status": "pending",  # pending, approved, cancelled, completed
        "createdAt": datetime.datetime.utcnow(),
        "updatedAt": datetime.datetime.utcnow()
    }

    try:
        result = db.appointments.insert_one(appointment)
        return jsonify({"message": "Appointment created", "appointmentId": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"message": "Error adding appointment", "error": str(e)}), 500


# --- Get all appointments for a patient ---
@appointment_bp.route("/mine/<patient_id>", methods=["GET"])
def get_my_appointments(patient_id):
    try:
        appointments = list(db.appointments.find({"patientId": patient_id}))

        result = []
        for appt in appointments:
            doctor = db.staff.find_one({"_id": appt["doctorId"]})
            result.append({
                "_id": str(appt["_id"]),
                "doctorName": doctor.get("name") if doctor else "Unknown",
                "department": doctor.get("department") if doctor else "",
                "date": appt.get("date"),
                "description": appt.get("description"),
                "status": appt.get("status"),
                "notes": appt.get("notes", "")
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error fetching appointments", "error": str(e)}), 500
