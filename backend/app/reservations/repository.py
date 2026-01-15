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

    def create_payment(self, payment: Payment) -> Payment:
        self.session.add(payment)
        self.session.commit()
        self.session.refresh(payment)
        return payment

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
