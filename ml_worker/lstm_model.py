import pandas as pd
import numpy as np
import os
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, Dataset
import joblib

class PriceDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32)
        
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, i):
        return self.X[i], self.y[i]

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

class LSTMTrainer:
    def __init__(self, ticker):
        self.ticker = ticker
        self.data_path = f"data/processed/{ticker}_features.csv"
        self.model_dir = "ml_worker/models"
        os.makedirs(self.model_dir, exist_ok=True)
        self.lookback = 60
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def prepare_data(self):
        df = pd.read_csv(self.data_path, index_col=0, parse_dates=True)
        # Select key features for price prediction
        features = ['Close', 'SMA_20', 'EMA_20', 'RSI', 'MACD', 'ATR', 'OBV']
        data = df[features].values
        
        scaler = MinMaxScaler()
        data_scaled = scaler.fit_transform(data)
        
        X, y = [], []
        for i in range(self.lookback, len(data_scaled)):
            X.append(data_scaled[i-self.lookback:i])
            y.append(data_scaled[i, 0]) # Predicting Close
            
        X, y = np.array(X), np.array(y)
        
        split = int(0.8 * len(X))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]
        
        return X_train, X_test, y_train, y_test, scaler

    def train(self, epochs=20):
        X_train, X_test, y_train, y_test, scaler = self.prepare_data()
        
        train_loader = DataLoader(PriceDataset(X_train, y_train), batch_size=32, shuffle=True)
        
        model = LSTMModel(input_size=X_train.shape[2], hidden_size=64, num_layers=2, output_size=1).to(self.device)
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        model.train()
        for epoch in range(epochs):
            for batch_X, batch_y in train_loader:
                batch_X, batch_y = batch_X.to(self.device), batch_y.to(self.device)
                outputs = model(batch_X)
                loss = criterion(outputs, batch_y.unsqueeze(1))
                
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            
            if (epoch+1) % 5 == 0:
                print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}")
        
        # Save model and scaler
        torch.save(model.state_dict(), os.path.join(self.model_dir, f"{self.ticker}_lstm.pth"))
        joblib.dump(scaler, os.path.join(self.model_dir, f"{self.ticker}_scaler.joblib"))
        print(f"Model saved for {self.ticker}")

if __name__ == "__main__":
    for ticker in ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]:
        print(f"Training LSTM for {ticker}...")
        trainer = LSTMTrainer(ticker)
        trainer.train()
