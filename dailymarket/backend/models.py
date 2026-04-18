from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)
    company_name = Column(String)
    added_at = Column(DateTime, default=datetime.utcnow)