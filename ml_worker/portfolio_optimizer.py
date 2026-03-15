import pandas as pd
import numpy as np
from scipy.optimize import minimize
import os

class PortfolioOptimizer:
    def __init__(self, tickers=None):
        self.tickers = tickers or ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
        self.data_dir = "data/processed"
        self.data = self._load_data()

    def _load_data(self):
        """Load processed Close prices for all tickers into a single DataFrame."""
        prices = {}
        for ticker in self.tickers:
            file_path = os.path.join(self.data_dir, f"{ticker}_features.csv")
            if os.path.exists(file_path):
                df = pd.read_csv(file_path, index_col=0, parse_dates=True)
                prices[ticker] = df['Close']
        return pd.DataFrame(prices).dropna()

    def calculate_metrics(self, weights):
        """Calculate annualized return, volatility, and Sharpe Ratio."""
        returns = self.data.pct_change().dropna()
        port_return = np.sum(returns.mean() * weights) * 252
        port_volatility = np.sqrt(np.dot(weights.T, np.dot(returns.cov() * 252, weights)))
        sharpe_ratio = port_return / port_volatility if port_volatility != 0 else 0
        return port_return, port_volatility, sharpe_ratio

    def _neg_sharpe_ratio(self, weights):
        """Negative Sharpe Ratio for minimization."""
        return -self.calculate_metrics(weights)[2]

    def _portfolio_volatility(self, weights):
        """Returns portfolio volatility."""
        return self.calculate_metrics(weights)[1]

    def optimize_sharpe(self):
        """Find the portfolio with the maximum Sharpe Ratio."""
        num_assets = len(self.tickers)
        args = ()
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1}) # Weights sum to 1
        bounds = tuple((0, 1) for _ in range(num_assets)) # Long-only
        initial_guess = num_assets * [1. / num_assets,]

        result = minimize(self._neg_sharpe_ratio, initial_guess, args=args,
                          method='SLSQP', bounds=bounds, constraints=constraints)
        
        if result.success:
            optimal_weights = result.x
            ret, vol, sharpe = self.calculate_metrics(optimal_weights)
            return {
                "weights": dict(zip(self.tickers, optimal_weights)),
                "expected_return": ret,
                "volatility": vol,
                "sharpe_ratio": sharpe
            }
        return None

    def optimize_min_volatility(self):
        """Find the portfolio with the minimum volatility."""
        num_assets = len(self.tickers)
        args = ()
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
        bounds = tuple((0, 1) for _ in range(num_assets))
        initial_guess = num_assets * [1. / num_assets,]

        result = minimize(self._portfolio_volatility, initial_guess, args=args,
                          method='SLSQP', bounds=bounds, constraints=constraints)
        
        if result.success:
            optimal_weights = result.x
            ret, vol, sharpe = self.calculate_metrics(optimal_weights)
            return {
                "weights": dict(zip(self.tickers, optimal_weights)),
                "expected_return": ret,
                "volatility": vol,
                "sharpe_ratio": sharpe
            }
        return None

if __name__ == "__main__":
    optimizer = PortfolioOptimizer()
    print("Max Sharpe Portfolio:")
    print(optimizer.optimize_sharpe())
    print("\nMin Volatility Portfolio:")
    print(optimizer.optimize_min_volatility())
