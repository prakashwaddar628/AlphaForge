import pandas as pd
import numpy as np
import os
import ta

class FeatureEngineer:
    def __init__(self):
        self.raw_data_dir = "data/raw"
        self.processed_data_dir = "data/processed"
        os.makedirs(self.processed_data_dir, exist_ok=True)

    def calculate_technical_indicators(self, df):
        """Add technical indicators to the dataframe."""
        # Ensure data is sorted by date
        df = df.sort_index()
        
        # Trend Indicators
        df['SMA_20'] = ta.trend.sma_indicator(df['Close'], window=20)
        df['SMA_50'] = ta.trend.sma_indicator(df['Close'], window=50)
        df['EMA_20'] = ta.trend.ema_indicator(df['Close'], window=20)
        
        # MACD
        macd = ta.trend.MACD(df['Close'])
        df['MACD'] = macd.macd()
        df['MACD_Signal'] = macd.macd_signal()
        df['MACD_Diff'] = macd.macd_diff()
        
        # Momentum Indicators
        df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
        
        # Volatility Indicators
        bollinger = ta.volatility.BollingerBands(df['Close'])
        df['BB_High'] = bollinger.bollinger_hband()
        df['BB_Low'] = bollinger.bollinger_lband()
        df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'])
        
        # Volume Indicators
        df['OBV'] = ta.volume.on_balance_volume(df['Close'], df['Volume'])
        
        # Target variable: Next day's price change (directional)
        df['Target_NextDay_Price'] = df['Close'].shift(-1)
        df['Target_Direction'] = (df['Target_NextDay_Price'] > df['Close']).astype(int)
        
        # Drop rows with NaN values (resulting from indicators)
        df = df.dropna()
        return df

    def process_all_files(self):
        """Process all raw data files and save features."""
        for filename in os.listdir(self.raw_data_dir):
            if filename.endswith(".csv"):
                print(f"Processing features for {filename}...")
                file_path = os.path.join(self.raw_data_dir, filename)
                
                # yfinance sometimes saves multi-level headers. Let's fix that.
                # Read first few lines to detect header issues
                try:
                    df = pd.read_csv(file_path, index_col=0, header=[0, 1])
                    if isinstance(df.columns, pd.MultiIndex):
                        df.columns = df.columns.get_level_values(0)
                        df.index.name = "Date"
                except:
                    # Fallback to simple read if multi-header fails
                    df = pd.read_csv(file_path, index_col=0, parse_dates=True)

                # Ensure index is datetime
                df.index = pd.to_datetime(df.index, errors='coerce')
                df = df[df.index.notnull()]
                
                # Convert all columns to numeric to avoid DataError
                for col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                
                df = df.dropna(subset=['Close', 'High', 'Low', 'Open'])
                    
                processed_df = self.calculate_technical_indicators(df)
                
                output_path = os.path.join(self.processed_data_dir, filename.replace("_historical.csv", "_features.csv"))
                processed_df.to_csv(output_path)
                print(f"Saved features to {output_path}")

if __name__ == "__main__":
    engineer = FeatureEngineer()
    engineer.process_all_files()
