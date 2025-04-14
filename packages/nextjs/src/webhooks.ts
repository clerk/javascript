/* eslint-disable import/export */
import type { VerifyWebhookOptions } from '@clerk/backend/webhooks';
import { verifyWebhook as verifyWebhookBase } from '@clerk/backend/webhooks';

import { getHeader, isNextRequest, isRequestWebAPI } from './server/headers-utils';
import type { RequestLike } from './server/types';
// Ordering of exports matter here since
// we're overriding the base verifyWebhook
export * from '@clerk/backend/webhooks';

const SVIX_ID_HEADER = 'svix-id';
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp';
const SVIX_SIGNATURE_HEADER = 'svix-signature';

/**
 * Verifies the authenticity of a webhook request using Svix.
 *
 * @param request - The incoming webhook request object
 * @param options - Optional configuration object
 * @param options.signingSecret - Custom signing secret. If not provided, falls back to CLERK_WEBHOOK_SIGNING_SECRET env variable
 * @throws Will throw an error if the webhook signature verification fails
 * @returns A promise that resolves to the verified webhook event data
 *
 * @example
 * ```typescript
 * import { verifyWebhook } from '@clerk/nextjs/webhooks';
 *
 * export async function POST(req: Request) {
 *   try {
 *     const evt = await verifyWebhook(req);
 *
 *     // Access the event data
 *     const { id } = evt.data;
 *     const eventType = evt.type;
 *
 *     // Handle specific event types
 *     if (evt.type === 'user.created') {
 *       console.log('New user created:', evt.data.id);
 *       // Handle user creation
 *     }
 *
 *     return new Response('Success', { status: 200 });
 *   } catch (err) {
 *     console.error('Webhook verification failed:', err);
 *     return new Response('Webhook verification failed', { status: 400 });
 *   }
 * }
 * ```
 */
export async function verifyWebhook(request: RequestLike, options?: VerifyWebhookOptions) {
  if (isNextRequest(request) || isRequestWebAPI(request)) {
    return verifyWebhookBase(request, options);
  }

  const webRequest = nextApiRequestToWebRequest(request);
  return verifyWebhookBase(webRequest, options);
}

function nextApiRequestToWebRequest(req: RequestLike): Request {
  const headers = new Headers();
  const svixId = getHeader(req, SVIX_ID_HEADER) || '';
  const svixTimestamp = getHeader(req, SVIX_TIMESTAMP_HEADER) || '';
  const svixSignature = getHeader(req, SVIX_SIGNATURE_HEADER) || '';

  headers.set(SVIX_ID_HEADER, svixId);
  headers.set(SVIX_TIMESTAMP_HEADER, svixTimestamp);
  headers.set(SVIX_SIGNATURE_HEADER, svixSignature);

  // Create a dummy URL to make a Request object
  const protocol = getHeader(req, 'x-forwarded-proto') || 'http';
  const host = getHeader(req, 'x-forwarded-host') || 'clerk-dummy';
  const dummyOriginReqUrl = new URL(req.url || '', `${protocol}://${host}`);

  const body = 'body' in req && req.body ? JSON.stringify(req.body) : undefined;

  return new Request(dummyOriginReqUrl, {
    method: req.method,
    headers,
    body,
  });
}
