import type { AnyRouter } from '@tanstack/react-router';
import type { EventHandler } from 'vinxi/http';

import { rootAuthBeforeLoader } from './rootAuthBeforeLoader';

export type RequestHandler<TRouter extends AnyRouter> = (ctx: {
  request: Request;
  router: TRouter;
  responseHeaders: Headers;
}) => Promise<Response>;
export type CustomizeRequestHandler<TRouter extends AnyRouter> = (cb: RequestHandler<TRouter>) => EventHandler;

export function clerkMiddlewareHandler<TRouter extends AnyRouter>(cb: RequestHandler<TRouter>) {
  // TODO: Needs improvement
  return async ({ request, router, responseHeaders }: Parameters<RequestHandler<TRouter>>[0]) => {
    try {
      const authContext = await rootAuthBeforeLoader(request);

      router.update({
        context: authContext || {},
      });

      await router.load();
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }

      throw error;
    }

    return await cb({
      request,
      router,
      responseHeaders,
    });
  };
}

/**
 * Re-export resource types from @clerk/backend
 */
export type {
  OrganizationMembershipRole,
  // Webhook event types
  WebhookEvent,
  WebhookEventType,
  // Resources
  AllowlistIdentifier,
  Client,
  OrganizationMembership,
  EmailAddress,
  ExternalAccount,
  Invitation,
  OauthAccessToken,
  Organization,
  OrganizationInvitation,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  SMSMessage,
  Token,
  User,
} from '@clerk/backend';
