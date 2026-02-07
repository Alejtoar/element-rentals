from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.reservations.models import Channel

class ChannelRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, channel_id: UUID) -> Optional[Channel]:
        return self.session.get(Channel, channel_id)

    def get_all(self, offset: int = 0, limit: int = 100) -> List[Channel]:
        statement = select(Channel).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())

    def create(self, channel: Channel) -> Channel:
        self.session.add(channel)
        self.session.commit()
        self.session.refresh(channel)
        return channel

    def update(self, channel: Channel) -> Channel:
        self.session.add(channel)
        self.session.commit()
        self.session.refresh(channel)
        return channel

    def delete(self, channel: Channel) -> None:
        self.session.delete(channel)
        self.session.commit()
