# Платформа коворкинга (SVCH_KURS)

Веб-приложение для бронирования рабочих мест, переговорных и залов: каталог ресурсов, тарифы, избранное, бронирования, отчёты (PDF) и админ-панель.

- Клиент: React 19, TypeScript, Vite, React Router
- Сервер: Node.js, Express, Prisma, PostgreSQL, JWT

## Требования

- Node.js 20 LTS или новее
- PostgreSQL 15 или новее

## Запуск

### 1. База данных

Создайте пустую БД, например `coworking`.

В каталоге `server` скопируйте `.env.example` в `.env` и подставьте свои значения:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/coworking?schema=public
PORT=4000
JWT_SECRET=replace-with-a-secret-at-least-16-chars
CORS_ORIGIN=http://localhost:5173
```

### 2. Сервер

```bash
cd server
npm install
npm run prisma:migrate
npm run seed
npm run dev
```

API: http://localhost:4000  
Проверка: http://localhost:4000/api/health

### 3. Клиент

Второй терминал:

```bash
cd client
npm install
npm run dev
```

Откройте адрес Vite (обычно http://localhost:5173).

## Демо-аккаунты

Пароль для всех: `Password123!`.

| Роль           | Email                 |
|----------------|-----------------------|
| Администратор  | admin@cowork.local    |
| Менеджер       | manager@cowork.local  |
| Клиент         | client@cowork.local   |

## Роли

- **Гость** — главная, вход, регистрация
- **Клиент** — ресурсы, избранное, бронирования, тарифы, профиль (бронирование при активном тарифе)
- **Менеджер** — те же разделы плюс отчёты; бронирование без обязательной подписки
- **Администратор** — плюс каталог ресурсов (создание, цена, деактивация)
