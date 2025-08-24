from flask import Flask, request, jsonify,Blueprint
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import difflib
import json
from datetime import datetime

# Load environment variables
load_dotenv()

chatbot_db = Blueprint("chatbot_db", __name__)

# Path to your patients JSON file
PATIENTS_FILE = "C:\\Users\\prave\\OneDrive\\Documents\\hospital_expo_\\clu_care\\backend\\data\\patients.json"


def load_patients_data():
    """Load patients data from JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(PATIENTS_FILE), exist_ok=True)
        
        if not os.path.exists(PATIENTS_FILE):
            # Create empty patients file if it doesn't exist
            with open(PATIENTS_FILE, 'w') as f:
                json.dump([], f)
            return []
        
        with open(PATIENTS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading patients data: {e}")
        return []

# FAQs
faq={
    "what are your timings?": "We are open from 8 AM to 8 PM, Monday to Saturday. Sundays are closed for routine checkups, but emergency services are available 24/7.",
    "do you have emergency services?": "Yes, emergency services are available 24/7. You can reach our emergency hotline at 123-456-7890.",
    "where is the hospital located?": "We are located near ABC Road, opposite XYZ Mall, City Center.",
    "how can i book an chatbot_dbointment?": "You can book an chatbot_dbointment by calling our reception at 123-456-7890 or through our website's chatbot_dbointment portal.",
    "do you offer online consultations?": "Yes, we offer online consultations for general medicine and follow-ups. Please call to schedule one.",
    "what insurance do you accept?": "We accept most major insurance providers including ABC Health, XYZ Coverage, and MediCare. Please contact billing for details.",
    "do you have a pharmacy inside?": "Yes, we have a 24/7 in-house pharmacy for all prescribed medications.",
    "are there covid-19 vaccination services?": "Yes, COVID-19 vaccination is available. Please bring valid ID and check availability before arrival.",
    "how can i get my lab reports?": "Lab reports can be collected at the diagnostics counter or accessed online using your patient ID and registered phone number.",
    "do you have specialists available?": "Yes, we have specialists in cardiology, neurology, pediatrics, orthopedics, dermatology, and more. Please check availability before visiting."
}

# Symptom mchatbot_dbing
symptom_map = {
    "fever cough sore throat": {
        "disease": "Flu",
        "department": "General Medicine",
        "doctor": "Dr. Anjali Sharma"
    },
    "chest pain breathlessness": {
        "disease": "Possible Cardiac Issue",
        "department": "Cardiology",
        "doctor": "Dr. Rajiv Menon"
    },
    "headache nausea vomiting": {
        "disease": "Migraine",
        "department": "Neurology",
        "doctor": "Dr. Neha Gupta"
    },
    "abdominal pain bloating constipation": {
        "disease": "Irritable Bowel Syndrome (IBS)",
        "department": "Gastroenterology",
        "doctor": "Dr. Prakash Iyer"
    },
    "joint pain stiffness swelling": {
        "disease": "Arthritis",
        "department": "Rheumatology",
        "doctor": "Dr. Meera Nair"
    },
    "itching rash redness": {
        "disease": "Allergic Dermatitis",
        "department": "Dermatology",
        "doctor": "Dr. Rohan Desai"
    },
    "frequent urination burning sensation": {
        "disease": "Urinary Tract Infection (UTI)",
        "department": "Urology",
        "doctor": "Dr. Kavita Reddy"
    },
    "blurred vision eye pain headache": {
        "disease": "Glaucoma",
        "department": "Ophthalmology",
        "doctor": " Dr. Vivek Sinha"
    },
    "weight loss fatigue night sweats": {
        "disease": "Tuberculosis",
        "department": "Pulmonology",
        "doctor": "Dr. Sneha Joshi"
    },
    "numbness tingling weakness": {
        "disease": "Nerve Compression or Neuropathy",
        "department": "Neurology",
        "doctor": "Dr. Arvind Kapoor"
    },
    "palpitations dizziness sweating": {
        "disease": "Arrhythmia",
        "department": "Cardiology",
        "doctor": "Dr. Divya Narayan"
    },
    "shortness of breath wheezing chest tightness": {
        "disease": "Asthma",
        "department": "Pulmonology",
        "doctor": "Dr. Imran Qureshi"
    },
    "sneezing runny nose itchy eyes": {
        "disease": "Allergic Rhinitis",
        "department": "ENT",
        "doctor": "Dr. Priya Sengupta"
    },
    "back pain leg pain numbness": {
        "disease": "Sciatica",
        "department": "Orthopedics",
        "doctor": "Dr. Suresh Rathi"
    },
    "excessive thirst frequent urination fatigue": {
        "disease": "Diabetes Mellitus",
        "department": "Endocrinology",
        "doctor": "Dr. Pooja Verma"
    }
}

@chatbot_db.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'MediCare Hospital API is running',
        'timestamp': datetime.now().isoformat()
    })

@chatbot_db.route('/api/patients/validate/<patient_id>', methods=['GET'])
def validate_patient(patient_id):
    """Validate patient ID endpoint"""
    try:
        patients = load_patients_data()
        patient = next((p for p in patients if p.get('patientId') == patient_id), None)
        
        if patient:
            # Return only necessary information (no sensitive data)
            patient_data = {
                "valid": True,
                "patient": {
                    "name": patient.get("name", ""),
                    "patientId": patient.get("patientId", ""),
                    "wardNumber": patient.get("wardNumber"),
                    "cartNumber": patient.get("cartNumber"),
                    "assignedDoctor": patient.get("assignedDoctor"),
                    "medicalSpecialty": patient.get("medicalSpecialty"),
                    "status": patient.get("status"),
                    "type": patient.get("type"),
                    "bloodGroup": patient.get("bloodGroup"),
                    "age": patient.get("age"),
                    "gender": patient.get("gender")
                }
            }
            return jsonify(patient_data)
        else:
            return jsonify({
                "valid": False,
                "message": "Patient ID not found in our records"
            }), 404
            
    except Exception as e:
        print(f"Error validating patient: {e}")
        return jsonify({
            "valid": False,
            "message": "Internal server error. Please try again later."
        }), 500

@chatbot_db.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    """Get complete patient details (for internal use)"""
    try:
        patients = load_patients_data()
        patient = next((p for p in patients if p.get('patientId') == patient_id), None)
        
        if patient:
            # Remove sensitive information before sending
            patient_data = patient.copy()
            if 'password' in patient_data:
                del patient_data['password']
            return jsonify({
                "success": True,
                "patient": patient_data
            })
        else:
            return jsonify({
                "success": False,
                "message": "Patient not found"
            }), 404
            
    except Exception as e:
        print(f"Error fetching patient: {e}")
        return jsonify({
            "success": False,
            "message": "Internal server error"
        }), 500

def match_symptoms(user_input):
    user_input = user_input.lower()
    user_words = set(user_input.split())

    for symptoms, info in symptom_map.items():
        symptom_keywords = symptoms.split()
        matches = 0

        for word in symptom_keywords:
            close = difflib.get_close_matches(word, user_words, cutoff=0.7)
            if close:
                matches += 1

        if matches >= 2:
            return info
    return None

def generate_with_ollama(user_input):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": (
                    "You are a hospital chatbot. "
                    "Only respond to medical-related questions, such as symptoms, diseases, "
                    "departments, chatbot_dbointments, medications, or hospital information. "
                    "If a question is not related to healthcare, politely say you cannot answer it.\n\n"
                    f"User: {user_input}"
                ),
                "stream": False
            }
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception:
        return "Sorry, I couldn't process that using the AI model."

@chatbot_db.route('/')
def home():
    return "Hospital Chatbot backend is running!"

@chatbot_db.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get("message", "").lower().strip()
    name = data.get("name", "").strip()
    patient_id = data.get("patientId", "").strip()
    patient_type = data.get("patientType", "").strip()

    # Include patient info in response if available
    patient_info = ""
    if patient_id and patient_type == "existing":
        # Validate patient ID to get more details
        try:
            patients = load_patients_data()
            patient = next((p for p in patients if p.get('patientId') == patient_id), None)
            if patient:
                patient_info = f" I see you're {patient.get('name', 'an existing patient')}"
                if patient.get('wardNumber'):
                    patient_info += f" in Ward {patient.get('wardNumber')}"
                if patient.get('assignedDoctor'):
                    patient_info += f" under {patient.get('assignedDoctor')}"
                patient_info += "."
        except:
            patient_info = " I see you're an existing patient."
    elif patient_type == "new":
        patient_info = " Welcome to our hospital as a new patient!"

    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]

    # Greeting check
    if any(greet in user_input for greet in greetings):
        greeting_text = f"Hello {name}!{patient_info} How can I assist you with your health questions today?" if name else f"Hello!{patient_info} How can I assist you with your health questions today?"
        return jsonify({"response": greeting_text})

    # Rule-based FAQ
    if user_input in faq:
        response_text = faq[user_input] + patient_info
        if name:
            response_text = f"{response_text} If you have more questions, {name}, feel free to ask!"
        return jsonify({"response": response_text})

    # Symptom check
    match = match_symptoms(user_input)
    if match:
        response_text = (
            f"Based on your symptoms, you may have {match['disease']}. "
            f"Please consult the {match['department']} department (our senior consultant {match['doctor']})."
            f"{patient_info}"
        )
        if name:
            response_text = f"{name}, {response_text}"
        return jsonify({"response": response_text})

    # Ollama fallback
    ollama_reply = generate_with_ollama(user_input)
    if patient_info:
        ollama_reply = f"{ollama_reply}{patient_info}"
    if name:
        ollama_reply = f"{name}, {ollama_reply}"
    return jsonify({"response": ollama_reply})

