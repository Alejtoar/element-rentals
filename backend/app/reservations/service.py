from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session
from app.reservations.models import Reservation, Payment, Charge, Channel
from app.reservations.repository import ReservationRepository

class ReservationService:
    def __init__(self, session: Session):
        self.repository = ReservationRepository(session)

    def create_reservation(self, reservation: Reservation) -> Reservation:
        # Create the reservation record
        created_reservation = self.repository.create_reservation(reservation)
        
        # Business Rule 1.1: A 50% non-refundable deposit is required
        if created_reservation.reservation_type == "commercial":
            deposit_amount = created_reservation.total_amount * Decimal("0.5")
            deposit_payment = Payment(
                reservation_id=created_reservation.id,
                amount=deposit_amount,
                payment_type="deposit",
                non_refundable=True,
                provider="Pending", # to be updated by payment flow
                beneficiary="company",
                percentage_applied=Decimal("50.00"),
                status="pending"
            )
            self.repository.create_payment(deposit_payment)
            
        return created_reservation

    def create_charge(self, charge: Charge) -> Charge:
        return self.repository.create_charge(charge)

    def generate_balance_payment(self, reservation_id: UUID) -> Payment:
        reservation = self.repository.get_reservation_by_id(reservation_id)
        if not reservation:
            raise Exception("Reservation not found")
            
        # Business Rule 1.2: The remaining 50% balance must be paid before or at check-in
        balance_amount = reservation.total_amount * Decimal("0.5")
        balance_payment = Payment(
            reservation_id=reservation.id,
            amount=balance_amount,
            payment_type="balance",
            non_refundable=False,
            provider="Pending",
            beneficiary="company",
            percentage_applied=Decimal("50.00"),
            status="pending"
        )
        return self.repository.create_payment(balance_payment)
