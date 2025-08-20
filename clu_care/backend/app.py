from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from functools import wraps
from bson.objectid import ObjectId
from datetime import datetime as dt

# Initialize Flask app
app = Flask(__name__)

# Configure CORS properly
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# Import and initialize database
try:
    from app.utils.db import initialize_db, get_db
    db = get_db().db
    initialize_db()
    print("✅ Database initialized successfully")
except ImportError as e:
    print(f"❌ Database import error: {e}")
    # Create mock database for fallback
    class MockDB:
        def __init__(self):
            self.users = MockCollection()
            self.patients = MockCollection()
            self.staff = MockCollection()
            self.departments = MockCollection()
    class MockCollection:
        def find_one(self, query=None):
            # Mock admin user for testing
            if query and 'email' in query and query['email'] == 'admin@clucare.com':
                return {
                    '_id': 'mock_admin_id',
                    'email': 'admin@clucare.com',
                    'password': generate_password_hash('admin123'),
                    'role': 'admin',
                    'name': 'System Administrator'
                }
            return None
        def insert_one(self, doc):
            return type('obj', (object,), {'inserted_id': 'mock_id'})()
    db = MockDB()

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split()[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.users.find_one({'email': data['user']['email']})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Test endpoint to check connectivity
@app.route('/test', methods=['GET'])
def test_connection():
    return jsonify({
        'message': 'Backend is running!',
        'status': 'success',
        'timestamp': dt.now().isoformat()
    }), 200

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'message': 'Server is running',
        'time': dt.now().isoformat()
    }), 200

@app.route('/debug/all-users', methods=['GET'])
def debug_all_users():
    """Debug endpoint to list all users from all collections"""
    try:
        users_list = list(db.users.find({}, {'password': 0}))
        staff_list = list(db.staff.find({}, {'password': 0}))
        patients_list = list(db.patients.find({}, {'password': 0}))
        
        # Convert ObjectId to string
        for user in users_list:
            user['_id'] = str(user['_id'])
            user['collection'] = 'users'
        
        for staff in staff_list:
            staff['_id'] = str(staff['_id'])
            staff['collection'] = 'staff'
        
        for patient in patients_list:
            patient['_id'] = str(patient['_id'])
            patient['collection'] = 'patients'
        
        return jsonify({
            'users': users_list,
            'staff': staff_list,
            'patients': patients_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Login endpoint
# Login endpoint
# Login endpoint# Login endpoint
@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        auth_data = request.get_json()
        
        if not auth_data or not auth_data.get('email') or not auth_data.get('password') or not auth_data.get('role'):
            return jsonify({'message': 'Email, password and role are required!'}), 400
        
        print(f"🔐 Login attempt: {auth_data['email']} as {auth_data['role']}")
        
        # Check in all three collections: users, staff, AND patients
        user = None
        collection_name = ""
        
        if auth_data['role'] == 'admin' or auth_data['role'] == 'pharmacy':
            user = db.users.find_one({'email': auth_data['email']})
            collection_name = "users"
        
        elif auth_data['role'] == 'doctor' or auth_data['role'] == 'nurse':
            user = db.staff.find_one({'email': auth_data['email']})
            collection_name = "staff"
        
        elif auth_data['role'] == 'patient':
            # For patients, check both direct email field AND contact.email field
            user = db.patients.find_one({
                '$or': [
                    {'email': auth_data['email']},
                    {'contact.email': auth_data['email']}
                ]
            })
            collection_name = "patients"
        
        # Fallback: search in all collections if not found by role
        if not user:
            user = db.users.find_one({'email': auth_data['email']})
            collection_name = "users" if user else ""
            
        if not user:
            user = db.staff.find_one({'email': auth_data['email']})
            collection_name = "staff" if user else ""
            
        if not user:
            # For patients fallback, check both email fields
            user = db.patients.find_one({
                '$or': [
                    {'email': auth_data['email']},
                    {'contact.email': auth_data['email']}
                ]
            })
            collection_name = "patients" if user else ""
        
        if not user:
            print(f"❌ User not found in any collection: {auth_data['email']}")
            return jsonify({'message': 'User not found!'}), 404
        
        print(f"✅ User found in {collection_name} collection: {user.get('name', 'Unknown')}")
        
        # Verify the user's actual role matches the requested role
        actual_role = user.get('role', 'patient' if collection_name == 'patients' else '')
        
        # For patients collection, the role might not be stored, so we infer it
        if collection_name == 'patients' and not actual_role:
            actual_role = 'patient'
        
        if actual_role != auth_data['role']:
            print(f"❌ Role mismatch: Expected {auth_data['role']}, Found {actual_role}")
            return jsonify({
                'message': f'Invalid user role. Expected {auth_data["role"]} but found {actual_role}'
            }), 403
        
        # Check password - handle both hashed and plain text
        password_matches = False
        
        # If password is hashed (starts with scrypt: or pbkdf2:)
        if user['password'].startswith(('scrypt:', 'pbkdf2:')):
            password_matches = check_password_hash(user['password'], auth_data['password'])
            print("🔐 Checking hashed password")
        else:
            # For plain text passwords (development only)
            password_matches = (user['password'] == auth_data['password'])
            print(f"🔐 Checking plain text password: {password_matches}")
            if password_matches:
                print("⚠️  Warning: Using plain text password - hash this in production!")
        
        if not password_matches:
            print("❌ Password does not match")
            return jsonify({'message': 'Invalid password!'}), 401
        
        print("✅ Password matches!")
        
        # Prepare user data for token based on collection type
        user_data = {
            'email': user.get('email') or user.get('contact', {}).get('email', ''),
            'role': actual_role,
            'name': user.get('name', 'User'),
            'id': str(user.get('_id', 'unknown'))
        }
        
        # Add additional fields for staff members
        if collection_name == 'staff':
            user_data['specialization'] = user.get('specialization')
            user_data['department'] = user.get('department')
            user_data['qualifications'] = user.get('qualifications')
        
        # Add additional fields for patients
        elif collection_name == 'patients':
            user_data['patientId'] = user.get('patientId', '')
            user_data['age'] = user.get('age', '')
            user_data['gender'] = user.get('gender', '')
            user_data['medicalSpecialty'] = user.get('medicalSpecialty', '')
            user_data['type'] = user.get('type', '')
            user_data['contact'] = user.get('contact', {})
            user_data['insurance'] = user.get('insurance', {})
            user_data['wardNumber'] = user.get('wardNumber', '')
            user_data['cartNumber'] = user.get('cartNumber', '')
        
        token_payload = {
            'user': user_data,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
        }
        
        token = jwt.encode(token_payload, app.config['SECRET_KEY'])
        
        print(f"✅ Login successful for {user['name']} as {actual_role}")
        
        return jsonify({
            'token': token,
            'user': user_data,
            'redirect': f'/{actual_role}/dashboard',
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({
            'message': 'Login error',
            'error': str(e)
        }), 500
# Register admin blueprint
try:
    from admin_bp import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/admin")
    print("✅ Admin blueprint registered successfully")
except ImportError as e:
    print(f"⚠️  Could not import admin blueprint: {e}")

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("📊 Available endpoints:")
    print("   GET  /health - Health check")
    print("   GET  /test - Test connection")
    print("   POST /login - User login")
    print("   GET  /admin/* - Admin endpoints")
    
    app.run(debug=True, host='0.0.0.0', port=5000)