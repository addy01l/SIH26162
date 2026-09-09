FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libgdal-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Typically ml-engine can be run as a cron job or just an API. We'll leave it 
# as a script that runs the training loop, then exits. In a real system this 
# might be an API or a periodic task.
CMD ["python", "train.py"]
