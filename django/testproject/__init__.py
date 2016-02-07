from __future__ import absolute_import
import os

if not 'DJANGO_DEV' in os.environ:

    # This will make sure the app is always imported when
    # Django starts so that shared_task will use this app.
    from .celery import app as celery_app  # noqa
    