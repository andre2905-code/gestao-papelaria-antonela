FROM php:8.4-cli-alpine

# Dependências de sistema e extensões para Postgres e Laravel
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip pcntl bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/api

# O Compose de desenvolvimento monta o código por volume; em produção o
# código precisa estar dentro da imagem.
COPY . .
RUN composer install --prefer-dist --no-interaction --no-dev --optimize-autoloader

# Script de entrada para automação de permissões e setup
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
