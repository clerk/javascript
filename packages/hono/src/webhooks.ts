/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { Context } from 'hono';

// Re-export everything from backend webhooks
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request from Clerk using Svix.
 *
 * @param c - The Hono Context object from the webhook handler
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { verifyWebhook } from '@clerk/hono/webhooks';
 *
 * const app = new Hono();
 *
 * app.post('/webhooks/clerk', async (c) => {
 *   const evt = await verifyWebhook(c);
 *   // Handle the webhook event
 *   return c.json({ received: true });
 * });
 * ```
 *
 * @see {@link https://clerk.com/docs/webhooks/sync-data} to learn more about syncing Clerk data to your application using webhooks
 */
export async function verifyWebhook(c: Context, options?: VerifyWebhookOptions) {
  // Hono's c.req.raw is already a standard Web Request
  // We need to clone it with the body for verification
  const body = await c.req.text();
  const clonedRequest = new Request(c.req.raw, {
    body,
  });
  return verifyWebhookBase(clonedRequest, options);
}
