/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';
import type { H3Event } from 'h3';
import { toWebRequest } from 'h3';

// @ts-expect-error: Nitro import. Handled by Nuxt.
import { useRuntimeConfig } from '#imports';

// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param event - The incoming webhook H3 Event object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to NUXT_CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @see {@link https://clerk.com/docs/webhooks/sync-data} to learn more about syncing Clerk data to your application using webhooks
 */
export async function verifyWebhook(event: H3Event, options?: VerifyWebhookOptions) {
  const webRequest = toWebRequest(event);
  const runtimeConfig = useRuntimeConfig(event);
  const secret = options?.signingSecret ?? runtimeConfig.clerk.webhookSigningSecret;
  return verifyWebhookBase(webRequest, {
    signingSecret: secret,
  });
}
