# Базовый образ Node.js
FROM node:22-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# СОЗДАЕМ КОПИИ ФАЙЛОВ вместо symbolic links
RUN mkdir -p /app/public && \
    cd /app/public && \
    for i in 1 2 3 4 5 6; do \
        cp content/afisha/bg${i}s.jpg afishabg${i}s.jpg 2>/dev/null || echo "bg${i}s.jpg not found"; \
        cp content/afisha/bg${i}c.jpg afishabg${i}c.jpg 2>/dev/null || echo "bg${i}c.jpg not found"; \
    done

# Проверим что файлы создались
RUN echo "=== Created files ===" && \
    ls -la /app/public/afishabg*.jpg 2>/dev/null || echo "No afishabg files found" && \
    echo "=== Original files ===" && \
    find /app/public/content -name "*.jpg" | head -10

# Собираем приложение
RUN npm run build

# Устанавливаем ТОЛЬКО production зависимости для финального образа
RUN npm ci --only=production && npm cache clean --force

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Меняем владельца файлов
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "dist/main"]