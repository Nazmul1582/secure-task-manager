# secureTaskManager TODO

This file is the working checklist for building the project in small committed tasks. Each completed item should be checked before the matching commit is created.

## Milestone 1: Repository Foundation

- [x] Initialize git repository and project documentation.
- [x] Add npm workspace root configuration.
- [x] Scaffold the Express backend package.
- [x] Scaffold the Vite React frontend package.
- [x] Add shared development scripts and environment examples.

## Milestone 2: Backend Core

- [x] Configure Express app middleware, CORS, cookies, logging, and health route.
- [x] Connect MongoDB with a reusable database module.
- [x] Add centralized async, error, response, and validation helpers.
- [x] Add User and Task Mongoose models.
- [x] Add JWT access and refresh token utilities.

## Milestone 3: Authentication API

- [x] Implement registration.
- [x] Implement login with refresh cookie.
- [x] Implement refresh token rotation.
- [x] Implement logout and logout-all session handling.
- [x] Implement current-user and change-password routes.
- [x] Add auth middleware and role authorization.

## Milestone 4: Task API

- [x] Implement task creation.
- [x] Implement task listing with pagination, filters, search, and sorting.
- [x] Implement task detail lookup with ownership rules.
- [x] Implement task update.
- [x] Implement task deletion.
- [x] Add task validation and API smoke checks.

## Milestone 5: Frontend Core

- [x] Configure Tailwind CSS and shadcn/ui foundation.
- [x] Add app routing, protected routes, and layouts.
- [x] Add Axios API client with refresh-token handling.
- [x] Add Zustand auth store.
- [x] Add theme provider and dark/light mode.

## Milestone 6: Frontend Features

- [x] Build register and login screens with form validation.
- [x] Build dashboard overview and statistics.
- [x] Build task list with search, filters, sorting, and pagination.
- [ ] Build task create/edit flows.
- [ ] Build Kanban board.
- [ ] Add loading, toast, and empty states.

## Milestone 7: Quality And Delivery

- [ ] Add linting and formatting.
- [ ] Add backend API tests.
- [ ] Add frontend component and route tests.
- [ ] Add production deployment notes.
- [ ] Push committed milestones to GitHub remote.

## Progress Log

- 2026-05-21: Created the initial repository roadmap and documentation.
- 2026-05-21: Added the npm workspace root configuration.
- 2026-05-21: Scaffolded the Express backend workspace.
- 2026-05-21: Scaffolded the Vite React frontend workspace.
- 2026-05-21: Added shared development commands and environment examples.
- 2026-05-21: Configured Express environment validation, middleware, and health checks.
- 2026-05-21: Added reusable MongoDB connection and graceful server shutdown.
- 2026-05-21: Added backend async, response, validation, and error handling helpers.
- 2026-05-21: Added User and Task Mongoose models with auth/session and task indexes.
- 2026-05-21: Added JWT signing, verification, hashing, cookie, and expiry utilities.
- 2026-05-21: Implemented registration with validation, JWT issuance, refresh cookie, and session storage.
- 2026-05-21: Implemented login with bcrypt password verification and refresh cookie issuance.
- 2026-05-21: Implemented refresh-token rotation with session reuse detection.
- 2026-05-21: Added access-token authentication middleware and role authorization guard.
- 2026-05-21: Implemented single-session logout and logout-all session clearing.
- 2026-05-21: Implemented current-user and secure change-password auth routes.
- 2026-05-21: Implemented protected task creation with validation and assignment rules.
- 2026-05-21: Implemented task listing with pagination, filters, search, sorting, and role-aware visibility.
- 2026-05-21: Implemented task detail lookup with ownership and role rules.
- 2026-05-21: Implemented task updates with partial validation and assignment checks.
- 2026-05-21: Implemented task deletion with ownership and role rules.
- 2026-05-21: Added backend API smoke checks for health, auth protection, and validation envelopes.
- 2026-05-21: Configured Tailwind CSS v4, shadcn-style tokens, aliases, and base UI utilities.
- 2026-05-21: Added Axios API client, in-memory token manager, refresh retry, and endpoint wrappers.
- 2026-05-21: Added Zustand auth store for memory-only access token and auth session actions.
- 2026-05-21: Added React Router routes, protected route guard, auth layout, and dashboard layout.
- 2026-05-21: Added dark/light theme provider and icon toggle.
- 2026-05-21: Built login and registration screens with React Hook Form and Zod validation.
- 2026-05-21: Built dashboard statistics, completed-task chart, upcoming deadlines, and task store fetch.
- 2026-05-21: Built task list view with search, filters, sorting, pagination, and API-backed states.
