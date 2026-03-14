import joblib
import os
import pandas as pd
import numpy as np

class PredictionEngine:
    def __init__(self):
        self.model_dir = "ml_worker/models"
        self.models = {}
        self.load_models()

    def load_models(self):
        """Load all available models."""
        if not os.path.exists(self.model_dir):
            return
            
        for filename in os.listdir(self.model_dir):
            if filename.endswith("_xgboost.joblib"):
                ticker = filename.replace("_xgboost.joblib", "")
                self.models[ticker] = joblib.load(os.path.join(self.model_dir, filename))
                print(f"Loaded model for {ticker}")

    def predict_direction(self, ticker, features):
        """Predict market direction for a ticker given current features."""
        if ticker not in self.models:
            return None
            
        model = self.models[ticker]
        # features list must match training features
        feature_names = [
            'Open', 'High', 'Low', 'Close', 'Volume',
            'SMA_20', 'SMA_50', 'EMA_20', 'MACD', 'MACD_Signal', 'MACD_Diff',
            'RSI', 'BB_High', 'BB_Low', 'ATR', 'OBV'
        ]
        
        # Convert to DataFrame for model
        X = pd.DataFrame([features], columns=feature_names)
        
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        return {
            "prediction": "UP" if prediction == 1 else "DOWN",
            "probability": float(probability[prediction]),
            "timestamp": pd.Timestamp.now().isoformat()
        }
