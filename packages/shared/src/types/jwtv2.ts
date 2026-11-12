import type { OrganizationCustomPermissionKey, OrganizationCustomRoleKey } from './organizationMembership';
import type { SessionStatus } from './session';

export interface Jwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: Uint8Array;
  raw: {
    header: string;
    payload: string;
    signature: string;
    text: string;
  };
}

// standard header claims https://www.rfc-editor.org/rfc/rfc7515.html#section-4.1
export interface JwtHeader {
  alg: string;
  typ?: string;
  cty?: string;
  crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>>;
  kid: string;
  jku?: string;
  x5u?: string | string[];
  'x5t#S256'?: string;
  x5t?: string;
  x5c?: string | string[];
  /** @internal - used by Session Minter for monotonic token freshness checks. Do not depend on this field. */
  oiat?: number;
  /** @internal - Clerk token-category tag written by the token minter. Do not depend on this field. */
  cat?: string;
}

declare global {
  /**
   * If you want to provide custom types for the getAuth().sessionClaims object,
   * simply redeclare this interface in the global namespace and provide your own custom keys.
   */
  interface CustomJwtSessionClaims {
    [k: string]: unknown;
  }
}

type JWTPayloadBase = {
  /**
   * Encoded token supporting the `getRawString` method.
   */
  __raw: string;

  /**
   * JWT Issuer - [RFC7519#section-4.1.1](https://tools.ietf.org/html/rfc7519#section-4.1.1).
   */
  iss: string;

  /**
   * JWT Subject - [RFC7519#section-4.1.2](https://tools.ietf.org/html/rfc7519#section-4.1.2).
   */
  sub: string;

  /**
   * Session ID
   */
  sid: string;

  /**
   * JWT Not Before - [RFC7519#section-4.1.5](https://tools.ietf.org/html/rfc7519#section-4.1.5).
   */
  nbf: number;

  /**
   * JWT Expiration Time - [RFC7519#section-4.1.4](https://tools.ietf.org/html/rfc7519#section-4.1.4).
   */
  exp: number;

  /**
   * JWT Issued At - [RFC7519#section-4.1.6](https://tools.ietf.org/html/rfc7519#section-4.1.6).
   */
  iat: number;

  /**
   * JWT Authorized party - [RFC7800#section-3](https://tools.ietf.org/html/rfc7800#section-3).
   */
  azp?: string;

  /**
   * JWT Actor - [RFC8693](https://www.rfc-editor.org/rfc/rfc8693.html#name-act-actor-claim).
   */
  act?: ActClaim;

  /**
   * Agent claim (agt). Present on agent sessions. These sessions do not carry an `act` claim.
   */
  agt?: AgentClaim;

  /**
   * Factor verification age (fva). The tuple represents the minutes that have passed since the last time a first or second factor were verified.
   *
   * @experimental This API is experimental and may change at any moment.
   */
  fva?: [fistFactorAge: number, secondFactorAge: number];

  /**
   * Session status
   */
  sts?: SessionStatusClaim;

  /**
   * Any other JWT Claim Set member.
   */
  [propName: string]: unknown;
};

export type VersionedJwtPayload =
  | {
      v?: undefined;

      /**
       *
       * Active Organization Permissions.
       */
      org_permissions?: OrganizationCustomPermissionKey[];

      /**
       * Active Organization ID.
       */
      org_id?: string;

      /**
       * Active Organization slug.
       */
      org_slug?: string;

      /**
       * Active Organization Role.
       */
      org_role?: OrganizationCustomRoleKey;
    }
  | {
      /**
       * The version of the JWT payload.
       *
       * @experimental
       */
      v: 2;

      /**
       * Features for session.
       */
      fea?: string;

      /**
       * Plans for session.
       */
      pla?: string;

      /**
       * Active Organization information.
       *
       * @experimental This structure is subject to change.
       */
      o?: {
        /**
         * Active Organization ID.
         */
        id: string;

        /**
         * Active Organization slug.
         */
        slg?: string;

        /**
         * Active Organization role.
         */
        rol?: OrganizationCustomRoleKey;

        /**
         * Active Organization permissions.
         */
        per?: string;

        /**
         * Feature mapping.
         */
        fpm?: string;
      };

      org_permissions?: never;
      org_id?: never;
      org_slug?: never;
      org_role?: never;
    };

export type JwtPayload = JWTPayloadBase & CustomJwtSessionClaims & VersionedJwtPayload;

/**
 * The type of the actor claim.
 */
export type ActClaimType = 'agent';

/**
 * JWT Actor - [RFC8693](https://www.rfc-editor.org/rfc/rfc8693.html#name-act-actor-claim).
 *
 * @inline
 */
export interface ActClaim {
  /**
   * The identifier for the user that is impersonating the current user.
   */
  sub: string;
  /**
   * The type of the actor.
   */
  type?: ActClaimType;
  [x: string]: unknown;
}

/**
 * Agent claim (`agt`). Present on agent sessions: agent task sessions and Poppy sessions.
 *
 * @inline
 */
export interface AgentClaim {
  /**
   * The ID of the agent. For a Poppy session, the agent's client ID URL.
   */
  id: string;
  /**
   * The ID of the agent task that was used to create the session. Absent for a Poppy session.
   */
  tsk?: string;
  /**
   * The registry that issued the agent. For a Poppy session, the same client ID URL as `id`.
   */
  reg: string;
  /**
   * The Poppy identity of a Poppy session. Absent for an agent task session.
   *
   * @experimental This field can change in a minor release.
   */
  poppy?: PoppyClaim;
  /**
   * Present and `true` when the session is restricted. Poppy sessions are always restricted.
   */
  rst?: boolean;
}

/**
 * The Poppy identity of a Poppy session.
 *
 * @experimental These fields can change in a minor release.
 *
 * @inline
 */
export interface PoppyClaim {
  /**
   * The Poppy session ID.
   */
  session_id: string;
  /**
   * The agent's client ID URL.
   */
  client_id: string;
  /**
   * The user ID that the agent uses for the user. It is not a Clerk user ID.
   */
  user_id: string;
  /**
   * An optional ID that the agent sets for itself. It is not a Clerk ID.
   */
  agent_id?: string;
}

/**
 * ActClaim narrowed to actor type `'agent'`. This shape is shared by `Session.agent` and the `agent` property of the auth object.
 *
 * @inline
 */
export type AgentActClaim = ActClaim & {
  type: 'agent';
  /**
   * The ID of the agent task that was used to create the session. `undefined` for a Poppy session.
   */
  task_id?: string;
  /**
   * The Poppy identity of a Poppy session. Set only on the `agent` property of the auth object, from the session token; `undefined` for an agent task session.
   *
   * @experimental This field can change in a minor release.
   */
  poppy?: PoppyClaim;
  /**
   * Whether the session is restricted. In a restricted session, Clerk's Frontend API refuses the agent's writes. `false` when the session does not say so. Until Clerk adds the flag to the session token, it reads `false` on the server and during server rendering. Clerk enforces the restriction; to refuse agent sessions, check the agent itself, not this field.
   */
  restricted?: boolean;
};

/**
 * The current state of the session which can only be `active` or `pending`.
 */
export type SessionStatusClaim = Extract<SessionStatus, 'active' | 'pending'>;
