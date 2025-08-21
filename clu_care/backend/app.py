from flask import Flask
from flask_cors import CORS
import os

from utils.db import initialize_db, get_db
from routes.login_routes import init_login_blueprint
from blueprints.admin_bp import admin_bp
from blueprints.STAFF import staff_bp
from blueprints.patient import patient_bp
from blueprints.doctor import doctor_bp
from blueprints.appointment_routes import appointment_bp

app = Flask(__name__)
CORS(app)

# Secret key
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "your-secret-key-here")

# Initialize DB
initialize_db()
db = get_db().db

# Register blueprints
app.register_blueprint(init_login_blueprint(db, "super-secret-key"), url_prefix="/api")
app.register_blueprint(admin_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(patient_bp, url_prefix="/mypatient")
app.register_blueprint(doctor_bp, url_prefix="/amdoctor")
app.register_blueprint(appointment_bp, url_prefix="/appointments")
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
