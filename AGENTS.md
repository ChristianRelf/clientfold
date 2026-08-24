# Repository Guidelines

## Project Structure & Module Organization

ClientFold is a Next.js 15 App Router application. Pages, layouts, Server Actions, and API handlers live in `src/app/`; route groups such as `(app)` and `(auth)` organize flows without changing URLs. Reusable UI is under `src/components/`. Business logic, queries, authentication, storage adapters, and integrations belong in `src/lib/`. Keep tenant-sensitive database access server-side and follow `src/lib/tenancy.ts`.

Prisma schema and seed data are in `prisma/`. Static assets live in `public/`, utilities in `scripts/`, and local uploads in ignored `.storage/`. Tests sit beside their modules as `*.test.ts`.

## Build, Test, and Development Commands

Use pnpm 9 (the version is pinned in `package.json`).

- `pnpm install` installs dependencies.
- `pnpm dev` starts the local application at `http://localhost:3000`.
- `pnpm build` generates Prisma Client and creates a production build.
- `pnpm typecheck` runs strict TypeScript validation without emitting files.
- `pnpm lint` runs the configured Next.js lint command.
- `pnpm test` runs the Node test suites through `tsx`.
- `pnpm db:push` applies the Prisma schema to the local database.
- `pnpm db:seed` loads the Northline Studio demo dataset.
- `docker compose up --build` runs the production-style container stack.

## Coding Style & Naming Conventions

Write strict TypeScript with two-space indentation, semicolons, and double quotes, matching existing files. Use `@/` imports for code under `src/`. Name React components and exported types in PascalCase, functions and variables in camelCase, and files/routes in lowercase kebab-case. Keep Server Actions in `actions.ts`, API endpoints in `route.ts`, and avoid client components unless browser state or APIs require `"use client"`. Compose Tailwind classes with the shared `cn` helper when conditional styling is needed.

## Testing Guidelines

Tests use `node:test` and `node:assert/strict`. Add focused `*.test.ts` files next to logic modules and use behavior-oriented test names. Update the explicit test file list in `package.json` when adding a new suite. Before submitting, run `pnpm test`, `pnpm typecheck`, and `pnpm build`; no numeric coverage threshold is currently enforced.

## Commit & Pull Request Guidelines

Recent history favors short, imperative subjects, with Conventional Commit prefixes appearing for newer work (for example, `feat: add integration registry and webhook handling`). Prefer `feat:`, `fix:`, `test:`, `docs:`, or `chore:` and keep each commit scoped.

Pull requests should explain the user-visible change, implementation risks, and verification performed. Link relevant issues, include screenshots for UI changes, call out Prisma or environment-variable changes, and never commit `.env`, local databases, `.storage/`, or real customer data.
