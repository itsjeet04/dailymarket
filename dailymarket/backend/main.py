from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models, schemas
from analysis import get_stock_info, get_stock_history, get_stock_analysis, get_comparison

# creates all DB tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stock Dashboard API")

# allow Next.js frontend to talk to backend (like cors in express)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dailymarket-production-fd52.up.railway.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# health check
@app.get("/")
def root():
    return {"message": "Stock Dashboard API is running!"}

#  stock info
@app.get("/stock/{ticker}")
def stock_info(ticker: str):
    try:
        return get_stock_info(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock not found: {str(e)}")

# get stock price history for charts
@app.get("/stock/{ticker}/history")
def stock_history(ticker: str, period: str = "1mo"):
    try:
        return get_stock_history(ticker, period)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

# get moving averages + trend signal
@app.get("/stock/{ticker}/analysis")
def stock_analysis(ticker: str):
    try:
        return get_stock_analysis(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

# compare 2 stocks
@app.get("/compare")
def compare_stocks(a: str, b: str):
    try:
        return get_comparison(a, b)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

# add stock to watchlist
@app.post("/watchlist", response_model=schemas.WatchlistResponse)
def add_to_watchlist(item: schemas.WatchlistCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Watchlist).filter(models.Watchlist.ticker == item.ticker.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Stock already in watchlist")
    db_item = models.Watchlist(ticker=item.ticker.upper(), company_name=item.company_name)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

#  get all watchlist stocks
@app.get("/watchlist", response_model=list[schemas.WatchlistResponse])
def get_watchlist(db: Session = Depends(get_db)):
    return db.query(models.Watchlist).all()

#  delete from watchlist
@app.delete("/watchlist/{ticker}")
def remove_from_watchlist(ticker: str, db: Session = Depends(get_db)):
    item = db.query(models.Watchlist).filter(models.Watchlist.ticker == ticker.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock not found in watchlist")
    db.delete(item)
    db.commit()
    return {"message": f"{ticker.upper()} removed from watchlist"}