# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript monorepo featuring:
- Web frontend (React + TanStack Router)
- Mobile app (React Native + Expo)
- Backend (Convex serverless database and functions)
- Better-Auth for authentication

## Key Commands

### Development
```bash
# Start all applications in development mode
bun dev

# Start individual applications
bun dev:web      # Web app on http://localhost:3001
bun dev:server   # Convex backend (also aliased as dev:setup)
bun dev:native   # React Native/Expo app

# Type checking across all apps
bun check-types

# Linting
bun check
```

### Convex Backend Operations
```bash
# Start Convex development server
bun dev:server

# Start Convex with configuration setup
bun dev:setup    # Runs convex dev --configure --until-success

# Deploy Convex backend to production
cd packages/backend && convex deploy
```

### Build and Deploy
```bash
# Build all applications
bun build

# Deploy web app (via Alchemy)
cd apps/web && bun deploy

# Destroy web app deployment
cd apps/web && bun destroy
```

## Architecture

### Monorepo Structure

This is a **Turborepo** monorepo with the following structure:

```
apps/
  web/         - Frontend React app with TanStack Router
  native/      - React Native Expo mobile app

packages/
  backend/     - Convex backend (functions, schema, auth)
```

### Data Flow

1. **Client → Convex:**
   - Web and native apps use Convex React client to call queries and mutations
   - Convex provides end-to-end type safety from client to backend
   - Authentication handled via Better-Auth integrated with Convex

2. **Convex Backend:**
   - `packages/backend/convex/` - Contains all Convex functions
   - `convex/http.ts` - HTTP router for Better-Auth endpoints
   - `convex/auth.ts` - Better-Auth configuration with Convex adapter
   - `convex/schema.ts` - Database schema definitions
   - Functions (queries, mutations, actions) defined as TypeScript files

3. **Database:**
   - Convex provides built-in serverless database
   - Schema defined in `packages/backend/convex/schema.ts`
   - Data accessed through Convex queries and mutations
   - Better-Auth tables managed by `@convex-dev/better-auth` component

### Package Dependencies

- **web** and **native** apps depend on `@manis/backend` for type definitions
- `@manis/backend` contains Convex functions and schema
- Generated types from Convex are in `packages/backend/convex/_generated/`

## Convex Functions

### Adding New Convex Functions

1. Create a new file in `packages/backend/convex/` (e.g., `todos.ts`):
   ```typescript
   import { query, mutation } from "./_generated/server";
   import { v } from "convex/values";

   export const list = query({
     args: {},
     handler: async (ctx) => {
       return await ctx.db.query("todos").collect();
     },
   });

   export const create = mutation({
     args: { text: v.string() },
     handler: async (ctx, args) => {
       return await ctx.db.insert("todos", {
         text: args.text,
         completed: false
       });
     },
   });
   ```

2. **Query**: For reading data (cannot modify database)
3. **Mutation**: For writing/updating data
4. **Action**: For external API calls or non-deterministic operations

### Protected Functions (with Auth)

Use the `authComponent` from `convex/auth.ts` to check authentication:
```typescript
import { authComponent } from "./auth";

export const protectedQuery = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    // Your logic here
  },
});
```

### Client Usage

**Web app** (`apps/web/src/main.tsx`):
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

// In component:
const todos = useQuery(api.todos.list);
const createTodo = useMutation(api.todos.create);
```

**Native app**: Similar setup using Convex React hooks

## Authentication

### Better-Auth Configuration

Configuration in `packages/backend/convex/auth.ts` and `convex/auth.config.ts`:
- Uses `@convex-dev/better-auth` Convex adapter
- Email/password authentication enabled
- Expo plugin included for mobile support
- Cross-domain support via `crossDomain` plugin
- HTTP routes registered in `convex/http.ts`

### Environment Variables

The backend needs:
```bash
SITE_URL=              # Your web app URL
NATIVE_APP_URL=        # Your mobile app URL scheme (e.g., mybettertapp://)
CONVEX_SITE_URL=       # Convex site URL (auto-provided by Convex)
```

### Auth Endpoints

- **HTTP endpoints**: Handled by Better-Auth HTTP router in `convex/http.ts`
- **Client setup**:
  - Web: `apps/web/src/lib/auth-client.ts` - Uses `convexClient()` and `crossDomainClient()` plugins
  - Native: Uses `@better-auth/expo`
- **Auth queries**: `convex/auth.ts` exports `getCurrentUser` query

## Database Schema

### Schema Location
Database schema is defined in `packages/backend/convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
});
```

### Making Schema Changes
1. Edit `packages/backend/convex/schema.ts`
2. Convex automatically syncs schema changes when running `bun dev:server`
3. Better-Auth tables are automatically managed by the `@convex-dev/better-auth` component

### Database Operations
- Query data: `ctx.db.query("tableName").collect()`
- Insert: `ctx.db.insert("tableName", { ... })`
- Update: `ctx.db.patch(id, { ... })`
- Delete: `ctx.db.delete(id)`
- Use indexes for efficient queries (define in schema)

## Environment Variables

### Root `.env`
```bash
ALCHEMY_PASSWORD=       # Password for Alchemy deployment (web app)
```

### Backend Environment (Convex Dashboard)
Set these in the Convex dashboard or `.env.local` (for local dev):
```bash
SITE_URL=              # Your deployed web app URL
NATIVE_APP_URL=        # Mobile app URL scheme (e.g., mybettertapp://)
```

### Web App `.env`
Create `apps/web/.env` based on `.env.example`:
```bash
VITE_CONVEX_URL=        # Convex deployment URL (from Convex dashboard)
VITE_CONVEX_SITE_URL=   # Convex site URL for auth
```

### Native App `.env`
Create `apps/native/.env` based on `.env.example`:
```bash
EXPO_PUBLIC_CONVEX_URL= # Convex deployment URL (same as web)
```

## File-Based Routing

### Web App (TanStack Router)
Routes in `apps/web/src/routes/`:
- `__root.tsx` - Root layout
- `index.tsx` - Home page (`/`)
- `dashboard.tsx` - Dashboard page (`/dashboard`)
- `todos.tsx` - Todos page (`/todos`)

File names map directly to URLs.

### Native App (Expo Router)
Routes in `apps/native/app/`:
- `_layout.tsx` - Root layout
- `(drawer)/` - Drawer navigation group
- File-based routing similar to Next.js

## Common Development Patterns

### Adding a New Feature
1. Define database schema in `packages/backend/convex/schema.ts` if needed
2. Create Convex functions in `packages/backend/convex/` (queries, mutations)
3. Convex automatically generates types in `_generated/`
4. Create UI in `apps/web/src/routes/` or `apps/native/app/`
5. Use Convex React hooks (`useQuery`, `useMutation`) to call functions

### Sharing Code Between Web and Native
- Both apps import from `@manis/backend` for Convex functions
- UI components are separate (different frameworks)
- Convex client usage is identical on both platforms
- Example:
  ```typescript
  import { useQuery } from "convex/react";
  import { api } from "@manis/backend/convex/_generated/api";

  const data = useQuery(api.myFile.myFunction);
  ```

## Testing
The project uses Husky for Git hooks and oxlint for linting. Lint-staged runs oxlint on staged files before commits.

## Deployment

### Convex Backend
1. Deploy to Convex: `cd packages/backend && convex deploy`
2. Set environment variables in Convex dashboard (`SITE_URL`, `NATIVE_APP_URL`)
3. Copy the deployment URL to use in web/native apps

### Web App
1. Update `apps/web/.env` with Convex production URL
2. Deploy with Alchemy: `cd apps/web && bun deploy`
3. Alchemy handles deployment to your hosting platform

### Native App
1. Update `apps/native/.env` with Convex production URL
2. Build and deploy using Expo: `cd apps/native && expo build` or EAS
3. Follow Expo's deployment guides for iOS/Android

## Key Technologies

- **Convex**: Serverless backend with real-time database
- **Better-Auth**: Authentication library integrated with Convex
- **TanStack Router**: Type-safe routing for web app
- **Expo Router**: File-based routing for native app
- **Turborepo**: Monorepo build system
- **Alchemy**: Deployment tool for web app
