
import os
import sqlite3
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.db import init_db
from app.users.service import UserService
from sqlmodel import Session, SQLModel, create_engine
# Import ALL models to register them in metadata and avoid missing dependencies
from app.users.models import User
from app.owners.models import Owner
from app.properties.models import Property, PropertyImage
from app.leads.models import OwnerLead, GuestLead
from app.guests.models import Guest
from app.reservations.models import Reservation, Payment, Charge, Channel

def test_seeding_on_empty_db():
    db_file = "test_seed.db"
    if os.path.exists(db_file):
        os.remove(db_file)
    
    print(f"Running seeding logic in clean DB: {db_file}")
    
    test_engine = create_engine(f"sqlite:///./{db_file}")
    
    # Create tables
    SQLModel.metadata.create_all(test_engine)
    
    with Session(test_engine) as session:
        user_service = UserService(session)
        print("Running seeding logic...")
        user_service.create_admin_if_not_exists()
        
    # Verify admin in the new file
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM user WHERE role='admin'")
    admin = cursor.fetchone()
    conn.close()
    
    if admin:
        print(f"✅ Admin seeded successfully: {admin[0]} ({admin[1]})")
    else:
        print("❌ Admin NOT seeded")
    
    if os.path.exists(db_file):
        os.remove(db_file)

if __name__ == "__main__":
    test_seeding_on_empty_db()
