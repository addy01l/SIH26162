import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

# Setup Celery application
# Uses Redis as both the message broker and result backend
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

app = Celery(
    'fire_eye_ingestion',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['tasks']
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Schedule NASA FIRMS ingestion tasks
app.conf.beat_schedule = {
    'fetch-firms-data-every-15-mins': {
        'task': 'tasks.fetch_firms_data',
        'schedule': crontab(minute='*/15'),
    },
}

if __name__ == '__main__':
    app.start()
