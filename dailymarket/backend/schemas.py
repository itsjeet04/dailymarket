from pydantic import BaseModel
from datetime import datetime

class WatchlistCreate(BaseModel):
    ticker: str
    company_name: str

class WatchlistResponse(BaseModel):
    id: int
    ticker: str
    company_name: str
    added_at: datetime

    class Config:
        from_attributes = True

# Basically schemas.py = validation layer — same as when you validate req.body in Express.
