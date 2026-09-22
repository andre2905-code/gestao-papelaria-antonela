# ─────────────────────────────────────────────────────────────────────────────
# Laravel Backend — Desenvolvimento
# PHP 8.2 com FPM + extensões necessárias para Laravel + PostgreSQL
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.2-fpm

# ── Dependências de sistema ──────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Extensões PHP ────────────────────────────────────────────────────────────
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    xml

# ── Composer ─────────────────────────────────────────────────────────────────
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ── Diretório de trabalho ─────────────────────────────────────────────────────
WORKDIR /var/www/api

# ── Copia apenas os arquivos de dependência primeiro (cache de layers) ────────
COPY composer.json composer.lock ./

# ── Instala dependências sem scripts (o código ainda não foi copiado) ─────────
RUN composer install --no-scripts --no-autoloader --prefer-dist

# ── Copia o restante do código ────────────────────────────────────────────────
COPY . .

# ── Gera autoload otimizado ───────────────────────────────────────────────────
RUN composer dump-autoload --optimize

# ── Permissões de escrita para storage e bootstrap/cache ─────────────────────
RUN chown -R www-data:www-data /var/www/api/storage /var/www/api/bootstrap/cache \
    && chmod -R 775 /var/www/api/storage /var/www/api/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
