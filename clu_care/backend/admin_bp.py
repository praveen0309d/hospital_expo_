from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import datetime
import bcrypt
# from bson import ObjectId

# Initialize Flask
app = Flask(__name__)
CORS(app)  # Allow React frontend to connect

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["hospital_db"]
staff_collection = db["staff"]
departments_collection = db["departments"]
patients_collection = db["patients"]
emergency_collection = db["emergency_cases"]
# Helper functions
def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ================== STAFF ENDPOINTS ==================

# Get all staff
@app.route("/api/staff", methods=["GET"])
def get_staff():
    staff = list(staff_collection.find({}, {"_id": 1, "name": 1, "role": 1, "department": 1, "email": 1, "phone": 1, "status": 1, "staffId": 1}))
    staff = [serialize_doc(s) for s in staff]
    return jsonify(staff)

# Get staff by ID
@app.route("/staff/<id>", methods=["GET"])
def get_staff_by_id(id):
    staff = staff_collection.find_one({"_id": ObjectId(id)})
    if not staff:
        return jsonify({"error": "Staff not found"}), 404
    return jsonify(serialize_doc(staff))

# Add new staff
@app.route("/api/staff", methods=["POST"])
def add_staff():
    data = request.json
    if not data or "name" not in data or "role" not in data:
        return jsonify({"error": "Missing required fields"}), 400
    staff_collection.insert_one(data)
    return jsonify({"message": "Staff added successfully"}), 201

# Update staff
@app.route("/staff/<id>", methods=["PUT"])
def update_staff(id):
    data = request.json
    update_data = {k: v for k, v in data.items() if v is not None}
    if "password" in update_data:
        update_data["password"] = bcrypt.hashpw(update_data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    result = staff_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.modified_count == 0:
        return jsonify({"error": "Staff not updated"}), 404
    updated_staff = staff_collection.find_one({"_id": ObjectId(id)})
    return jsonify(serialize_doc(updated_staff))

# Delete staff
@app.route("/staff/<id>", methods=["DELETE"])
def delete_staff(id):
    result = staff_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Staff not found"}), 404
    return jsonify({"message": "Staff deleted successfully"})

# Get departments
@app.route("/api/departments", methods=["GET"])
def get_departments():
    departments = list(departments_collection.find({}, {"_id": 1, "name": 1}))
    departments = [serialize_doc(d) for d in departments]
    return jsonify(departments)

# # Get available doctors by specialty
# @app.route("/staff/available", methods=["GET"])
# def get_available_doctors():
#     specialty = request.args.get("specialty")
#     docs = list(staff_collection.find({"role": "doctor", "department": specialty, "status": "active"}))
#     docs = [serialize_doc(d) for d in docs]
#     return jsonify(docs)




# ================== PATIENT ENDPOINTS ==================
def serialize_doc(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "assignedDoctor" in doc and doc["assignedDoctor"] is not None:
        doc["assignedDoctor"] = str(doc["assignedDoctor"])
    return doc


# Get all patients
@app.route("/api/patients", methods=["GET"])
def get_patients():
    patients = list(patients_collection.find())
    for patient in patients:
        # assigned doctor name
        if patient.get("assignedDoctor"):
            doctor = staff_collection.find_one({"_id": ObjectId(patient["assignedDoctor"])})
            patient["assignedDoctorName"] = doctor["name"] if doctor else None
        else:
            patient["assignedDoctorName"] = None
        
        serialize_doc(patient)  # convert ObjectIds to string

    return jsonify(patients)


# Add new patient
@app.route("/api/patients", methods=["POST"])
def add_patient():
    data = request.json
    patient_type = data.get("type", "OPD")
    status = "admitted" if patient_type == "IPD" else "registered"
    admission_date = datetime.datetime.now() if patient_type == "IPD" else None

    patient_doc = {
        "patientId": f"P-{str(ObjectId())[:8]}",
        "name": data.get("name"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "bloodGroup": data.get("bloodGroup"),
        "type": patient_type,
        "medicalSpecialty": data.get("medicalSpecialty"),
        "description": data.get("description"),
        "password": data.get("password"),
        "contact": data.get("contact", {}),
        "insurance": data.get("insurance", {}),
        "status": status,
        "admissionDate": admission_date,
        "assignedDoctor": ObjectId(data["assignedDoctor"]) if data.get("assignedDoctor") else None,
        "wardNumber": data.get("wardNumber"),      # Added field
        "cartNumber": data.get("cartNumber")       # Added field
    }

    patients_collection.insert_one(patient_doc)

    # Update doctor status if IPD
    if data.get("assignedDoctor") and patient_type == "IPD":
        staff_collection.update_one(
            {"_id": ObjectId(data["assignedDoctor"])},
            {"$set": {"status": "unavailable"}}
        )

    return jsonify({
        "message": "Patient added successfully", 
        "patientId": patient_doc["patientId"]
    }), 201

# Get available doctors by specialty
@app.route("/staff/available", methods=["GET"])
def get_available_doctors():
    specialty = request.args.get("specialty")
    docs = list(staff_collection.find({"role": "doctor", "department": specialty, "status": "active"}))
    docs = [serialize_doc(d) for d in docs]
    return jsonify(docs)

# ================== WARD & BED MANAGEMENT ==================
@app.route("/api/beds", methods=["GET"])
def get_beds():
    # Fetch all patients
    patients = list(patients_collection.find())
    patients_dict = {}

    # Create a lookup using wardNumber and cartNumber
    for p in patients:
        ward = int(p.get("wardNumber", 0))
        bed = int(p.get("cartNumber", 0))
        if ward > 0 and bed > 0:
            # Resolve doctor name if assigned
            doctor_name = None
            if p.get("assignedDoctor"):
                doctor = staff_collection.find_one({"_id": ObjectId(p["assignedDoctor"])})
                doctor_name = doctor["name"] if doctor else None
            p["doctorName"] = doctor_name
            # Also serialize admissionDate to string
            if p.get("admissionDate"):
                p["admissionDate"] = str(p["admissionDate"])
            patients_dict[(ward, bed)] = p

    # Generate 5 wards with 10 beds each
    wards = []
    for ward_num in range(1, 6):
        beds = []
        for bed_num in range(1, 11):
            patient = patients_dict.get((ward_num, bed_num))
            bed = {
                "bedNumber": bed_num,
                "status": "Admitted" if patient else "Available",
                "admissionDate": patient.get("admissionDate") if patient else None,
                "patient": {
                    "name": patient.get("name"),
                    "age": patient.get("age"),
                    "gender": patient.get("gender"),
                    "diagnosis": patient.get("medicalSpecialty"),
                    "doctor": patient.get("doctorName")  # <-- use doctor name
                } if patient else None
            }
            beds.append(bed)
        ward = {
            "_id": f"ward{ward_num}",
            "name": f"Ward {ward_num}",
            "specialty": f"Ward{ward_num}",
            "beds": beds
        }
        wards.append(ward)

    return jsonify(wards)

# ================== DASHBOARD STATS ==================
@app.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    try:
        # Patients
        total_patients = patients_collection.count_documents({})
        admitted = patients_collection.count_documents({"status": "admitted"})
        discharged = patients_collection.count_documents({"status": "discharged"})

        # Staff
        total_staff = staff_collection.count_documents({})
        doctors = staff_collection.count_documents({"role": "doctor"})
        nurses = staff_collection.count_documents({"role": "nurse"})

        # Beds
        total_beds = 5 * 10  # 5 wards * 10 beds
        occupied_beds = patients_collection.count_documents({"wardNumber": {"$ne": None}})

        # Inventory (replace with real inventory collection if you have one)
        inventory_items = 100
        low_stock = 10

        # Alerts (example static, replace with real logic if needed)
        alerts = 5
        critical_alerts = 2

        # Bed occupancy percentage
        bed_occupancy = f"{int((occupied_beds / total_beds) * 100)}%"

        return jsonify({
            "patients": total_patients,
            "admitted": admitted,
            "discharged": discharged,
            "staff": total_staff,
            "doctors": doctors,
            "nurses": nurses,
            "bedOccupancy": bed_occupancy,
            "totalBeds": total_beds,
            "occupiedBeds": occupied_beds,
            "inventoryItems": inventory_items,
            "lowStock": low_stock,
            "alerts": alerts,
            "criticalAlerts": critical_alerts
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================== WARD MANAGEMENT ENDPOINTS ==================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
