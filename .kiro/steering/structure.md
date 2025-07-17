# Project Structure & Organization

## Root Directory
```
/
├── .kiro/                  # Kiro AI assistant configuration
├── docs/                   # Project documentation
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/                    # Source code
└── scripts/                # Utility scripts (migration, etc.)
```

## Source Code Organization (`src/`)

### Core Application (`src/app/`)
- **Next.js App Router** structure with file-based routing
- `layout.tsx` - Global layout and providers
- `page.tsx` - Main dashboard page
- `globals.css` - Global styles and CSS variables
- `api/` - API routes for server-side functionality

### Components (`src/components/`)
- `ui/` - **ShadCN UI base components** (Button, Dialog, etc.)
- `dashboard/` - **Application-specific components** for dashboard features
- Follow component composition patterns
- Use `cn()` utility for conditional styling

### Business Logic (`src/hooks/`)
Custom hooks for data management and state:
- `use-links.ts` - Link management operations
- `use-movies.ts` - Movie tracking functionality  
- `use-shows.ts` - TV show episode tracking
- `use-weather.ts` - Weather data fetching
- `use-financial-data.ts` - Currency rate data
- `use-dashboard-settings.tsx` - Dashboard configuration

### Data Layer (`src/services/`)
Service modules for external data access:
- `links-service.ts` - Link CRUD operations
- `movies-service.ts` - Movie data management
- `shows-service.ts` - TV show data management
- `tmdb.ts` - TMDb API integration

### Utilities (`src/lib/`)
- `prisma.ts` - **Prisma client configuration**
- `utils.ts` - **Tailwind class merging utility** (`cn` function)
- `icons.ts` - Icon management utilities
- `dashboard-cards.ts` - Dashboard card configurations

### AI Integration (`src/ai/`)
- `genkit.ts` - **Genkit configuration** with Google AI
- `flows/` - **AI workflow definitions** for intelligent features
- `dev.ts` - Development server for AI testing

### Type Definitions (`src/types/`)
- `index.ts` - **Shared TypeScript interfaces** and types

## Architecture Patterns

### Data Flow
1. **UI Components** → Custom Hooks → Services → Database/APIs
2. **Prisma** handles all database operations
3. **Zustand** manages client-side state
4. **React Hook Form + Zod** for form validation

### File Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Services: `kebab-case-service.ts`
- Utilities: `kebab-case.ts`

### Import Aliases
- `@/components` - Components directory
- `@/lib` - Library utilities
- `@/hooks` - Custom hooks
- `@/services` - Service modules
- `@/types` - Type definitions

## Database Schema (Prisma)
- **Link** - Web system links with icons and grouping
- **Movie** - Movie tracking with TMDb integration
- **Show** - TV show information
- **WatchedEpisode** - Episode tracking with show relationships

## Configuration Files
- `components.json` - **ShadCN UI configuration**
- `tailwind.config.ts` - **Tailwind CSS customization**
- `tsconfig.json` - **TypeScript configuration** with path mapping
- `next.config.ts` - **Next.js configuration** with image domains