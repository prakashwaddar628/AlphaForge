class SignalEngine:
    def __init__(self):
        pass

    def generate_signal(self, technicals, sentiment_score, prediction):
        """
        Generate a trading signal based on multiple inputs.
        technicals: dict with RSI, MACD, etc.
        sentiment_score: float (-1 to 1)
        prediction: dict from PredictionEngine
        """
        rsi = technicals.get('RSI', 50)
        macd_diff = technicals.get('MACD_Diff', 0)
        
        # Scoring components
        score = 0
        
        # RSI signals
        if rsi < 30:
            score += 2 # Oversold - Bullish
        elif rsi > 70:
            score -= 2 # Overbought - Bearish
            
        # MACD signals
        if macd_diff > 0:
            score += 1 # Bullish crossover
        elif macd_diff < 0:
            score -= 1 # Bearish crossover
            
        # Sentiment integration
        if sentiment_score > 0.5:
            score += 2
        elif sentiment_score < -0.5:
            score -= 2
            
        # Prediction integration
        if prediction and prediction['prediction'] == "UP" and prediction['probability'] > 0.6:
            score += 2
        elif prediction and prediction['prediction'] == "DOWN" and prediction['probability'] > 0.6:
            score -= 2
            
        # Final Signal
        if score >= 4:
            return "STRONG BUY"
        elif score >= 2:
            return "BUY"
        elif score <= -4:
            return "STRONG SELL"
        elif score <= -2:
            return "SELL"
        else:
            return "HOLD"
