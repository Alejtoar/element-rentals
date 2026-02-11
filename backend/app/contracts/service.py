from uuid import UUID
from datetime import date
from typing import Optional, List
from sqlmodel import Session
from app.contracts.models import ManagementContract
from app.contracts.schemas import ManagementContractCreate, ManagementContractUpdate
from app.contracts.repository import ManagementContractRepository
from fastapi import HTTPException

class ManagementContractService:
    def __init__(self, session: Session):
        self.repository = ManagementContractRepository(session)

    def create_contract(self, contract_data: ManagementContractCreate) -> ManagementContract:
        contract = ManagementContract.from_orm(contract_data)
        try:
            return self.repository.create(contract)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def get_contract(self, contract_id: UUID) -> ManagementContract:
        contract = self.repository.get_by_id(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        return contract

    def update_contract(self, contract_id: UUID, contract_data: ManagementContractUpdate) -> ManagementContract:
        # P1: Prevent modification of active contracts (critical fields)
        if contract_data.commission_rate is not None or contract_data.start_date is not None:
            existing = self.repository.get_by_id(contract_id)
            if existing and existing.active:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot modify commission rate or start date of an active contract. Deactivate it first."
                )

        try:
            contract = self.repository.update(contract_id, contract_data.dict(exclude_unset=True))
            if not contract:
                raise HTTPException(status_code=404, detail="Contract not found")
            return contract
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def delete_contract(self, contract_id: UUID):
        if not self.repository.delete(contract_id):
            raise HTTPException(status_code=404, detail="Contract not found")

    def get_contracts(self, property_id: Optional[UUID] = None) -> List[ManagementContract]:
        return self.repository.get_all(property_id)
