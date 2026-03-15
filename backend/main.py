from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import os

from .prediction_engine import PredictionEngine
from .signal_engine import SignalEngine
from ml_worker.portfolio_optimizer import PortfolioOptimizer

app = FastAPI(title="AlphaForge API", description="AI-powered Stock Market Intelligence API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
prediction_engine = PredictionEngine()
signal_engine = SignalEngine()
portfolio_optimizer = PortfolioOptimizer()

class MarketData(BaseModel):
    ticker: str
    features: dict

class PredictionResponse(BaseModel):
    ticker: str
    prediction: str
    probability: float
    signal: str

@app.get("/")
async def root():
    return {"message": "Welcome to AlphaForge API", "status": "online"}

@app.get("/tickers")
async def get_available_tickers():
    return {"tickers": list(prediction_engine.models.keys())}

@app.get("/analyze/{ticker}")
async def analyze_ticker(ticker: str):
    # In a real app, this would fetch the latest features from a DB/Cache
    # For now, we'll try to load the last row from processed CSV
    file_path = f"data/processed/{ticker}_features.csv"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no features available.")
    
    df = pd.read_csv(file_path, index_col=0, parse_dates=True)
    latest_features_row = df.iloc[-1]
    
    feature_names = [
        'Open', 'High', 'Low', 'Close', 'Volume',
        'SMA_20', 'SMA_50', 'EMA_20', 'MACD', 'MACD_Signal', 'MACD_Diff',
        'RSI', 'BB_High', 'BB_Low', 'ATR', 'OBV'
    ]
    
    features_dict = latest_features_row[feature_names].to_dict()
    
    # Get prediction
    prediction = prediction_engine.predict_direction(ticker, features_dict)
    
    # Mock sentiment for now
    sentiment_score = 0.2 
    
    # Generate signal
    signal = signal_engine.generate_signal(features_dict, sentiment_score, prediction)
    
    # Get concrete price target
    price_target = prediction_engine.predict_price_target(ticker)
    
    return {
        "ticker": ticker,
        "last_close": float(latest_features_row['Close']),
        "technicals": features_dict,
        "prediction": prediction,
        "price_target": price_target,
        "signal": signal,
        "sentiment_score": sentiment_score
    }

@app.get("/optimize")
async def optimize_portfolio(method: str = "sharpe"):
    """
    Optimize portfolio based on the requested method ('sharpe' or 'min_vol').
    """
    if method == "sharpe":
        result = portfolio_optimizer.optimize_sharpe()
    elif method == "min_vol":
        result = portfolio_optimizer.optimize_min_volatility()
    else:
        raise HTTPException(status_code=400, detail="Invalid optimization method. Use 'sharpe' or 'min_vol'.")
    
    if not result:
        raise HTTPException(status_code=500, detail="Portfolio optimization failed.")
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
