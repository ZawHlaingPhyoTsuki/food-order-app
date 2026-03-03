# 🍜 Food Order App – Monorepo Architecture Guide

## 1. Project Overview

This is a multi-tenant QR-based restaurant ordering SaaS built with a Turborepo monorepo architecture.

The system supports:

* Restaurant owners (OWNER)
* Platform super admins (SUPER_ADMIN)
* Customers (no account required)

The app allows customers to scan a QR code at a restaurant table and place orders in real time.

---

# 2. Monorepo Structure

The project uses Bun + Turborepo workspaces.

```
apps/
  server/     → Backend (Elysia + Prisma + Redis)
  web/        → Frontend (React + Vite + TanStack Router)

packages/
  config/     → Shared TypeScript config
  contracts/  → Shared types & API contracts
  env/        → Shared environment validation
```

All internal packages use `workspace:*`.

---

# 3. Backend (apps/server)

Runtime: Bun
Framework: Elysia
ORM: Prisma
Cache: Upstash Redis

Entry point:

```
apps/server/src/index.ts
```

---

## 3.1 Backend Folder Structure

```
src/
  generated/        → Prisma + Prismabox generated code
  libs/             → Core libraries (prisma, redis, auth)
  modules/          → Business domains
  plugins/          → Role-based Elysia plugins
  utils/            → Helpers (QR, etc)
```

---

## 3.2 Backend Architecture Rules

Each feature module follows:

```
module/
  index.ts   → HTTP route definitions
  model.ts   → Validation schemas (TypeBox / Zod)
  service.ts → Business logic (DB + Redis)
```

Business logic must:

* Never mix HTTP logic
* Never expose cross-organization data
* Always validate organizationId

---

# 4. Core Backend Concepts

## 4.1 Multi-Tenancy

Every organization (restaurant) is isolated.

All queries MUST include:

* organizationId

Redis keys MUST include:

* organizationId or tableToken

Never allow cross-tenant data access.

---

## 4.2 Redis Strategy

### Table Session

Key:

```
session:{tableToken}
```

TTL: 30 minutes

Purpose:
Track active dining session per table.

---

### Kitchen Queue

Key:

```
kitchen:{organizationId}
```

Type:
Sorted Set (ZSET)

Score:
Order created timestamp

Purpose:
Realtime kitchen order queue.

---

### Order Cache

Key:

```
order:{orderId}
```

TTL: 5 minutes

Purpose:
Reduce DB load for order status checks.

---

## 4.3 Order Flow

1. Customer scans QR
2. Backend validates tableToken
3. Create or fetch Redis session
4. Customer places order
5. Save order to PostgreSQL
6. Push orderId to Redis kitchen queue
7. Cache order

---

# 5. Frontend (apps/web)

Framework:

* React 19
* Vite
* TanStack Router
* TanStack Query
* ShadCN UI

Entry:

```
apps/web/src/main.tsx
```

---

## 5.1 Frontend Structure

```
src/
  routes/       → Route-based pages
  components/   → Reusable UI
  hooks/
  lib/          → API client, query client
```

Routing uses TanStack Router file-based routing.

---

## 5.2 Route Groups

The app should logically support:

Public (Customer):

```
/:orgSlug/table/:tableToken
```

Owner Dashboard:

```
/dashboard
/dashboard/orders
/dashboard/menu
/dashboard/tables
```

Admin Dashboard:

```
/admin/dashboard
/admin/organizations
```

---

# 6. Shared Packages

## packages/contracts

Contains:

* Shared types
* API request/response shapes
* Enum re-exports

Frontend and backend must rely on this for type safety.

---

## packages/env

Contains:

* Environment variable validation
* Separate validation for server and web

Never access process.env directly.
Always use validated env objects.

---

# 7. Database

ORM: Prisma
Provider: PostgreSQL

Core Entities:

* User
* Organization
* Table
* MenuCategory
* MenuItem
* Order
* OrderItem

All relationships are multi-tenant.

---

# 8. Security Rules

* Only ACTIVE organizations can accept orders
* OWNER can only access their organization
* SUPER_ADMIN can access all
* Customer never sees internal IDs
* Always validate tableToken belongs to organization

---

# 9. WebSocket

Used for:

* Kitchen live updates
* Order status updates

Events:

* kitchen:new-order
* order:status-updated
* table:session-expired

---

# 10. Development Commands

From root:

Run everything:

```
bun run dev
```

Run only backend:

```
bun run dev:server
```

Run only frontend:

```
bun run dev:web
```

Database:

```
bun run db:migrate
bun run db:seed
bun run db:studio
```

---

# 11. Code Standards

* Service layer handles DB + Redis
* Route layer handles HTTP only
* No business logic inside route files
* Always validate input
* Always use shared types from contracts
* Never duplicate type definitions

---

# 12. Future Scalability

Planned features:

* PromptPay QR integration
* Staff roles (kitchen, cashier)
* Analytics dashboard
* Multi-branch support
* Background jobs (BullMQ)
* Rate limiting per table

---

# 13. AI Development Rules

When generating code:

* Respect folder structure
* Do not create new root folders
* Keep domain separation
* Follow existing module pattern
* Use workspace imports
* Do not hardcode environment variables
* Use Redis for realtime data
* Always handle multi-tenant validation

---

# 14. Product Vision

Simple.
Fast.
Affordable.
Designed for small Thai/Myanmar restaurants.

Goal:
Replace pen-and-paper ordering with a modern QR system.
