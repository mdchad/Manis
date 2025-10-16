# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript monorepo built with Better-T-Stack, featuring:
- Web frontend (React + TanStack Router)
- Mobile app (React Native + Expo)
- Backend API (Hono + tRPC running on Cloudflare Workers)
- Shared packages for API, auth, and database logic

## Key Commands

### Development
```bash
# Start all applications in development mode
bun dev

# Start individual applications
bun dev:web      # Web app on http://localhost:3001
bun dev:server   # API server on http://localhost:3000
bun dev:native   # React Native/Expo app

# Type checking across all apps
bun check-types

# Linting
bun check
```

### Database Operations
```bash
# Start local SQLite database (run from project root)
cd apps/server && bun db:local

# Push schema changes to database
bun db:push

# Open Drizzle Studio UI
bun db:studio

# Generate migrations
bun db:generate

# Run migrations
bun db:migrate
```

### Build and Deploy
```bash
# Build all applications
bun build

# Deploy to Cloudflare (via Alchemy)
bun deploy

# Destroy deployment
bun destroy
```

## Architecture

### Monorepo Structure

This is a **Turborepo** monorepo with the following structure:

```
apps/
  web/         - Frontend React app with TanStack Router
  native/      - React Native Expo mobile app
  server/      - Hono server with tRPC (runs on Cloudflare Workers)

packages/
  api/         - tRPC router definitions and API layer
  auth/        - Better-Auth configuration shared across apps
  db/          - Drizzle ORM schema and database client
```

### Data Flow

1. **Client → Server:**
   - Web and native apps use tRPC client to call API endpoints
   - tRPC provides end-to-end type safety from client to server
   - Authentication handled via Better-Auth with cookies

2. **Server Processing:**
   - `apps/server/src/index.ts` - Main Hono app entry point
   - `/api/auth/*` routes handled by Better-Auth
   - `/trpc/*` routes handled by tRPC middleware
   - Context created per-request with session data from Better-Auth

3. **Database:**
   - SQLite/Turso database accessed via Drizzle ORM
   - Database client created in `packages/db/src/index.ts`
   - Schema defined in `packages/db/src/schema/`

### Package Dependencies

- **@manis/api** depends on: `@manis/auth`, `@manis/db`
- **@manis/auth** depends on: `@manis/db`
- **@manis/db** is a leaf package with no internal dependencies

All apps can import from any package. Shared packages export TypeScript source directly (not compiled) for optimal type checking.

## tRPC Implementation

### Adding New API Endpoints

1. Define procedures in `packages/api/src/routers/index.ts`:
   ```typescript
   export const appRouter = router({
     myEndpoint: publicProcedure.query(() => { ... }),
     myProtectedEndpoint: protectedProcedure.mutation(() => { ... }),
   });
   ```

2. Use `publicProcedure` for unauthenticated endpoints
3. Use `protectedProcedure` for authenticated endpoints (automatically checks session)
4. Context includes `session` object with user data when authenticated

### tRPC Context

Context is created in `packages/api/src/context.ts`:
- Extracts session from Better-Auth using request headers
- Available in all procedures via `ctx` parameter
- `protectedProcedure` ensures `ctx.session` exists

### Client Usage

**Web app** (`apps/web/src/utils/trpc.ts`):
```typescript
import { trpc } from "@/utils/trpc";
// Use in React Query hooks
const { data } = trpc.myEndpoint.useQuery();
```

**Native app**: Similar setup using `@trpc/tanstack-react-query`

## Authentication

### Better-Auth Configuration

Configuration in `packages/auth/src/index.ts`:
- Uses Drizzle adapter with SQLite
- Email/password authentication enabled
- Expo plugin included for mobile support
- Session stored in cookies with `sameSite: none` for cross-domain support

### Important for Cloudflare Deployment

Before deploying to `*.workers.dev`:
1. Update environment variables in `apps/server/.env` and `apps/web/.env`
2. In `packages/auth/src/index.ts`, uncomment:
   - `session.cookieCache` configuration
   - `advanced.crossSubDomainCookies` configuration
   - Replace `<your-workers-subdomain>` with your actual subdomain

### Auth Endpoints

- **API endpoints**: Handled at `/api/auth/*` by Better-Auth
- **Client setup**:
  - Web: `apps/web/src/lib/auth-client.ts`
  - Native: Uses `@better-auth/expo`

## Database Schema

### Schema Location
All database schemas are in `packages/db/src/schema/`:
- `auth.ts` - Better-Auth tables (user, session, etc.)

### Making Schema Changes
1. Edit schema files in `packages/db/src/schema/`
2. Run `bun db:push` to apply changes (development)
3. Or run `bun db:generate` then `bun db:migrate` (production)

### Database Configuration
- Config file: `packages/db/drizzle.config.ts`
- Reads from `apps/server/.env` for connection details
- Supports both local SQLite and remote Turso database

## Environment Variables

Create `apps/server/.env` based on `apps/server/.env.example`:
```bash
DATABASE_URL=            # SQLite file path or Turso URL
DATABASE_AUTH_TOKEN=     # Turso auth token (empty for local)
BETTER_AUTH_SECRET=      # Secret for auth tokens
BETTER_AUTH_URL=         # Server URL (e.g., http://localhost:3000)
CORS_ORIGIN=            # Web app URL (e.g., http://localhost:3001)
```

Create `apps/web/.env`:
```bash
VITE_SERVER_URL=        # Server URL (e.g., http://localhost:3000)
```

## File-Based Routing

### Web App (TanStack Router)
Routes in `apps/web/src/routes/`:
- `__root.tsx` - Root layout
- `index.tsx` - Home page
- `login.tsx` - Login page
- `dashboard.tsx` - Dashboard page

File names map directly to URLs.

### Native App (Expo Router)
Routes in `apps/native/app/`:
- `_layout.tsx` - Root layout
- `(drawer)/` - Drawer navigation group
- File-based routing similar to Next.js

## Common Development Patterns

### Adding a New Feature
1. Define database schema in `packages/db/src/schema/` if needed
2. Run `bun db:push` to update database
3. Add tRPC procedures in `packages/api/src/routers/index.ts`
4. Create UI in `apps/web/src/routes/` or `apps/native/app/`
5. Use tRPC hooks to call API endpoints

### Sharing Code Between Web and Native
- Place shared logic in `packages/api/` (business logic)
- UI components are separate (different frameworks)
- tRPC client usage is similar on both platforms

## Testing
The project uses Husky for Git hooks and oxlint for linting. Lint-staged runs oxlint on staged files before commits.

## Deployment
This project uses Alchemy for Cloudflare Workers deployment. The `apps/server` application is designed to run as a Cloudflare Worker.
