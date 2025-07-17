# Copilot Instructions for Dash

## Project Overview
- This is a Next.js dashboard application, structured for modularity and scalability. The project is organized under `src/` with clear separation of UI components, hooks, services, and API routes.
- Data flows from API routes (`src/app/api/`) to services (`src/services/`), which interact with external sources and Prisma ORM (`src/lib/prisma.ts`).
- UI is built with reusable components in `src/components/ui/` and dashboard-specific components in `src/components/dashboard/`.

## Key Architectural Patterns
- **API Routes:** RESTful endpoints are defined in `src/app/api/`, grouped by domain (e.g., `links`, `movies`, `shows`). Dynamic routes use `[id]` folders.
- **Services:** Business logic and external API calls are encapsulated in `src/services/`. Example: `tmdb.ts` for The Movie Database integration.
- **Prisma ORM:** Database schema is managed in `prisma/schema.prisma`. Migrations are tracked in `prisma/migrations/`.
- **Hooks:** Custom React hooks in `src/hooks/` centralize state and data-fetching logic (e.g., `use-movies.ts`, `use-links.ts`).
- **UI Components:** Shared UI primitives are in `src/components/ui/`. Dashboard-specific dialogs and cards are in `src/components/dashboard/`.

## Developer Workflows
- **Start Dev Server:** Use `npm run dev` to launch the Next.js development server.
- **Database Migrations:** Use `migrate.bat` or Prisma CLI for schema changes. See `SETUP_POSTGRESQL.md` for PostgreSQL setup.
- **Styling:** Tailwind CSS is configured via `tailwind.config.ts` and `postcss.config.mjs`.
- **Environment Variables:** Copy `environment.example` to `.env` and adjust as needed.

## Conventions & Patterns
- **TypeScript:** All code is written in TypeScript. Types are centralized in `src/types/index.ts`.
- **File Naming:** Dialogs, cards, and managers are named by function (e.g., `add-movie-dialog.tsx`, `link-card.tsx`).
- **Modularity:** Prefer creating new hooks/services/components for new features rather than expanding existing files.
- **API Integration:** External APIs (e.g., TMDB) are wrapped in service files and not called directly from components.

## Integration Points
- **Prisma:** Database access via `src/lib/prisma.ts` and schema in `prisma/schema.prisma`.
- **TMDB:** Movie/TV data via `src/services/tmdb.ts`.
- **Tailwind:** Utility-first CSS for rapid UI development.

## Examples
- To add a new dashboard card, create a component in `src/components/dashboard/` and register it in `src/lib/dashboard-cards.ts`.
- To expose a new API route, add a file under `src/app/api/` and implement logic using relevant service(s).

## References
- Main entry: `src/app/page.tsx`
- Database: `prisma/schema.prisma`, `src/lib/prisma.ts`
- API: `src/app/api/`, `src/services/`
- UI: `src/components/ui/`, `src/components/dashboard/`
- Hooks: `src/hooks/`

---
For questions about unclear patterns or missing documentation, ask for clarification or request examples from maintainers.


Sempre responder em PT-BR, mantendo o contexto e as instruções fornecidas. Se precisar de mais detalhes ou exemplos, sinta-se à vontade para perguntar aos mantenedores do projeto.