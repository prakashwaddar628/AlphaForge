from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np

class SentimentAnalyzer:
    def __init__(self):
        self.model_name = "ProsusAI/finbert"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        
    def analyze_text(self, text):
        """Analyze financial sentiment of a given text."""
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        outputs = self.model(**inputs)
        
        # Softmax to get probabilities
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        probs = probs.detach().numpy()[0]
        
        # Labels: 0 -> positive, 1 -> negative, 2 -> neutral
        sentiment_map = {0: "positive", 1: "negative", 2: "neutral"}
        label_idx = np.argmax(probs)
        
        return {
            "label": sentiment_map[label_idx],
            "score": float(probs[label_idx]),
            "positive": float(probs[0]),
            "negative": float(probs[1]),
            "neutral": float(probs[2])
        }

    def analyze_news_batch(self, news_items):
        """Analyze a list of news headlines/snippets."""
        results = []
        for item in news_items:
            sentiment = self.analyze_text(item['text'])
            results.append({
                "ticker": item.get('ticker'),
                "timestamp": item.get('timestamp'),
                "headline": item['text'],
                "sentiment": sentiment
            })
        return results

if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    sample_news = [
        {"ticker": "RELIANCE.NS", "text": "Reliance reports record profit as retail and telecom businesses thrive.", "timestamp": "2024-03-14T10:00:00"},
        {"ticker": "INFY.NS", "text": "Infosys shares plunge as growth guidance misses analyst estimates.", "timestamp": "2024-03-14T11:00:00"}
    ]
    results = analyzer.analyze_news_batch(sample_news)
    for res in results:
        print(f"Ticker: {res['ticker']} | Sentiment: {res['sentiment']['label']} ({res['sentiment']['score']:.2f})")
