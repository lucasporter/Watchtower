from celery import Celery
from app.core.config import settings

# Create Celery instance
celery = Celery(
    "watchtower",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks"]
)

# Configure Celery
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Optional: Add some basic tasks
@celery.task
def ping_task():
    """Simple ping task for testing Celery"""
    return "pong"

@celery.task
def health_check_task():
    """Health check task"""
    return {"status": "healthy"}
