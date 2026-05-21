# secureTaskManager

A modern full-stack task management application focused on secure JWT authentication, clean backend architecture, and a polished frontend experience.

## Project Overview

`secureTaskManager` is a portfolio-grade monorepo application built to demonstrate frontend expertise with the React ecosystem, secure authentication and authorization, REST API development with Express.js, state management with Zustand, and modern responsive UI/UX.

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Zustand
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- cors
- dotenv
- morgan

## Planned Features

- Secure access token and refresh token authentication
- Refresh token rotation with HTTP-only cookies
- Protected routes and role-based authorization
- Task CRUD with filters, search, sorting, pagination, tags, due dates, priorities, and ownership checks
- Responsive dashboard with analytics, activity, loading states, dark/light mode, and polished empty states

## Monorepo Structure

```txt
secureTaskManager/
├── client/
├── server/
├── TODO.md
├── package.json
├── README.md
└── .gitignore
```

## Development

This repository is being built in small, committed milestones. See [TODO.md](./TODO.md) for the active implementation checklist.

### Local Setup

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API runs on `http://localhost:5000` by default.

### Workspace Scripts

- `npm run dev` starts the client and server together.
- `npm run dev:client` starts only the Vite frontend.
- `npm run dev:server` starts only the Express backend.
- `npm run build` builds the frontend.
- `npm run lint` runs workspace lint checks.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production environment variables and hosting notes.
