import os
gettext = lambda s: s
DATA_DIR = os.path.dirname(os.path.dirname(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '+zqs41e&00r0he-fucf+x(@4@4^&ig7_dmv182i4ui3ntxn2h6'

DEBUG = 'DJANGO_DEV' in os.environ

ALLOWED_HOSTS = ['.elasticbeanstalk.com']

ROOT_URLCONF = 'testproject.urls'

WSGI_APPLICATION = 'testproject.wsgi.application'

LANGUAGE_CODE = 'en'

TIME_ZONE = 'Europe/Oslo'

USE_I18N = True

USE_L10N = True

USE_TZ = True

MEDIA_ROOT = os.path.join(DATA_DIR, 'media')
STATIC_ROOT = os.path.join(DATA_DIR, 'static')

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'testproject', 'static'),
)
SITE_ID = 1

if 'RDS_DB_NAME' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ['RDS_DB_NAME'],
            'USER': os.environ['RDS_DB_USERNAME'],
            'PASSWORD': os.environ['RDS_DB_PASSWORD'],
            'HOST': os.environ['RDS_DB_HOST'],
            'PORT': os.environ['RDS_DB_PORT']
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(DATA_DIR, 'django.db'),
        }
    }

if 'ELASTICSEARCH_ENDPOINT' in os.environ:
    HAYSTACK_CONNECTIONS = {
        'default': {
            'ENGINE': 'haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine',
            'URL': 'http://%s:9200/' % os.environ['ELASTICSEARCH_ENDPOINT'],
            'INDEX_NAME': 'haystack'
        }
    }

    HAYSTACK_SIGNAL_PROCESSOR = 'haystack.signals.RealtimeSignalProcessor'
    HAYSTACK_SEARCH_RESULTS_PER_PAGE = 40
else:
    HAYSTACK_CONNECTIONS = {
        'default': {
            'ENGINE': 'haystack.backends.simple_backend.SimpleEngine'
        }
    }

if 'REDIS_ID' in os.environ:
    import boto3
    boto3.setup_default_session(region_name=os.environ['AWS_REGION'])
    client = boto3.client('elasticache')
    response = client.describe_cache_clusters(
        CacheClusterId=os.environ['REDIS_ID'],
        ShowCacheNodeInfo=True
    )
    redis_info = response['CacheClusters'][0]['CacheNodes'][0]['Endpoint']
    
    BROKER_URL = 'redis://%s:%i/0' % (redis_info['Address'], redis_info['Port'])
else:
    BROKER_URL = 'dummy://'

if 'MEMCACHE_ENDPOINT' in os.environ:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': '%s:%s' % (os.environ['MEMCACHE_ENDPOINT'], os.environ['MEMCACHE_PORT'])
        }
    }

if 'AWS_STORAGE_BUCKET_NAME' in os.environ:

    AWS_STORAGE_BUCKET_NAME = os.environ['AWS_STORAGE_BUCKET_NAME']
    AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME
    AWS_S3_HOST = 's3-%s.amazonaws.com' % os.environ['AWS_REGION']

    STATICFILES_LOCATION = 'static'
    MEDIAFILES_LOCATION = 'media'

    STATICFILES_STORAGE = 'testproject.custom_storages.StaticStorage'
    DEFAULT_FILE_STORAGE = 'testproject.custom_storages.MediaStorage'

    STATIC_URL = "https://%s/%s/" % (AWS_S3_CUSTOM_DOMAIN, STATICFILES_LOCATION)
    MEDIA_URL = "https://%s/%s/" % (AWS_S3_CUSTOM_DOMAIN, MEDIAFILES_LOCATION)
else:
    STATIC_URL = '/static/'
    MEDIA_URL = '/media/'

TEMPLATES = [
    {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [os.path.join(BASE_DIR, 'testproject', 'templates')],
    'OPTIONS': {
        'context_processors': [
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
            'django.core.context_processors.i18n',
            'django.core.context_processors.debug',
            'django.core.context_processors.request',
            'django.core.context_processors.media',
            'django.core.context_processors.csrf',
            'django.core.context_processors.tz',
            'sekizai.context_processors.sekizai',
            'django.core.context_processors.static',
            'cms.context_processors.cms_settings'
        ],
        'loaders': [
            'django.template.loaders.filesystem.Loader',
            'django.template.loaders.app_directories.Loader',
            'django.template.loaders.eggs.Loader'
        ]
        }
    }
]

MIDDLEWARE_CLASSES = (
    'cms.middleware.utils.ApphookReloadMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',
    'cms.middleware.language.LanguageCookieMiddleware'
)

INSTALLED_APPS = (
    'djangocms_admin_style',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.admin',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django.contrib.staticfiles',
    'django.contrib.messages',
    'cms',
    'menus',
    'sekizai',
    'treebeard',
    'djangocms_text_ckeditor',
    'djangocms_style',
    'djangocms_column',
    'filer',
    'easy_thumbnails',
    'cmsplugin_filer_image',
    'cmsplugin_filer_file',
    'cmsplugin_filer_folder',
    'cmsplugin_filer_teaser',
    'cmsplugin_filer_utils',
    'cmsplugin_filer_video',
    'djangocms_flash',
    'djangocms_googlemap',
    'djangocms_inherit',
    'djangocms_link',
    'testproject',
    'storages',
    'widget_tweaks',
    'post_office',
    'djcelery',
    'haystack',
    'smuggler'
)

LANGUAGES = (
    ('en', gettext('English')),
)

CMS_LANGUAGES = {
    'default': {
        'public': True,
        'hide_untranslated': False,
        'redirect_on_fallback': True,
    },
    1: [
        {
            'public': True,
            'code': 'en',
            'hide_untranslated': False,
            'name': gettext('English'),
            'redirect_on_fallback': True,
        },
    ],
}

CMS_TEMPLATES = (
    ('page.html', 'Page'),
    ('feature.html', 'Page with Feature')
)

CMS_PERMISSION = True

CMS_PLACEHOLDER_CONF = {}

MIGRATION_MODULES = {
    'cmsplugin_filer_image': 'cmsplugin_filer_image.migrations_django',
    'cmsplugin_filer_file': 'cmsplugin_filer_file.migrations_django',
    'cmsplugin_filer_folder': 'cmsplugin_filer_folder.migrations_django',
    'cmsplugin_filer_video': 'cmsplugin_filer_video.migrations_django',
    'cmsplugin_filer_teaser': 'cmsplugin_filer_teaser.migrations_django'
}

THUMBNAIL_PROCESSORS = (
    'easy_thumbnails.processors.colorspace',
    'easy_thumbnails.processors.autocrop',
    'filer.thumbnail_processors.scale_and_crop_with_subject_location',
    'easy_thumbnails.processors.filters'
)

import djcelery
djcelery.setup_loader()