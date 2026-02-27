# test-restructure-001

A simple task manager web app that lets users view a task list (dashboard), create new tasks via a form, and view/edit task details. The backend exposes a RESTful CRUD API with a health endpoint. The frontend uses the Next.js App Router.

## Features
- Task list dashboard with pagination, sorting, and filtering scaffolds
- Create task form with validation-ready inputs
- Task detail view with edit and delete flows scaffolded
- REST API client utilities
- Toast notifications and global error handling

## Tech Stack
- Next.js 14
- React 18
- TypeScript
- Prisma ORM (SQLite for dev)
- Tailwind CSS
- Jest + React Testing Library
- Playwright (E2E)

## Prerequisites
- Node.js 18+
- npm 9+

## Quick Start
```bash
./install.sh
```

Windows PowerShell:
```powershell
./install.ps1
```

Then run:
```bash
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env` and update as needed:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/
  app/              # App Router pages and layout
  components/       # UI and layout components
  lib/              # Utilities and API client
  providers/        # Context providers
  types/            # Shared TypeScript types
prisma/             # Prisma schema
```

## API Endpoints
- `GET /api/health` — health check
- `GET /api/tasks` — list tasks (pagination + filters)
- `POST /api/tasks` — create task
- `GET /api/tasks/:id` — task detail
- `PUT /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task

## Available Scripts
- `npm run dev` — start dev server
- `npm run build` — generate Prisma client and build
- `npm run start` — start production server
- `npm run lint` — lint the codebase
- `npm run test` — run unit tests
- `npm run test:e2e` — run Playwright tests

## Testing
- Unit tests with Jest and React Testing Library
- E2E tests with Playwright

Run unit tests:
```bash
npm run test
```

Run E2E tests:
```bash
npm run test:e2e
```
