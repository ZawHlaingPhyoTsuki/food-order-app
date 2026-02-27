/**
 * @food-order-app/contracts
 *
 * Public interface for frontend applications to consume types from the Food Order App Monorepo.
 * This package aggregates and re-exports types from multiple internal packages.
 *
 * @exports
 * - From `@food-order-app/server`: `App`, `Auth` (Elysia app type for Eden, Better Auth type)
 *
 * @security
 * - Only TYPE exports from @food-order-app/server (no runtime code)
 *
 * @usage Frontend apps (ui) should import from this package:
 * ```ts
 * import type { App } from "@food-order-app/contracts";
 * ```
 */

// Re-export API types (type-only - App for Elysia app type for Eden)
export type { App } from "server";
