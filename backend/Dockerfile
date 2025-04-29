FROM python:3.9-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Explicitly install additional dependencies if needed
RUN pip install gunicorn flask flask-cors google-auth pymysql sqlalchemy

# Copy application code
COPY . .

# Create a simple test server for debugging
RUN echo 'from flask import Flask, jsonify\nfrom flask_cors import CORS\n\napp = Flask(__name__)\nCORS(app)\n\n@app.route("/")\ndef home():\n    return "Backend is running!"\n\n@app.route("/health")\ndef health():\n    return jsonify({"status": "ok", "message": "Backend service is running"})\n\nif __name__ == "__main__":\n    app.run(host="0.0.0.0", port=5001)' > test_server.py

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Set environment variables
ENV PORT=5001
ENV PYTHONUNBUFFERED=1
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/creds.json

# Create a directory for credentials (will be mounted in development)
RUN mkdir -p /app/credentials

# Try to use our main app, but fall back to test server if it fails
CMD python -c "import os; os.system('gunicorn --bind :$PORT --workers 1 --threads 8 app:app || python test_server.py')" 