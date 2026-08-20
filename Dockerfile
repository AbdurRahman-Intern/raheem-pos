# FROM php:8.4-fpm

# # Updated: Install system dependencies, Node.js GPG key, and Node.js 20
# RUN apt-get update && apt-get install -y \
#     git curl gnupg libpng-dev libonig-dev libxml2-dev zip unzip nginx \
#     && mkdir -p /etc/apt/keyrings \
#     && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
#     && echo "deb [signed-by=/etc/apt/keyrings/nodesourcegpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
#     && apt-get update && apt-get install -y nodejs

# # Clear cache
# RUN apt-get clean && rm -rf /var/lib/lists/*

# # Install PHP extensions
# RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# # Get latest Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Set working directory
# WORKDIR /var/www

# # Copy existing application directory
# COPY . /var/www

# # Install PHP dependencies
# RUN composer install --no-interaction --optimize-autoloader --no-dev

# # Install NPM dependencies and compile React/Inertia assets
# RUN npm install && npm run build

# # Setup Nginx configuration
# COPY ./nginx.conf /etc/nginx/sites-available/default

# # Permissions
# RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# EXPOSE 80

# # Run migrations automatically and start services
# CMD php artisan migrate --force && service nginx start && php-fpm


# ---------------------------------------------------------------
# Stage 1: Build front-end assets (Node.js) — not shipped to prod
# ---------------------------------------------------------------
FROM node:20-slim AS assets

WORKDIR /app

# Leverage layer caching for npm deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app needed to build assets (Vite usually needs your PHP/blade files too if using @vite in views, so copy everything)
COPY . .
RUN npm run build


# ---------------------------------------------------------------
# Stage 2: PHP application image
# ---------------------------------------------------------------
FROM php:8.4-fpm

# 1. Install OS dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip nginx \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install PHP extensions needed for Laravel and ZipArchive backups
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Bring in Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# 4. Copy dependency manifests first to leverage Docker layer cache
COPY composer.json composer.lock* /var/www/
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts --ignore-platform-reqs

# 5. Copy the rest of the application
COPY . /var/www

# Re-run composer to trigger post-install scripts now that full app is present
RUN composer install --no-interaction --optimize-autoloader --no-dev --ignore-platform-reqs

# 6. Bring in the built front-end assets from the assets stage
COPY --from=assets /app/public/build /var/www/public/build

# 7. Nginx config
COPY ./nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default \
    && rm -f /etc/nginx/sites-enabled/default.bak 2>/dev/null || true

# 8. Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

# 9. Run database migrations and start web services
CMD php artisan migrate --force --seed && service nginx start && php-fpm