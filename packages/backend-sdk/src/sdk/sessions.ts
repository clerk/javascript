/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { sessionsCreate } from "../funcs/sessionsCreate.js";
import { sessionsCreateToken } from "../funcs/sessionsCreateToken.js";
import { sessionsCreateTokenFromTemplate } from "../funcs/sessionsCreateTokenFromTemplate.js";
import { sessionsGet } from "../funcs/sessionsGet.js";
import { sessionsList } from "../funcs/sessionsList.js";
import { sessionsRefresh } from "../funcs/sessionsRefresh.js";
import { sessionsRevoke } from "../funcs/sessionsRevoke.js";
import { sessionsVerify } from "../funcs/sessionsVerify.js";
import { ClientSDK, RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";

export class Sessions extends ClientSDK {
  /**
   * List all sessions
   *
   * @remarks
   * Returns a list of all sessions.
   * The sessions are returned sorted by creation date, with the newest sessions appearing first.
   * **Deprecation Notice (2024-01-01):** All parameters were initially considered optional, however
   * moving forward at least one of `client_id` or `user_id` parameters should be provided.
   */
  async list(
    request: operations.GetSessionListRequest,
    options?: RequestOptions,
  ): Promise<Array<components.Session>> {
    return unwrapAsync(sessionsList(
      this,
      request,
      options,
    ));
  }

  /**
   * Create a new active session
   *
   * @remarks
   * Create a new active session for the provided user ID.
   *
   * **This operation is intended only for use in testing, and is not available for production instances.** If you are looking to generate a user session from the backend,
   * we recommend using the [Sign-in Tokens](https://clerk.com/docs/reference/backend-api/tag/Sign-in-Tokens#operation/CreateSignInToken) resource instead.
   */
  async create(
    request?: operations.CreateSessionRequestBody | undefined,
    options?: RequestOptions,
  ): Promise<components.Session> {
    return unwrapAsync(sessionsCreate(
      this,
      request,
      options,
    ));
  }

  /**
   * Retrieve a session
   *
   * @remarks
   * Retrieve the details of a session
   */
  async get(
    request: operations.GetSessionRequest,
    options?: RequestOptions,
  ): Promise<components.Session> {
    return unwrapAsync(sessionsGet(
      this,
      request,
      options,
    ));
  }

  /**
   * Refresh a session
   *
   * @remarks
   * Refreshes a session by creating a new session token. A 401 is returned when there
   * are validation errors, which signals the SDKs to fallback to the handshake flow.
   */
  async refresh(
    request: operations.RefreshSessionRequest,
    options?: RequestOptions,
  ): Promise<components.Session> {
    return unwrapAsync(sessionsRefresh(
      this,
      request,
      options,
    ));
  }

  /**
   * Revoke a session
   *
   * @remarks
   * Sets the status of a session as "revoked", which is an unauthenticated state.
   * In multi-session mode, a revoked session will still be returned along with its client object, however the user will need to sign in again.
   */
  async revoke(
    request: operations.RevokeSessionRequest,
    options?: RequestOptions,
  ): Promise<components.Session> {
    return unwrapAsync(sessionsRevoke(
      this,
      request,
      options,
    ));
  }

  /**
   * Verify a session
   *
   * @remarks
   * Returns the session if it is authenticated, otherwise returns an error.
   * WARNING: This endpoint is deprecated and will be removed in future versions. We strongly recommend switching to networkless verification using short-lived session tokens,
   *          which is implemented transparently in all recent SDK versions (e.g. [NodeJS SDK](https://clerk.com/docs/backend-requests/handling/nodejs#clerk-express-require-auth)).
   *          For more details on how networkless verification works, refer to our [Session Tokens documentation](https://clerk.com/docs/backend-requests/resources/session-tokens).
   *
   * @deprecated method: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  async verify(
    request: operations.VerifySessionRequest,
    options?: RequestOptions,
  ): Promise<components.Session> {
    return unwrapAsync(sessionsVerify(
      this,
      request,
      options,
    ));
  }

  /**
   * Create a session token
   *
   * @remarks
   * Creates a session JSON Web Token (JWT) based on a session.
   */
  async createToken(
    request: operations.CreateSessionTokenRequest,
    options?: RequestOptions,
  ): Promise<operations.CreateSessionTokenResponseBody> {
    return unwrapAsync(sessionsCreateToken(
      this,
      request,
      options,
    ));
  }

  /**
   * Create a session token from a jwt template
   *
   * @remarks
   * Creates a JSON Web Token(JWT) based on a session and a JWT Template name defined for your instance
   */
  async createTokenFromTemplate(
    request: operations.CreateSessionTokenFromTemplateRequest,
    options?: RequestOptions,
  ): Promise<operations.CreateSessionTokenFromTemplateResponseBody> {
    return unwrapAsync(sessionsCreateTokenFromTemplate(
      this,
      request,
      options,
    ));
  }
}
