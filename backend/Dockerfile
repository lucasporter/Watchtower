# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update \
 && apt-get install -y gcc libpq-dev iputils-ping \
 && rm -rf /var/lib/apt/lists/*

# Copy everything in this folder (requirements, app/, alembic/, etc.)
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose uvicorn port
EXPOSE 8080

# Launch the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
