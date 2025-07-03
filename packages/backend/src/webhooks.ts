import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { errorThrower } from 'src/util/shared';
import { Webhook } from 'standardwebhooks';

import type { WebhookEvent } from './api/resources/Webhooks';

/**
 * @inline
 */
export type VerifyWebhookOptions = {
  /**
   * The signing secret for the webhook. It's recommended to use the [`CLERK_WEBHOOK_SIGNING_SECRET` environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#webhooks) instead.
   */
  signingSecret?: string;
};

// Standard Webhooks header names
const STANDARD_WEBHOOK_ID_HEADER = 'webhook-id';
const STANDARD_WEBHOOK_TIMESTAMP_HEADER = 'webhook-timestamp';
const STANDARD_WEBHOOK_SIGNATURE_HEADER = 'webhook-signature';

// Svix header names (for mapping)
const SVIX_ID_HEADER = 'svix-id';
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp';
const SVIX_SIGNATURE_HEADER = 'svix-signature';

const REQUIRED_WEBHOOK_HEADERS = [SVIX_ID_HEADER, SVIX_TIMESTAMP_HEADER, SVIX_SIGNATURE_HEADER] as const;

export * from './api/resources/Webhooks';

/**
 * Maps Svix headers to Standard Webhooks headers for compatibility
 */
function createStandardWebhookHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};

  // Map Svix headers to Standard Webhooks headers
  const svixId = request.headers.get(SVIX_ID_HEADER);
  const svixTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER);
  const svixSignature = request.headers.get(SVIX_SIGNATURE_HEADER);

  if (svixId) {
    headers[STANDARD_WEBHOOK_ID_HEADER] = svixId;
  }
  if (svixTimestamp) {
    headers[STANDARD_WEBHOOK_TIMESTAMP_HEADER] = svixTimestamp;
  }
  if (svixSignature) {
    headers[STANDARD_WEBHOOK_SIGNATURE_HEADER] = svixSignature;
  }

  return headers;
}

/**
 * Verifies the authenticity of a webhook request using Standard Webhooks. Returns a promise that resolves to the verified webhook event data.
 *
 * @param request - The request object.
 * @param options - Optional configuration object.
 *
 * @displayFunctionSignature
 *
 * @example
 * See the [guide on syncing data](https://clerk.com/docs/webhooks/sync-data) for more comprehensive and framework-specific examples that you can copy and paste into your app.
 *
 * ```ts
 * try {
 *   const evt = await verifyWebhook(request)
 *
 *   // Access the event data
 *   const { id } = evt.data
 *   const eventType = evt.type
 *
 *   // Handle specific event types
 *   if (evt.type === 'user.created') {
 *     console.log('New user created:', evt.data.id)
 *     // Handle user creation
 *   }
 *
 *   return new Response('Success', { status: 200 })
 * } catch (err) {
 *   console.error('Webhook verification failed:', err)
 *   return new Response('Webhook verification failed', { status: 400 })
 * }
 * ```
 */
export async function verifyWebhook(request: Request, options: VerifyWebhookOptions = {}): Promise<WebhookEvent> {
  const secret = options.signingSecret ?? getEnvVariable('CLERK_WEBHOOK_SIGNING_SECRET');

  if (!secret) {
    return errorThrower.throw(
      'Missing webhook signing secret. Set the CLERK_WEBHOOK_SIGNING_SECRET environment variable with the webhook secret from the Clerk Dashboard.',
    );
  }

  // Check for required Svix headers
  const webhookId = request.headers.get(SVIX_ID_HEADER);
  const webhookTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER);
  const webhookSignature = request.headers.get(SVIX_SIGNATURE_HEADER);

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    const missingHeaders = REQUIRED_WEBHOOK_HEADERS.filter(header => !request.headers.has(header));
    return errorThrower.throw(`Missing required webhook headers: ${missingHeaders.join(', ')}`);
  }

  const body = await request.text();

  // Create Standard Webhooks compatible headers mapping
  const standardHeaders = createStandardWebhookHeaders(request);

  // Initialize Standard Webhooks verifier
  const webhook = new Webhook(secret);

  try {
    // Verify using Standard Webhooks - this provides constant-time comparison
    // and proper signature format handling
    const payload = webhook.verify(body, standardHeaders) as Record<string, unknown>;

    return {
      type: payload.type,
      object: 'event',
      data: payload.data,
    } as WebhookEvent;
  } catch (e) {
    return errorThrower.throw(`Unable to verify incoming webhook: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
