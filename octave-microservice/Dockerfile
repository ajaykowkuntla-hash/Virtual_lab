FROM ubuntu:22.04

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install GNU Octave, gnuplot, and Python
RUN apt-get update && \
    apt-get install -y octave gnuplot python3 python3-pip gcc g++ default-jdk && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the microservice code
COPY main.py .

# Expose port for FastAPI (documentation only, Render dynamically assigns PORT)
EXPOSE 8000

# Run the FastAPI server using the PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
