/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { Request as ExpressRequest } from 'express';

import { incomingMessageToRequest } from './utils';

// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook Express Request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @see {@link https://clerk.com/docs/webhooks/sync-data} to learn more about syncing Clerk data to your application using webhooks
 */
export async function verifyWebhook(req: ExpressRequest, options?: VerifyWebhookOptions) {
  const webRequest = incomingMessageToRequest(req);
  const clonedRequest = new Request(webRequest, {
    body: req.body,
  });
  return verifyWebhookBase(clonedRequest, options);
}
