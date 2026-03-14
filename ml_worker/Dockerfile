FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# In a real scenario, this might run a training script or a worker process
CMD ["python", "train_model.py"]
