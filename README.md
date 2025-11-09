# FILM

## Установка

### MongoDB

Установите MongoDB скачав дистрибутив с официального сайта или с помощью пакетного менеджера вашей ОС. Также можно воспользоваться Docker (см. ветку `feat/docker`).

Выполните скрипт `test/mongodb_initial_stub.js` в консоли `mongo`.

### Бэкенд

Перейдите в папку с исходным кодом бэкенда

`cd backend`

Установите зависимости (точно такие же, как в package-lock.json) помощью команд

`npm ci` или `yarn install --frozen-lockfile`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `DATABASE_DRIVER` - тип драйвера СУБД - в нашем случае это `mongodb`
* `DATABASE_URL` - адрес СУБД MongoDB, например `mongodb://127.0.0.1:27017/practicum`.  

MongoDB должна быть установлена и запущена.

Запустите бэкенд:

`npm start:debug`

Для проверки отправьте тестовый запрос с помощью Postman или `curl`.

# FILM! - Киноафиша

## 🚀 Деплой

- Frontend: http://igor-films.students.nomorepartiessbs.ru/
- API: http://igor-films.students.nomorepartiessbs.ru/api/films
- PGAdmin: http://89.169.173.250:8080 (admin@film.com / admin)


Приложение задеплоено на Yandex Cloud и доступно по адресу:  
**<https://igor-films.students.nomorepartiessbs.ru>**

## Локальный запуск

### С Docker (рекомендуется)

```bash
# Запуск всех сервисов
docker-compose up -d --build

# Остановка
docker-compose down

# Остановка с удалением данных
docker-compose down -v
