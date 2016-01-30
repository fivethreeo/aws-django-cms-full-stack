from django.conf import settings
from storages.backends.s3boto import S3BotoStorage

class S3Storage(S3BotoStorage):
    @property
    def connection(self):
        if self._connection is None:
            self._connection = self.connection_class(
                self.access_key, self.secret_key,
                calling_format=self.calling_format, host=settings.AWS_S3_HOST)
        return self._connection

class StaticStorage(S3Storage):
    location = settings.STATICFILES_LOCATION

class MediaStorage(S3Storage):
    location = settings.MEDIAFILES_LOCATION
