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

- [ ] Implement registration.
- [ ] Implement login with refresh cookie.
- [ ] Implement refresh token rotation.
- [ ] Implement logout and logout-all session handling.
- [ ] Implement current-user and change-password routes.
- [ ] Add auth middleware and role authorization.

## Milestone 4: Task API

- [ ] Implement task creation.
- [ ] Implement task listing with pagination, filters, search, and sorting.
- [ ] Implement task detail lookup with ownership rules.
- [ ] Implement task update.
- [ ] Implement task deletion.
- [ ] Add task validation and API smoke checks.

## Milestone 5: Frontend Core

- [ ] Configure Tailwind CSS and shadcn/ui foundation.
- [ ] Add app routing, protected routes, and layouts.
- [ ] Add Axios API client with refresh-token handling.
- [ ] Add Zustand auth store.
- [ ] Add theme provider and dark/light mode.

## Milestone 6: Frontend Features

- [ ] Build register and login screens with form validation.
- [ ] Build dashboard overview and statistics.
- [ ] Build task list with search, filters, sorting, and pagination.
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
