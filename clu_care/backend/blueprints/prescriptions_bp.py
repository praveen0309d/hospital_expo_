from flask import Blueprint, jsonify
from pymongo import MongoClient
from bson import ObjectId, errors

prescriptions_bp = Blueprint("prescriptions_bp", __name__)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["hospital_db"]
patients_collection = db["patients"]
staff_collection = db["staff"]

# Default medicine prices
DEFAULT_PRICES = {
    "Paracetamol": 10,
    "Amoxicillin": 15,
    "Cetirizine": 8,
    "Vitamin D3": 12,
    "Ibuprofen": 20,
    "Azithromycin": 25,
    "Loratadine": 10,
    "Calcium": 18
}

@prescriptions_bp.route("/all-prescriptions", methods=["GET"])
def get_all_prescriptions():
    all_patients = patients_collection.find({}, {"_id": 0})
    response = []

    for patient in all_patients:
        patient_id = patient.get("patientId")
        patient_name = patient.get("name")
        prescriptions = patient.get("prescriptions", [])

        for idx, pres in enumerate(prescriptions, start=1):
            date = pres.get("date")
            medicines_list = pres.get("medicines") or pres.get("medications") or []

            # Fetch doctor name safely
            doctor_name = "Unknown"

            # First try prescription level
            doctor_field = pres.get("assignedDoctor")
            # fallback to patient level
            if not doctor_field:
                doctor_field = patient.get("assignedDoctor")

            if doctor_field:
                doctor_id = doctor_field.get("$oid") if isinstance(doctor_field, dict) else doctor_field
                try:
                    doctor_obj_id = ObjectId(doctor_id)
                    doctor = staff_collection.find_one({"_id": doctor_obj_id})
                    if doctor:
                        doctor_name = doctor.get("name", "Unknown")
                except errors.InvalidId:
                    doctor_name = "Unknown"

            formatted_meds = []
            total_price = 0
            for med in medicines_list:
                med_name = med.get("name")
                med_dosage = med.get("dosage") or med.get("dose")
                med_time = med.get("time") or med.get("frequency")
                price = DEFAULT_PRICES.get(med_name, 0)
                total_price += price
                formatted_meds.append(f"{med_name} - {med_dosage} • {med_time}")

            response.append({
                "patientId": patient_id,
                "patientName": patient_name,
                "doctorName": doctor_name,
                "prescriptionNumber": idx,
                "date": date,
                "medicines": formatted_meds,
                "totalPrice": total_price
            })

    return jsonify(response)
