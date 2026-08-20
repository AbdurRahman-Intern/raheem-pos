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

# 1. Install standard OS dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip nginx

# 2. Fix: Download the official Node.js archive file directly to disk FIRST, then extract it cleanly
RUN curl -fsSL -o /tmp/node.tar.gz https://nodejs.org \
    && tar -xzf /tmp/node.tar.gz --strip-components=1 -C /usr/local \
    && rm /tmp/node.tar.gz

# 3. Clean up apt package tables
RUN apt-get clean && rm -rf /var/lib/lists/*

# 4. Install PHP extensions needed for Laravel and ZipArchive backups
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 5. Bring in Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# 6. Copy files and leverage Docker layer cache for dependencies
COPY composer.json composer.lock* /var/www/
COPY . /var/www

# 7. Install Laravel production dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev --ignore-platform-reqs

# 8. Compile your Inertia.js / React / Vite front-end assets
RUN npm install && npm run build

# 9. Copy your production Nginx routing layout
COPY ./nginx.conf /etc/nginx/sites-available/default

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

# 10. Run database updates and start web services
CMD php artisan migrate --force && service nginx start && php-fpm
