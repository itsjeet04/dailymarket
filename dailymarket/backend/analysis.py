import yfinance as yf
import pandas as pd

def get_stock_info(ticker: str):
    stock = yf.Ticker(ticker)
    info = stock.info
    return {
        "ticker": ticker.upper(),
        "company_name": info.get("longName", "N/A"),
        "current_price": info.get("currentPrice", 0),
        "change_percent": info.get("52WeekChange", 0),
        "market_cap": info.get("marketCap", 0),
        "volume": info.get("volume", 0),
        "sector": info.get("sector", "N/A"),
    }

def get_stock_history(ticker: str, period: str = "1mo"):
    stock = yf.Ticker(ticker)
    history = stock.history(period=period)
    
    # convert to list of dicts for JSON response
    data = []
    for date, row in history.iterrows():
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": row["Volume"],
        })
    return data

def get_stock_analysis(ticker: str):
    stock = yf.Ticker(ticker)
    history = stock.history(period="3mo")
    
    # pandas calculating moving averages
    history["MA7"] = history["Close"].rolling(window=7).mean()
    history["MA30"] = history["Close"].rolling(window=30).mean()

    latest = history.iloc[-1]  # get last row

    # trend signal logic
    if latest["MA7"] > latest["MA30"]:
        signal = "BULLISH "
    else:
        signal = "BEARISH "

    data = []
    for date, row in history.iterrows():
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(row["Close"], 2),
            "MA7": round(row["MA7"], 2) if not pd.isna(row["MA7"]) else None,
            "MA30": round(row["MA30"], 2) if not pd.isna(row["MA30"]) else None,
        })

    return {
        "signal": signal,
        "MA7": round(latest["MA7"], 2),
        "MA30": round(latest["MA30"], 2),
        "data": data
    }

def get_comparison(ticker1: str, ticker2: str):
    result = {}
    for ticker in [ticker1.strip(), ticker2.strip()]:
        try:
            stock = yf.Ticker(ticker)
            history = stock.history(period="1mo")
            
            # check if data is empty
            if history.empty:
                result[ticker.upper()] = []
                continue
                
            data = []
            for date, row in history.iterrows():
                data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "close": round(row["Close"], 2),
                })
            result[ticker.upper()] = data
        except Exception as e:
            result[ticker.upper()] = []
    return result