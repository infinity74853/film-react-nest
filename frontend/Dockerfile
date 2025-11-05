# Этап сборки
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Проверим что шрифты собрались
RUN find /app/dist -name "*.woff*" -o -name "*.ttf" | head -5

# Этап продакшн
FROM nginx:alpine

# Копируем собранные файлы в nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем папку для шрифтов если её нет и проверяем
RUN mkdir -p /usr/share/nginx/html/fonts && \
    find /usr/share/nginx/html -name "*.woff*" -o -name "*.ttf" | head -5 || echo "Checking fonts..."

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]