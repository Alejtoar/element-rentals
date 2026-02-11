from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.auth.dependencies import get_current_active_user, get_current_admin_user
from app.users.models import User
from app.contracts.schemas import ManagementContractCreate, ManagementContractRead, ManagementContractUpdate
from app.contracts.service import ManagementContractService

router = APIRouter()

def get_service(session: Session = Depends(get_session)) -> ManagementContractService:
    return ManagementContractService(session)

@router.post("/", response_model=ManagementContractRead)
def create_contract(
    contract: ManagementContractCreate,
    service: ManagementContractService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    return service.create_contract(contract)

@router.get("/", response_model=List[ManagementContractRead])
def get_contracts(
    property_id: Optional[UUID] = None,
    service: ManagementContractService = Depends(get_service),
    current_user: User = Depends(get_current_active_user)
):
    return service.get_contracts(property_id)

@router.get("/{contract_id}", response_model=ManagementContractRead)
def get_contract(
    contract_id: UUID,
    service: ManagementContractService = Depends(get_service),
    current_user: User = Depends(get_current_active_user)
):
    return service.get_contract(contract_id)

@router.put("/{contract_id}", response_model=ManagementContractRead)
def update_contract(
    contract_id: UUID,
    contract_in: ManagementContractUpdate,
    service: ManagementContractService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    return service.update_contract(contract_id, contract_in)

@router.delete("/{contract_id}")
def delete_contract(
    contract_id: UUID,
    service: ManagementContractService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    service.delete_contract(contract_id)
    return {"ok": True}
