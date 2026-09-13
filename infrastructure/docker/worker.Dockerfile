FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# In development, code is mounted as volume
CMD ["python", "-m", "apps.worker.main"]
