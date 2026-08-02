# Cafe-between

## О проекте

**Cafe-between** — проект “кафейни” (витрина ресторана/кафе): посетители видят
**меню**, **карточки категорий**, а также **новости/анонсы** (например, акции, события, обновления).
Администратор управляет контентом через защищённую админку: добавляет/редактирует позиции меню,
публикует новости и меняет порядок категорий.

Изображения (блюда/новости) загружаются на backend и раздаются по HTTP, а данные хранятся в PostgreSQL.
Для ускорения чтения используются кеши, а для админских действий — JWT-аутентификация.

## Состав проекта

Проект состоит из двух частей:

- **backend (Go)** — REST API для меню/новостей и админка по JWT
- **frontend (React + TypeScript + Vite)** — публичная витрина и админские страницы

Также используется **PostgreSQL** и хранение загруженных изображений в папке `uploads/` внутри backend-контейнера.

---

## Стек и ключевые технологии

### Backend
- Go + `net/http`
- Маршрутизация: `github.com/gorilla/mux`
- JWT: `github.com/golang-jwt/jwt/v5`
- PostgreSQL: `github.com/jackc/pgx/v5/pgxpool`
- Cache: `github.com/patrickmn/go-cache`
- Загрузка файлов: `multipart/form-data`

### Frontend
- React 19 + TypeScript
- Vite
- `react-router-dom`
- Работа с API: `frontend/src/api.ts`

---

## Архитектура backend

### Роутинг и CORS
В `backend/main.go`:
- включён CORS middleware (разрешает `Access-Control-Allow-Origin: *`)
- подключаются публичные роуты `/api/...`
- отдельно выделен `adminRouter := r.PathPrefix("/api/admin").Subrouter()` с `handlers.JWTMiddleware`

### Кеширование
Кешируются результаты чтения:
- `menu`
- `menu_item_{id}`
- `menu_categories`
- `news`
- `news_item_{id}`

Инвалидация выполняется при create/update/delete в handlers.

---

## Загрузка изображений

Реализовано в `backend/internal/handlers/utils.go`.

- Endpoints принимают `multipart/form-data`
- Лимиты:
  - multipart form: **32MB** (`r.ParseMultipartForm(32 << 20)`)
  - файл: **до 5MB**
- Валидация:
  - только MIME `image/*`
- Сохранение:
  - файлы пишутся в: **`/root/uploads`**
  - имя: `uuid + оригинальное расширение`
  - возвращаемые пути: **`/uploads/<filename>`**

Удаление:
- при delete/update сервер удаляет “вышедшие из списка” изображения из `/root/uploads`.

---

## Транслитерация категорий меню

Категории принимаются как русский текст (`category` / `categoryRu`), далее сервер переводит в “EN/translit” и сохраняет в поле `menu.category`.

Алгоритм:
- `backend/internal/handlers/utils.go` → `transliterate(text string)`

Таблица категорий:
- `menu_categories` хранит `name_ru` и `name_en` (оба уникальны).

---

## API (эндпоинты)

### Базовый префикс
- Публичные: `http(s)://<host>/api/...`
- Админские: `http(s)://<host>/api/admin/...`

---

### Auth (JWT)

#### Login
`POST /api/login`

Body:
```json
{ "password": "..." }
```

Response (пример):
```json
{ "token": "<jwt>" }
```

#### Logout
`POST /api/logout`

Response:
```json
{ "message": "Logout successful" }
```

> Клиентский logout фактически работает через очистку `localStorage` (см. `frontend/src/contexts/AuthContext.tsx`).

---

### Публичное меню

- `GET /api/menu` → `MenuItem[]`
- `GET /api/menu/{id}` → `MenuItem`
- `GET /api/menu-categories` → `MenuCategory[]`

---

### Публичные новости

- `GET /api/news` → `News[]`
- `GET /api/news/{id}` → `News`

---

### Админка: Menu

Все ниже требуют JWT.

#### Create menu item
`POST /api/admin/menu` (multipart/form-data)

Fields:
- `title` (string)
- `price` (number)
- `calories` (number, опционально)
- `description` (string, опционально)
- `category` (string, русский вариант)

Files:
- `images` (один или несколько файлов)

#### Update menu item
`PUT /api/admin/menu/{id}` (multipart/form-data)

Те же поля, плюс:
- `existingImages` — JSON-массив строк путей, которые уже должны остаться

#### Delete menu item
`DELETE /api/admin/menu/{id}`

---

### Админка: News

Все ниже требуют JWT.

#### Create news
`POST /api/admin/news` (multipart/form-data)

Fields:
- `title`
- `preview`
- `description`
- `postedAt` (строка в RFC3339, парсится сервером `time.Parse(time.RFC3339, ...)`)

Files:
- `images`

#### Update news
`PUT /api/admin/news/{id}` (multipart/form-data)

+ `existingImages` (JSON-массив строк путей)

#### Delete news
`DELETE /api/admin/news/{id}`

---

### Админка: Menu categories

- `PUT /api/admin/menu-categories/{id}/sort-order`
  - body: `{ "sort_order": number }`
- `DELETE /api/admin/menu-categories/{id}`
  - если категория используется пунктами меню:
    - `409 Conflict`
    - body:
      ```json
      { "error": "Category is in use", "items": [ ... ] }
      ```

---

## Раздача загруженных файлов

Backend раздаёт:
- `GET /uploads/<filename>`

Физически файлы лежат в `/root/uploads` (volume `uploads_data` в docker-compose).

---

## База данных (PostgreSQL)

Миграции лежат в `backend/migrations` и автоматически выполняются в Postgres контейнере.

### Таблица menu
```sql
CREATE TABLE IF NOT EXISTS menu (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    imageURLs TEXT[],
    calories INT,
    description TEXT,
    category TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица menu_categories
```sql
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name_ru VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица news
```sql
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    preview TEXT,
    description TEXT,
    imageURLs TEXT[],
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    postedAt TIMESTAMP DEFAULT '2025-11-16 23:59:59'
);
```

---

## Переменные окружения

Docker Compose использует переменные окружения (задайте их в `.env` в корне проекта):

- `POSTGRES_DSN` — строка подключения к Postgres (используется в `backend/internal/database/database.go`)
- `BACKEND_PORT` — порт backend (по умолчанию 8080)
- `JWT_SECRET` — секрет для подписи JWT (`backend/internal/handlers/authHandler.go`)
- `ADMIN_PASSWORD` — пароль администратора для `/api/login`

---

## Запуск через Docker Compose

```bash
docker compose up --build
```

Контейнеры:
- `db` (Postgres): доступен на `5433:5432`
- `backend`: доступен на `BACKEND_PORT` (дефолт 8080)
- `frontend` (nginx): порты `80:80` и `443:443`

---

## Проектные заметки (важное поведение)

- JWT создаётся на сервере без реального “поиска пользователя”: `generateToken()` всегда выставляет `UserID: 1` и `Role: admin`.
- `logout` на практике: удаление токена из `localStorage` + POST `/api/logout`.
- Обновление menu/news удаляет только те изображения, которые были убраны из `existingImages`.
- При create/update/delete сбрасывается кеш для соответствующих ключей.

---

## Структура репозитория

- `backend/`
  - `main.go` — роутинг и подключение handlers
  - `internal/handlers/` — обработчики API + upload/utils + JWT middleware
  - `models/` — структуры и репозитории (SQL)
  - `migrations/` — SQL схемы
  - `uploads/` — директория для файлов (создаётся в Dockerfile)

- `frontend/`
  - `src/api.ts` — клиентские вызовы REST API
  - `src/contexts/AuthContext.tsx` — хранение токена и login/logout
  - `src/pages/*` — страницы витрины и админки
  - `src/style/*` — стили

---

Если нужно — могу дополнить README разделом “как пользоваться админкой” с перечислением полей форм (в каком виде отправляет фронт и как именно ожидает backend).
