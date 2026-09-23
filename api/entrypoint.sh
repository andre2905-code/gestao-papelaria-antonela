#!/bin/sh
set -e

# Garante a existência de diretórios de cache e storage
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/logs \
         bootstrap/cache

# Garante permissões adqueadas
chmod -R 777 storage bootstrap/cache

if [ ! -d "vendor" ]; then
    composer install --prefer-dist --no-interaction
fi

exec "$@"
