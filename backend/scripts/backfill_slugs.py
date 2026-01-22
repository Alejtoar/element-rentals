import os
import sys

# Add the project root to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from sqlmodel import Session, select
from app.db import engine
from app.properties.models import Property, PropertyImage
from app.users.models import User
from app.owners.models import Owner
from app.leads.models import OwnerLead, GuestLead
from app.guests.models import Guest
from app.reservations.models import Reservation, Payment, Charge, Channel
from app.properties.service import PropertyService

def backfill():
    with Session(engine) as session:
        service = PropertyService(session)
        statement = select(Property).where(Property.slug == None)
        properties = session.exec(statement).all()
        
        print(f"Found {len(properties)} properties without slugs.")
        
        for prop in properties:
            new_slug = service._generate_unique_slug(prop.name)
            prop.slug = new_slug
            session.add(prop)
            print(f"Backfilled slug for '{prop.name}': {new_slug}")
        
        session.commit()
        print("Backfill complete.")

if __name__ == "__main__":
    backfill()
