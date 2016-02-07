from __future__ import absolute_import
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "testproject.settings")
app = Celery('testproject')
def apps():
    from django.conf import settings
    return [djapp for djapp in settings.INSTALLED_APPS if djapp != "testproject"]
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(apps)