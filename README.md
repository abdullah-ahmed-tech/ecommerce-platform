# Ecommerce Platform Monorepo

Production-oriented full-stack ecommerce monorepo using pnpm workspaces.

## Stack

- **Backend API**: NestJS (`apps/api`)
- **Storefront**: Next.js (`apps/web`)
- **Admin dashboard**: Next.js (`apps/admin`)
- **Mobile app**: React Native + Expo (`apps/mobile`)
- **Database**: PostgreSQL
- **ORM**: Prisma (`prisma`)

## Architecture

All clients consume a central NestJS API backed by a central PostgreSQL database.

## Folder Structure

```text
.
├── apps
│   ├── admin
│   ├── api
│   ├── mobile
│   └── web
├── packages
│   ├── config
│   └── types
├── prisma
├── package.json
└── pnpm-workspace.yaml
```

## Getting Started

1. Copy env templates:

   ```bash
   cp .env.example .env
   cp prisma/.env.example prisma/.env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   cp apps/admin/.env.example apps/admin/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Generate Prisma client:

   ```bash
   pnpm db:generate
   ```

4. Run development apps:

   ```bash
   pnpm dev
   ```

## Root Scripts

- `pnpm dev`: starts API, web, admin, and mobile in parallel
- `pnpm build`: builds apps/packages
- `pnpm lint`: runs lint across apps/packages
- `pnpm typecheck`: runs TypeScript checks across apps/packages
- `pnpm db:generate`: Prisma client generation
- `pnpm db:migrate`: local migrations
- `pnpm db:studio`: database browser

## Scalability Notes

- Modular NestJS structure to add domains (catalog, cart, orders, payments)
- Shared workspace packages for cross-client contracts and configs
- Prisma schema centralized with room for domain-driven model growth
- Independent deployability of API/web/admin/mobile clients
