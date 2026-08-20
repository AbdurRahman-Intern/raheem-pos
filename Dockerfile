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


# Stage 1: Get official Node binaries safely
FROM node:20-alpine AS node-builder

# Stage 2: Build the core Laravel environment matching your local PHP 8.4
FROM php:8.4-fpm

# Install core system packages AND the required libzip-dev package
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip nginx

# Clear cache
RUN apt-get clean && rm -rf /var/lib/lists/*

# Install PHP extensions (Added 'zip' here)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer tool
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy Node & NPM binaries directly from Stage 1
COPY --from=node-builder /usr/local/bin/node /usr/local/bin/node
COPY --from=node-builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs && ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# Set working directory
WORKDIR /var/www

# Copy composer maps first to leverage Docker cache rules
COPY composer.json composer.lock* /var/www/

# Copy the rest of the application files
COPY . /var/www

# Install PHP production dependencies cleanly
RUN composer install --no-interaction --optimize-autoloader --no-dev --ignore-platform-reqs

# Safely run NPM build
RUN npm install && npm run build

# Setup Nginx configuration
COPY ./nginx.conf /etc/nginx/sites-available/default

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

# Run migrations automatically and start services
CMD php artisan migrate --force && service nginx start && php-fpm


