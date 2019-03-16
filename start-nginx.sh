
set -e

if [ -z $BASIC_AUTH_USERNAME ]; then
  echo >&2 "BASIC_AUTH_USERNAME must be set"
  exit 1
fi

if [ -z $BASIC_AUTH_PASSWORD ]; then
  echo >&2 "BASIC_AUTH_PASSWORD must be set"
  exit 1
fi

htpasswd -bc /etc/nginx/.htpasswd $BASIC_AUTH_USERNAME $BASIC_AUTH_PASSWORD

envsubst "\$RIPPY_DJANGO_HOST \$RIPPY_VNC_HOST" < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
