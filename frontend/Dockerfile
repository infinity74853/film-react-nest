# Этап сборки фронт
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Финальный этап - создаем статику для nginx
FROM alpine:latest

WORKDIR /static

# Копируем собранные файлы
COPY --from=build /app/dist/. ./

CMD ["tail", "-f", "/dev/null"]