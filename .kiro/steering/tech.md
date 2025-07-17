# Technology Stack

## Framework & Runtime
- **Next.js 15.3.3** with App Router and Turbopack for development
- **React 18** with TypeScript for type safety
- **Node.js** runtime environment

## Database & ORM
- **PostgreSQL** as primary database
- **Prisma 5.22** as ORM with schema-first approach
- Database models: Link, Movie, Show, WatchedEpisode

## UI & Styling
- **Tailwind CSS** for utility-first styling
- **ShadCN UI** component library with Radix UI primitives
- **Lucide React** for consistent iconography
- **CSS Variables** for theming with HSL color system

## AI Integration
- **Google AI Genkit 1.13** for AI workflows
- **Gemini 1.5 Flash** as the primary AI model
- AI flows for link suggestions and content enhancement

## State Management & Forms
- **Zustand** for client-side state management
- **React Hook Form** with Zod validation
- Custom hooks pattern for data fetching and business logic

## External APIs
- **TMDb API** for movie/TV show data and posters
- **AwesomeAPI** for currency exchange rates
- **Open-Meteo** for weather forecasting
- **Google Generative AI** for intelligent suggestions

## Development Tools
- **TypeScript 5** with strict mode enabled
- **ESLint** with Next.js configuration
- **Prisma Studio** for database management
- **tsx** for TypeScript execution

## Common Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Start Genkit with file watching
```

### Build & Deploy
```bash
npm run build           # Build production bundle
npm run start           # Start production server
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
```

### Database Operations
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:reset        # Reset database with fresh migrations
npm run db:studio       # Open Prisma Studio
npm run db:push         # Push schema changes without migration
```

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `TMDB_API_KEY` - The Movie Database API key
- `GOOGLE_API_KEY` - Google AI API key with Generative Language API enabled