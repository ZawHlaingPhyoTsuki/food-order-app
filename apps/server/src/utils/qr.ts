import { env } from "@food-order-app/env/server";

/**
 * Generate a QR code URL for a table.
 * Returns the customer-facing URL that the QR code should point to.
 * For actual QR image generation, the frontend will render QR codes client-side.
 */
export function generateTableUrl(orgSlug: string, tableToken: string): string {
  return `${env.CORS_ORIGIN}/${orgSlug}/table/${tableToken}`;
}