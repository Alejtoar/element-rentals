from datetime import date
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select, or_
from app.contracts.models import ManagementContract

class ManagementContractRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, contract: ManagementContract) -> ManagementContract:
        if contract.active:
            self.check_overlap(contract.property_id, contract.start_date, contract.end_date)
        self.session.add(contract)
        self.session.commit()
        self.session.refresh(contract)
        return contract

    def get_by_id(self, contract_id: UUID) -> Optional[ManagementContract]:
        return self.session.get(ManagementContract, contract_id)

    def update(self, contract_id: UUID, updates: dict) -> ManagementContract:
        contract = self.get_by_id(contract_id)
        if not contract:
            return None
        
        # Check overlap if dates are changing
        new_start = updates.get("start_date", contract.start_date)
        new_end = updates.get("end_date", contract.end_date)
        new_property_id = updates.get("property_id", contract.property_id) # Should not happen usually but...
        
        # Only check if dates or active status might cause overlap
        if "start_date" in updates or "end_date" in updates or "active" in updates:
             # If setting to inactive, no need to check, but we usually want historical integrity
             # If active is explicitly set to True, or remains True
             is_active = updates.get("active", contract.active)
             if is_active:
                 self.check_overlap(new_property_id, new_start, new_end, exclude_id=contract_id)

        for key, value in updates.items():
            setattr(contract, key, value)
            
        self.session.add(contract)
        self.session.commit()
        self.session.refresh(contract)
        return contract

    def delete(self, contract_id: UUID) -> bool:
        contract = self.get_by_id(contract_id)
        if not contract:
            return False
        self.session.delete(contract)
        self.session.commit()
        return True

    def check_overlap(self, property_id: UUID, start_date: date, end_date: Optional[date], exclude_id: Optional[UUID] = None):
        query = select(ManagementContract).where(
            ManagementContract.property_id == property_id,
            ManagementContract.active == True
        )
        if exclude_id:
            query = query.where(ManagementContract.id != exclude_id)
            
        existing_contracts = self.session.exec(query).all()
        
        for existing in existing_contracts:
            if self._dates_overlap(existing.start_date, existing.end_date, start_date, end_date):
                 raise ValueError(f"Contract overlaps with existing contract {existing.id} ({existing.start_date} - {existing.end_date or 'Indefinite'})")

    def _dates_overlap(self, start1: date, end1: Optional[date], start2: date, end2: Optional[date]) -> bool:
        # Check if 1 ends before 2 starts
        if end1 is not None and end1 < start2:
            return False
            
        # Check if 2 ends before 1 starts
        if end2 is not None and end2 < start1:
            return False
            
        return True

    def get_active_by_property(self, property_id: UUID, date_check: date) -> Optional[ManagementContract]:
        """
        Find the active ManagementContract for a property on a specific date.
        """
        # We need to find a contract where start_date <= date_check AND (end_date IS NULL OR end_date >= date_check)
        # And it must be active
        query = select(ManagementContract).where(
            ManagementContract.property_id == property_id,
            ManagementContract.active == True,
            ManagementContract.start_date <= date_check
        )
        
        candidates = self.session.exec(query).all()
        for contract in candidates:
            if contract.end_date is None or contract.end_date >= date_check:
                return contract
        
        return None

    def get_all(self, property_id: Optional[UUID] = None) -> List[ManagementContract]:
        query = select(ManagementContract)
        if property_id:
            query = query.where(ManagementContract.property_id == property_id)
        return self.session.exec(query).all()
