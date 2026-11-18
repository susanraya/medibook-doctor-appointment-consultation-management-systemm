"""The Celery application for the Notification Worker.

The worker is its own container in the architecture (depends on `queue`,
`db` and `email`) but shares this codebase. A sprint ticket defines its jobs
by importing `celery_app` here, decorating them with `@celery_app.task`, and
keeping each job idempotent (the architecture's queue is Redis, which can
redeliver). The worker then runs as `celery -A app.celery_app worker`.

No tasks are registered yet -- this module only wires the broker so the
sprint has somewhere to put them.
"""

import os

from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("medibook", broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
