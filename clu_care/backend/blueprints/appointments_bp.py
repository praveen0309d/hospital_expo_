from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import MongoClient
import datetime

appointments_bp = Blueprint("appointments_bp", __name__)

client = MongoClient("mongodb://localhost:27017/")
db = client["hospital_db"]
appointments_collection = db["appointments"]

# Get appointments for a doctor
@appointments_bp.route("/api/appointments/<doctor_id>", methods=["GET"])
def get_doctor_appointments(doctor_id):
    try:
        appointments = list(
            appointments_collection.find(
                {"doctorId": ObjectId(doctor_id)},
                {"_id": 1, "patientId": 1, "date": 1, "description": 1,"notes":1 ,"status": 1, "createdAt": 1}
            )
        )
        # Convert ObjectId to string
        for app in appointments:
            app["_id"] = str(app["_id"])
        return jsonify(appointments), 200
    except Exception as e:
        print("Error fetching appointments:", e)
        return jsonify({"message": "Error fetching appointments", "error": str(e)}), 500


# Update appointment status
@appointments_bp.route("/api/appointments/<appointment_id>/status", methods=["PUT"])
def update_appointment_status(appointment_id):
    try:
        data = request.get_json()
        new_status = data.get("status")
        if new_status not in ["approved", "cancelled"]:
            return jsonify({"message": "Invalid status"}), 400

        appointments_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": new_status, "updatedAt": datetime.datetime.utcnow()}}
        )
        return jsonify({"message": "Appointment status updated", "status": new_status}), 200
    except Exception as e:
        print("Error updating appointment:", e)
        return jsonify({"message": "Error updating appointment", "error": str(e)}), 500
