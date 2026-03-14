import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error
import joblib
import os

class ModelTrainer:
    def __init__(self):
        self.data_dir = "data/processed"
        self.model_dir = "ml_worker/models"
        os.makedirs(self.model_dir, exist_ok=True)

    def prepare_data(self, df):
        """Prepare features and target for training."""
        # Define features (avoid future leaks)
        features = [
            'Open', 'High', 'Low', 'Close', 'Volume',
            'SMA_20', 'SMA_50', 'EMA_20', 'MACD', 'MACD_Signal', 'MACD_Diff',
            'RSI', 'BB_High', 'BB_Low', 'ATR', 'OBV'
        ]
        
        X = df[features]
        y_direction = df['Target_Direction']
        y_price = df['Target_NextDay_Price']
        
        return X, y_direction, y_price

    def train_baseline_xgboost(self, ticker):
        """Train a baseline XGBoost model for directional prediction."""
        file_path = os.path.join(self.data_dir, f"{ticker}_features.csv")
        if not os.path.exists(file_path):
            print(f"Data not found for {ticker}")
            return
            
        df = pd.read_csv(file_path, index_col=0, parse_dates=True)
        X, y_dir, y_price = self.prepare_data(df)
        
        # Split data chronologically (important for time series)
        split_idx = int(len(df) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y_dir.iloc[:split_idx], y_dir.iloc[split_idx:]
        
        print(f"Training XGBoost for {ticker}...")
        model = xgb.XGBClassifier(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=5,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Accuracy for {ticker}: {accuracy:.4f}")
        print(classification_report(y_test, y_pred))
        
        # Save model
        model_path = os.path.join(self.model_dir, f"{ticker}_xgboost.joblib")
        joblib.dump(model, model_path)
        print(f"Saved model to {model_path}")

    def train_all_tickers(self):
        """Train models for all tickers found in processed data."""
        for filename in os.listdir(self.data_dir):
            if filename.endswith("_features.csv"):
                ticker = filename.replace("_features.csv", "")
                self.train_baseline_xgboost(ticker)

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train_all_tickers()
