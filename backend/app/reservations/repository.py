from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.reservations.models import Reservation, Payment, Charge, Channel

class ReservationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_reservation(self, reservation: Reservation) -> Reservation:
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        return reservation

    def get_reservation_by_id(self, reservation_id: UUID) -> Optional[Reservation]:
        return self.session.get(Reservation, reservation_id)

    def get_reservations(self, skip: int = 0, limit: int = 100) -> List[Reservation]:
        return self.session.exec(select(Reservation).offset(skip).limit(limit)).all()

    def update_reservation(self, reservation_id: UUID, reservation_data: dict) -> Optional[Reservation]:
        db_reservation = self.get_reservation_by_id(reservation_id)
        if not db_reservation:
            return None
        for key, value in reservation_data.items():
            if value is not None:
                setattr(db_reservation, key, value)
        self.session.add(db_reservation)
        self.session.commit()
        self.session.refresh(db_reservation)
        return db_reservation

    def delete_reservation(self, reservation_id: UUID) -> bool:
        db_reservation = self.get_reservation_by_id(reservation_id)
        if not db_reservation:
            return False
        self.session.delete(db_reservation)
        self.session.commit()
        return True

    def create_payment(self, payment: Payment) -> Payment:
        self.session.add(payment)
        self.session.commit()
        self.session.refresh(payment)
        return payment

    def get_payment_by_id(self, payment_id: UUID) -> Optional[Payment]:
        return self.session.get(Payment, payment_id)

    def get_payments(self, skip: int = 0, limit: int = 100) -> List[Payment]:
        return self.session.exec(select(Payment).offset(skip).limit(limit)).all()

    def update_payment(self, payment_id: UUID, payment_data: dict) -> Optional[Payment]:
        db_payment = self.get_payment_by_id(payment_id)
        if not db_payment:
            return None
        for key, value in payment_data.items():
            if value is not None:
                setattr(db_payment, key, value)
        self.session.add(db_payment)
        self.session.commit()
        self.session.refresh(db_payment)
        return db_payment

    def delete_payment(self, payment_id: UUID) -> bool:
        db_payment = self.get_payment_by_id(payment_id)
        if not db_payment:
            return False
        self.session.delete(db_payment)
        self.session.commit()
        return True

    def create_charge(self, charge: Charge) -> Charge:
        self.session.add(charge)
        self.session.commit()
        self.session.refresh(charge)
        return charge

    def create_channel(self, channel: Channel) -> Channel:
        self.session.add(channel)
        self.session.commit()
        self.session.refresh(channel)
        return channel

    def get_channels(self) -> List[Channel]:
        return self.session.exec(select(Channel)).all()
