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

    def get_reservation_by_id(self, reservation_id: UUID) -> Optional[Reservation]:
        return self.repository.get_reservation_by_id(reservation_id)

    def get_reservations(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """
        Get all reservations with total_paid calculated.
        Returns list of dictionaries instead of models to include computed field.
        """
        reservations = self.repository.get_reservations(skip=skip, limit=limit)
        result = []
        
        for reservation in reservations:
            # Calculate total_paid for this reservation
            total_paid = Decimal("0.00")
            for payment in reservation.payments:
                if payment.status == "paid":
                    total_paid += payment.amount
            
            # Convert to dict and add total_paid
            reservation_dict = {
                "id": reservation.id,
                "property_id": reservation.property_id,
                "guest_id": reservation.guest_id,
                "channel_id": reservation.channel_id,
                "reservation_type": reservation.reservation_type,
                "start_date": reservation.start_date,
                "end_date": reservation.end_date,
                "guest_count": reservation.guest_count,
                "total_amount": reservation.total_amount,
                "status": reservation.status,
                "created_at": reservation.created_at,
                "total_paid": total_paid
            }
            result.append(reservation_dict)
        
        return result

    def update_reservation(self, reservation_id: UUID, reservation_data: dict) -> Optional[Reservation]:
        return self.repository.update_reservation(reservation_id, reservation_data)

    def delete_reservation(self, reservation_id: UUID) -> bool:
        return self.repository.delete_reservation(reservation_id)

    def get_payments(self, skip: int = 0, limit: int = 100, reservation_id: Optional[UUID] = None) -> List[Payment]:
        return self.repository.get_payments(skip=skip, limit=limit, reservation_id=reservation_id)

    def get_payment_by_id(self, payment_id: UUID) -> Optional[Payment]:
        return self.repository.get_payment_by_id(payment_id)

    def update_payment(self, payment_id: UUID, payment_data: dict) -> Optional[Payment]:
        return self.repository.update_payment(payment_id, payment_data)

    def delete_payment(self, payment_id: UUID) -> bool:
        return self.repository.delete_payment(payment_id)

    def create_payment(self, payment: Payment) -> Payment:
        return self.repository.create_payment(payment)

    def create_charge(self, charge: Charge) -> Charge:
        return self.repository.create_charge(charge)

    def generate_balance_payment(self, reservation_id: UUID) -> Payment:
        reservation = self.repository.get_reservation_by_id(reservation_id)
        if not reservation:
            raise Exception("Reservation not found")
            
        # Business Rule 1.2: The remaining 50% balance must be paid before or at check-in
        # Check if balance payment already exists
        existing_payments = reservation.payments
        if any(p.payment_type == "balance" for p in existing_payments):
             # You might want to handle this differently, e.g., return the existing one or raise error
             # For now, let's just create another one if called, or we could filter.
             pass

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

    def calculate_total_paid(self, reservation_id: UUID) -> Decimal:
        """
        Calculate the total amount paid for a reservation.
        Only counts payments with status='paid'.
        
        Args:
            reservation_id: UUID of the reservation
            
        Returns:
            Decimal: Total amount paid
        """
        reservation = self.repository.get_reservation_by_id(reservation_id)
        if not reservation:
            raise Exception("Reservation not found")
        
        total_paid = Decimal("0.00")
        for payment in reservation.payments:
            if payment.status == "paid":
                total_paid += payment.amount
        
        return total_paid

    def get_financial_summary(self, reservation_id: UUID) -> dict:
        """
        Get the financial summary for a reservation.
        
        Args:
            reservation_id: UUID of the reservation
            
        Returns:
            dict: Financial summary with total_amount, total_paid, balance, is_fully_paid
        """
        reservation = self.repository.get_reservation_by_id(reservation_id)
        if not reservation:
            raise Exception("Reservation not found")
        
        total_paid = self.calculate_total_paid(reservation_id)
        balance = reservation.total_amount - total_paid
        is_fully_paid = balance <= Decimal("0.00")
        
        return {
            "total_amount": reservation.total_amount,
            "total_paid": total_paid,
            "balance": balance,
            "is_fully_paid": is_fully_paid
        }

