import yfinance as yf
import pandas as pd
import os
from datetime import datetime, timedelta

class DataFetcher:
    def __init__(self, tickers=None):
        self.tickers = tickers or ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
        self.data_dir = "data/raw"
        os.makedirs(self.data_dir, exist_ok=True)

    def fetch_historical_data(self, period="2y", interval="1d"):
        """Fetch historical OHLC data for the tickers."""
        print(f"Fetching historical data for {len(self.tickers)} tickers...")
        for ticker in self.tickers:
            try:
                data = yf.download(ticker, period=period, interval=interval)
                if not data.empty:
                    file_path = os.path.join(self.data_dir, f"{ticker}_historical.csv")
                    data.to_csv(file_path)
                    print(f"Saved {ticker} data to {file_path}")
                else:
                    print(f"No data found for {ticker}")
            except Exception as e:
                print(f"Error fetching data for {ticker}: {e}")

    def fetch_real_time_quote(self, ticker):
        """Fetch current price for a specific ticker."""
        try:
            stock = yf.Ticker(ticker)
            quote = stock.fast_info
            return {
                "ticker": ticker,
                "price": quote.last_price,
                "change": quote.day_high - quote.day_low, # Rough estimate
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching real-time quote for {ticker}: {e}")
            return None

if __name__ == "__main__":
    fetcher = DataFetcher()
    fetcher.fetch_historical_data()
