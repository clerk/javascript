import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { errorThrower } from 'src/util/shared';
import { Webhook } from 'standardwebhooks';

import type { WebhookEvent } from './api/resources/Webhooks';

/**
 * @inline
 */
export type VerifyWebhookOptions = {
  /**
   * The signing secret for the webhook. It's recommended to use the [`CLERK_WEBHOOK_SIGNING_SECRET` environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#webhooks) instead.
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

export * from './api/resources/Webhooks';

/**
 * Maps Svix headers to Standard Webhooks headers for compatibility
 */
function createStandardWebhookHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};

  // Map Svix headers to Standard Webhooks headers
  const svixId = request.headers.get(SVIX_ID_HEADER)?.trim();
  const svixTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER)?.trim();
  const svixSignature = request.headers.get(SVIX_SIGNATURE_HEADER)?.trim();

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
 * @hideReturns
 *
 * @example
 * See the [guide on syncing data](https://clerk.com/docs/guides/development/webhooks/syncing) for more comprehensive and framework-specific examples that you can copy and paste into your app.
 *
 * ```ts
 * import { verifyWebhook } from '@clerk/backend/webhooks'
 *
 * export async function POST(request: Request) {
 *   try {
 *     const evt = await verifyWebhook(request)
 *
 *     // Access the event data
 *     const { id } = evt.data
 *     const eventType = evt.type
 *
 *     // Handle specific event types
 *     if (evt.type === 'user.created') {
 *       console.log('New user created:', evt.data.id)
 *       // Handle user creation
 *     }
 *
 *     return new Response('Success', { status: 200 })
 *   } catch (err) {
 *     console.error('Webhook verification failed:', err)
 *     return new Response('Webhook verification failed', { status: 400 })
 *   }
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
  const webhookId = request.headers.get(SVIX_ID_HEADER)?.trim();
  const webhookTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER)?.trim();
  const webhookSignature = request.headers.get(SVIX_SIGNATURE_HEADER)?.trim();

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    const missingHeaders = [];

    if (!webhookId) {
      missingHeaders.push(SVIX_ID_HEADER);
    }
    if (!webhookTimestamp) {
      missingHeaders.push(SVIX_TIMESTAMP_HEADER);
    }
    if (!webhookSignature) {
      missingHeaders.push(SVIX_SIGNATURE_HEADER);
    }

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
      event_attributes: payload.event_attributes,
    } as WebhookEvent;
  } catch (e) {
    return errorThrower.throw(`Unable to verify incoming webhook: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
