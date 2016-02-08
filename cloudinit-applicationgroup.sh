#!/usr/bin/env bash

# Add WSGIApplicationGroup so lxml does not time us out

if ! grep -q 'WSGIApplicationGroup %%{GLOBAL}' /opt/elasticbeanstalk/hooks/config.py ; then
  sed -i -e 's/\(WSGIProcessGroup wsgi\)/\1\nWSGIApplicationGroup %%{GLOBAL}/' /opt/elasticbeanstalk/hooks/config.py 
fi

cat /opt/elasticbeanstalk/hooks/config.py
