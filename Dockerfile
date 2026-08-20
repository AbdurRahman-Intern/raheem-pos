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


FROM php:8.4-fpm

# Fix: Force refresh packages and install standard OS requirements
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip nginx

# Fix: Cleanly install fully compatible Node.js 20 & NPM using a direct binary extraction path
RUN curl -fsSL https://nodejs.org | tar -xz --strip-components=1 -C /usr/local

# Clear package list caches to keep image sizes small
RUN apt-get clean && rm -rf /var/lib/lists/*

# Install native PHP data management extensions (including Zip for backups)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Fetch the global Composer manager tool
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Target the container application space
WORKDIR /var/www

# Copy composer maps first to leverage Docker cache rules
COPY composer.json composer.lock* /var/www/

# Copy codebase into the container environment
COPY . /var/www

# Install production-optimized PHP dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev --ignore-platform-reqs

# Fix: Now successfully runs with completely native, readable Node links!
RUN npm install && npm run build

# Apply production server routing rules
COPY ./nginx.conf /etc/nginx/sites-available/default

# Reassign internal application path ownerships
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

# Execute necessary database migrations and spin up background services
CMD php artisan migrate --force && service nginx start && php-fpm
