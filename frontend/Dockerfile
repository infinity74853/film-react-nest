# Этап сборки
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Проверим что собралось
RUN ls -la /app/dist

# Этап для статики - копируем в правильное место
FROM alpine:latest

WORKDIR /static

# Копируем собранные файлы из этапа build
COPY --from=build /app/dist/. ./

# Проверим что файлы скопировались
RUN ls -la /static

# Ждем бесконечно
CMD ["tail", "-f", "/dev/null"]