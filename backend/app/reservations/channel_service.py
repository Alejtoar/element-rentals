from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlmodel import Session
from app.reservations.models import Channel
from app.reservations.channel_repository import ChannelRepository
from app.reservations.channel_schemas import ChannelCreate, ChannelUpdate

class ChannelService:
    def __init__(self, session: Session):
        self.repository = ChannelRepository(session)

    def get_channel_by_id(self, channel_id: UUID) -> Channel:
        channel = self.repository.get_by_id(channel_id)
        if not channel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Channel not found"
            )
        return channel

    def get_channels(self, offset: int = 0, limit: int = 100) -> List[Channel]:
        return self.repository.get_all(offset, limit)

    def create_channel(self, channel_in: ChannelCreate) -> Channel:
        channel = Channel(**channel_in.dict())
        return self.repository.create(channel)

    def update_channel(self, channel_id: UUID, channel_in: ChannelUpdate) -> Channel:
        channel = self.get_channel_by_id(channel_id)
        update_data = channel_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(channel, key, value)
        return self.repository.update(channel)

    def delete_channel(self, channel_id: UUID) -> None:
        channel = self.get_channel_by_id(channel_id)
        self.repository.delete(channel)
