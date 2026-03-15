import joblib
import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn

class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class PredictionEngine:
    def __init__(self):
        self.model_dir = "ml_worker/models"
        self.models = {}
        self.lstm_models = {}
        self.scalers = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.load_models()

    def load_models(self):
        """Load all available models."""
        if not os.path.exists(self.model_dir):
            return
            
        for filename in os.listdir(self.model_dir):
            if filename.endswith("_xgboost.joblib"):
                ticker = filename.replace("_xgboost.joblib", "")
                self.models[ticker] = joblib.load(os.path.join(self.model_dir, filename))
                print(f"Loaded XGBoost model for {ticker}")
            
            if filename.endswith("_lstm.pth"):
                ticker = filename.replace("_lstm.pth", "")
                # Assuming input_size 7 based on training script
                model = LSTMModel(input_size=7, hidden_size=64, num_layers=2, output_size=1)
                model.load_state_dict(torch.load(os.path.join(self.model_dir, filename), map_location=self.device))
                model.to(self.device)
                model.eval()
                self.lstm_models[ticker] = model
                print(f"Loaded LSTM model for {ticker}")
                
            if filename.endswith("_scaler.joblib"):
                ticker = filename.replace("_scaler.joblib", "")
                self.scalers[ticker] = joblib.load(os.path.join(self.model_dir, filename))

    def predict_direction(self, ticker, features):
        """Predict market direction for a ticker given current features."""
        if ticker not in self.models:
            return None
            
        model = self.models[ticker]
        feature_names = [
            'Open', 'High', 'Low', 'Close', 'Volume',
            'SMA_20', 'SMA_50', 'EMA_20', 'MACD', 'MACD_Signal', 'MACD_Diff',
            'RSI', 'BB_High', 'BB_Low', 'ATR', 'OBV'
        ]
        
        X = pd.DataFrame([features], columns=feature_names)
        
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        return {
            "prediction": "UP" if prediction == 1 else "DOWN",
            "probability": float(probability[prediction]),
            "timestamp": pd.Timestamp.now().isoformat()
        }

    def predict_price_target(self, ticker):
        """Predict concrete price target using LSTM."""
        if ticker not in self.lstm_models or ticker not in self.scalers:
            return None
            
        try:
            # Load historical data to get last 60 days
            df = pd.read_csv(f"data/processed/{ticker}_features.csv", index_col=0, parse_dates=True)
            features_list = ['Close', 'SMA_20', 'EMA_20', 'RSI', 'MACD', 'ATR', 'OBV']
            data = df[features_list].values
            
            if len(data) < 60:
                return None
                
            last_60 = data[-60:]
            scaler = self.scalers[ticker]
            scaled_data = scaler.transform(last_60)
            
            X = torch.tensor([scaled_data], dtype=torch.float32).to(self.device)
            with torch.no_grad():
                pred_scaled = self.lstm_models[ticker](X).cpu().numpy()
            
            # Inverse transform to get actual price
            # Scaler was fit on all 7 features, so we need a dummy array to inverse transform
            dummy = np.zeros((1, 7))
            dummy[0, 0] = pred_scaled[0, 0]
            pred_price = scaler.inverse_transform(dummy)[0, 0]
            
            return float(pred_price)
        except Exception as e:
            print(f"LSTM prediction failed for {ticker}: {e}")
            return None
