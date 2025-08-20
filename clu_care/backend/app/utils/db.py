from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os
from datetime import datetime

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            # MongoDB connection
            mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client['hospital_db']
            self.client.server_info()
            print("✅ Successfully connected to MongoDB")
            
        except Exception as e:
            print(f"❌ MongoDB connection error: {e}")
            self._create_mock_collections()

    def _create_mock_collections(self):
        """Create mock collections for development"""
        print("⚠️  Using mock collections for development")
        
        class MockCollection:
            def __init__(self, name):
                self.name = name
                self.data = []
                
            def find_one(self, query=None):
                if query and 'email' in query:
                    return next((item for item in self.data if item.get('email') == query['email']), None)
                return None if not self.data else self.data[0]
                
            def find(self, query=None):
                return self.data
                
            def insert_one(self, document):
                document['_id'] = f"mock_{len(self.data) + 1}"
                self.data.append(document)
                return type('obj', (object,), {'inserted_id': document['_id']})()
                
            def count_documents(self, query=None):
                return len(self.data)
                
            def update_one(self, filter, update):
                return type('obj', (object,), {'modified_count': 1})()
                
            def delete_one(self, filter):
                return type('obj', (object,), {'deleted_count': 1})()

        self.db = type('obj', (object,), {
            'users': MockCollection('users'),
            'patients': MockCollection('patients'),
            'staff': MockCollection('staff'),
            'departments': MockCollection('departments')
        })

    def initialize_default_admin(self):
        """Create default admin user"""
        try:
            admin_user = {
                'email': 'admin@clucare.com',
                'password': generate_password_hash('admin123'),
                'role': 'admin',
                'name': 'System Administrator',
                'permissions': ['all'],
                'created_at': datetime.utcnow()
            }
            
            existing_admin = self.db.users.find_one({'email': 'admin@clucare.com'})
            if not existing_admin:
                self.db.users.insert_one(admin_user)
                print("✅ Default admin user created")
            else:
                print("✅ Admin user already exists")
                
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")

# Global database instance
db_instance = None

def initialize_db():
    """Initialize the database connection"""
    global db_instance
    db_instance = Database()
    db_instance.initialize_default_admin()
    return db_instance

def get_db():
    """Get the database instance"""
    global db_instance
    if db_instance is None:
        db_instance = Database()
    return db_instance
def find_user_by_email(email):
    """Find user by email in both users and staff collections"""
    user = db.users.find_one({'email': email})
    if not user:
        user = db.staff.find_one({'email': email})
    return user

# Export the database instance
db = get_db().db