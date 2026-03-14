# System Design Document

## 1. Overview
AlphaForge is built as a modular monorepo, separating data ingestion, machine learning, backend services, and frontend visualization.

## 2. Component Architecture

### 2.1 Data Layer (`data_ingestion/`)
- **Fetchers**: Python modules using `yfinance`/`nsepython` to pull raw OHLC data.
- **Processors**: Cleans and transforms raw CSVs.
- **Feature Engineering**: Vectorized calculations of technical indicators using `pandas` and `ta`.

### 2.2 Machine Learning Layer (`ml_worker/`)
- **Trainer**: XGBoost pipeline for classification.
- **Model Registry**: Stores serialized `.joblib` models.
- **Inference Module**: Loads models into memory for real-time prediction.

### 2.3 Backend Layer (`backend/`)
- **FastAPI**: Provides RESTful endpoints for the dashboard.
- **Prediction Engine**: Abstracts model inference.
- **Signal Generator**: Rule-based engine combining technical data, predictions, and sentiment.

### 2.4 Frontend Layer (`frontend/`)
- **Next.js 15 (App Router)**: Modern SSR/ISR framework.
- **Tailwind CSS**: Utility-first styling with a premium "Glassmorphism" aesthetic.
- **Recharts**: High-performance SVGs for financial charting.

## 3. Data Flow
1. **Collector** fetches data → Saves to `data/raw`.
2. **Feature Engineer** transforms raw data → Saves to `data/processed`.
3. **ML Trainer** reads processed data → Saves models to `ml_worker/models`.
4. **Backend** loads models/data → Serves `/analyze/{ticker}`.
5. **Frontend** queries Backend → Renders Dashboard.

## 4. Scalability & Deployment
- **Dockerization**: Each service is containerized for easy scaling on AWS/GCP.
- **Caching**: Future implementation of Redis for real-time signal caching.
- **Database**: PostgreSQL for historical data; MongoDB for unstructured news/social logs.
