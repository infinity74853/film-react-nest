CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица films (адаптированная для film_db)
CREATE TABLE IF NOT EXISTS films (
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    rating DOUBLE PRECISION NOT NULL,
    director VARCHAR NOT NULL,
    tags TEXT NOT NULL,
    image VARCHAR NOT NULL,
    cover VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    about VARCHAR NOT NULL,
    description VARCHAR NOT NULL
);

-- Таблица schedules (адаптированная для film_db)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    daytime VARCHAR NOT NULL,
    hall INTEGER NOT NULL,
    rows INTEGER NOT NULL,
    seats INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    taken TEXT NOT NULL,
    "filmId" UUID REFERENCES films(id)
);

-- Таблица orders (адаптированная для film_db)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    tickets INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "scheduleId" UUID REFERENCES schedules(id)
);