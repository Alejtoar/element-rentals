from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db import get_session
from app.auth.dependencies import get_current_admin_user, get_current_finance_user, get_current_staff_user, get_current_internal_user
from app.reservations.models import Reservation, Payment
from app.reservations.service import ReservationService
from app.reservations.schemas import (
    ReservationCreate, ReservationRead, ReservationUpdate, ReservationDetail,
    PaymentCreate, PaymentRead, PaymentUpdate, FinancialSummary
)

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation: ReservationCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff_user)
):
    service = ReservationService(session)
    db_reservation = Reservation.from_orm(reservation)
    return service.create_reservation(db_reservation)

@router.get("/", response_model=List[ReservationRead])
def read_reservations(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff_user)
):
    service = ReservationService(session)
    return service.get_reservations(skip=skip, limit=limit)

@router.get("/{reservation_id}", response_model=ReservationDetail)
def read_reservation(
    reservation_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff_user)
):
    service = ReservationService(session)
    db_reservation = service.get_reservation_by_id(reservation_id)
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return db_reservation

@router.patch("/{reservation_id}", response_model=ReservationRead)
def update_reservation(
    reservation_id: UUID,
    reservation: ReservationUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff_user)
):
    service = ReservationService(session)
    db_reservation = service.update_reservation(reservation_id, reservation.dict(exclude_unset=True))
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return db_reservation

@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(
    reservation_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_staff_user)
):
    service = ReservationService(session)
    success = service.delete_reservation(reservation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return None

@router.get("/{reservation_id}/financial-summary", response_model=FinancialSummary)
def get_reservation_financial_summary(
    reservation_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_internal_user)  # SEC-002: Changed from staff to internal to allow Finance access
):
    """
    Get the financial summary for a reservation.
    
    Security: Accessible by Admin, Staff, and Finance roles.
    Finance team needs this data for payment reconciliation and payout processing.
    
    SEC-002: Updated to use get_current_internal_user to ensure Finance role
    can access financial summaries (was previously blocked).
    
    Returns:
        - total_amount: Original cost of the stay
        - total_paid: Sum of payments with status='paid'
        - balance: Remaining amount to be paid
        - is_fully_paid: Boolean indicating if reservation is fully paid
    """
    service = ReservationService(session)
    try:
        summary = service.get_financial_summary(reservation_id)
        return summary
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Reservation not found")
        raise HTTPException(status_code=500, detail=str(e))

# Payment Endpoints
payment_router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/{reservation_id}/payments", response_model=List[PaymentRead])
def read_reservation_payments(
    reservation_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_internal_user)
):
    service = ReservationService(session)
    reservation = service.get_reservation_by_id(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation.payments

@payment_router.get("/", response_model=List[PaymentRead])
def read_payments(
    skip: int = 0,
    limit: int = 100,
    reservation_id: Optional[UUID] = None,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_internal_user)
):
    service = ReservationService(session)
    return service.get_payments(skip=skip, limit=limit, reservation_id=reservation_id)

@payment_router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_finance_user)
):
    service = ReservationService(session)
    db_payment = Payment.from_orm(payment)
    return service.create_payment(db_payment)

@payment_router.get("/{payment_id}", response_model=PaymentRead)
def read_payment(
    payment_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_internal_user)
):
    service = ReservationService(session)
    db_payment = service.get_payment_by_id(payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@payment_router.patch("/{payment_id}", response_model=PaymentRead)
def update_payment(
    payment_id: UUID,
    payment: PaymentUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_finance_user)
):
    service = ReservationService(session)
    db_payment = service.update_payment(payment_id, payment.dict(exclude_unset=True))
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@payment_router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_finance_user)
):
    service = ReservationService(session)
    success = service.delete_payment(payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return None
