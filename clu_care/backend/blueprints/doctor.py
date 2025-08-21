from flask import Blueprint, jsonify
from pymongo import MongoClient
from bson.json_util import dumps

doctor_bp = Blueprint("doctor_bp", __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client.hospital_db

# Fetch all doctors
@doctor_bp.route("/", methods=["GET"])
def get_doctors():
    doctors = list(db.doctors.find())
    return dumps(doctors)
