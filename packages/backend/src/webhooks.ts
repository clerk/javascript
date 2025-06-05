import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import crypto from 'crypto';
import { errorThrower } from 'src/util/shared';

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

const SVIX_ID_HEADER = 'svix-id';
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp';
const SVIX_SIGNATURE_HEADER = 'svix-signature';

const REQUIRED_SVIX_HEADERS = [SVIX_ID_HEADER, SVIX_TIMESTAMP_HEADER, SVIX_SIGNATURE_HEADER] as const;

export * from './api/resources/Webhooks';

/**
 * Verifies the authenticity of a webhook request using Svix. Returns a promise that resolves to the verified webhook event data.
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
  const svixId = request.headers.get(SVIX_ID_HEADER);
  const svixTimestamp = request.headers.get(SVIX_TIMESTAMP_HEADER);
  const svixSignature = request.headers.get(SVIX_SIGNATURE_HEADER);

  if (!secret) {
    return errorThrower.throw(
      'Missing webhook signing secret. Set the CLERK_WEBHOOK_SIGNING_SECRET environment variable with the webhook secret from the Clerk Dashboard.',
    );
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    const missingHeaders = REQUIRED_SVIX_HEADERS.filter(header => !request.headers.has(header));
    return errorThrower.throw(`Missing required Svix headers: ${missingHeaders.join(', ')}`);
  }

  const body = await request.text();

  const signedContent = `${svixId}.${svixTimestamp}.${body}`;

  const secretBytes = Buffer.from(secret.split('_')[1], 'base64');

  const constructedSignature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  // svixSignature can be a string with one or more space separated signatures
  if (svixSignature.split(' ').includes(constructedSignature)) {
    return errorThrower.throw('Incoming webhook does not have a valid signature');
  }

  const payload = JSON.parse(body);

  return {
    type: payload.type,
    object: 'event',
    data: payload.data,
  } as WebhookEvent;
}
