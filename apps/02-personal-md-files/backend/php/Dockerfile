FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Create directory for composer cache
RUN mkdir -p /root/.composer/cache

# Expose port 8005
EXPOSE 8005

# Install dependencies and start PHP built-in server
CMD ["sh", "-c", "composer install --no-interaction --optimize-autoloader && php -S 0.0.0.0:8005 -t public"] 