import type {
  EnterpriseConnectionTestRunOauthPayloadJSON,
  EnterpriseConnectionTestRunParsedUserInfoJSON,
  EnterpriseConnectionTestRunSamlPayloadJSON,
} from '@clerk/shared/types';

import type { EnterpriseConnectionTestRunJSON, EnterpriseConnectionTestRunLogJSON } from './JSON';

/**
 * The user information Clerk parsed from the Identity Provider (IdP) response during an {@link EnterpriseConnectionTestRun}.
 */
export class EnterpriseConnectionTestRunParsedUserInfo {
  constructor(
    /** The email address the IdP returned. */
    readonly emailAddress?: string,
    /** The first name the IdP returned. */
    readonly firstName?: string,
    /** The last name the IdP returned. */
    readonly lastName?: string,
    /** The user ID the IdP returned. */
    readonly userId?: string,
  ) {}

  static fromJSON(data: EnterpriseConnectionTestRunParsedUserInfoJSON): EnterpriseConnectionTestRunParsedUserInfo {
    return new EnterpriseConnectionTestRunParsedUserInfo(
      data.email_address,
      data.first_name,
      data.last_name,
      data.user_id,
    );
  }
}

/**
 * A log entry captured during an {@link EnterpriseConnectionTestRun}.
 */
export class EnterpriseConnectionTestRunLog {
  constructor(
    /** The severity of the log entry. */
    readonly level: string,
    /** A machine-readable code for the log entry. */
    readonly code: string | undefined,
    /** A short, human-readable summary of the log entry. */
    readonly shortMessage: string | undefined,
    /** The full, human-readable message of the log entry. */
    readonly message: string,
  ) {}

  static fromJSON(data: EnterpriseConnectionTestRunLogJSON): EnterpriseConnectionTestRunLog {
    return new EnterpriseConnectionTestRunLog(data.level, data.code, data.short_message, data.message);
  }
}

/**
 * The raw SAML payloads exchanged during an {@link EnterpriseConnectionTestRun} against a SAML connection.
 */
export class EnterpriseConnectionTestRunSamlPayload {
  constructor(
    /** The SAML request Clerk sent to the IdP. */
    readonly samlRequest?: string,
    /** The SAML response the IdP returned. It contains the signed assertion for the signed-in user, so handle it like a credential. */
    readonly samlResponse?: string,
    /** The relay state of the SAML exchange. */
    readonly relayState?: string,
  ) {}

  static fromJSON(data: EnterpriseConnectionTestRunSamlPayloadJSON): EnterpriseConnectionTestRunSamlPayload {
    return new EnterpriseConnectionTestRunSamlPayload(data.saml_request, data.saml_response, data.relay_state);
  }
}

/**
 * The raw OAuth (OIDC) payloads exchanged during an {@link EnterpriseConnectionTestRun} against an OIDC connection.
 */
export class EnterpriseConnectionTestRunOauthPayload {
  constructor(
    /** The ID token the IdP returned. It's a live credential for the signed-in user, so don't log it or send it to a browser. */
    readonly idToken?: string,
    /** The access token the IdP returned. It's a live credential for the signed-in user, so don't log it or send it to a browser. */
    readonly accessToken?: string,
    /** The user info the IdP returned, as a JSON-encoded string. */
    readonly userInfo?: string,
  ) {}

  static fromJSON(data: EnterpriseConnectionTestRunOauthPayloadJSON): EnterpriseConnectionTestRunOauthPayload {
    return new EnterpriseConnectionTestRunOauthPayload(data.id_token, data.access_token, data.user_info);
  }
}

/**
 * A test sign-in against an enterprise connection's Identity Provider (IdP), started with `createEnterpriseConnectionTestRun()`.
 */
export class EnterpriseConnectionTestRun {
  constructor(
    /** The unique identifier for the test run. */
    readonly id: string,
    /** The status of the test run: `'pending'`, `'success'` or `'failed'`. */
    readonly status: string,
    /** The type of enterprise connection the test run was performed against: `'saml'`, or `'oauth'` for an OIDC connection. */
    readonly connectionType: 'saml' | 'oauth',
    /** The user information parsed from the IdP response, or `null` if none was parsed. */
    readonly parsedUserInfo: EnterpriseConnectionTestRunParsedUserInfo | null,
    /** The log entries captured during the test run. */
    readonly logs: EnterpriseConnectionTestRunLog[],
    /** The raw SAML payloads, for a test run against a SAML connection. They include the IdP's signed assertion, so handle them like credentials. */
    readonly saml: EnterpriseConnectionTestRunSamlPayload | null,
    /** The raw OAuth (OIDC) payloads, for a test run against an OIDC connection. They include live IdP tokens, so handle them like credentials. */
    readonly oauth: EnterpriseConnectionTestRunOauthPayload | null,
    /** The Unix timestamp (milliseconds) when the test run was created. */
    readonly createdAt: number,
  ) {}

  static fromJSON(data: EnterpriseConnectionTestRunJSON): EnterpriseConnectionTestRun {
    return new EnterpriseConnectionTestRun(
      data.id,
      data.status,
      data.connection_type,
      data.parsed_user_info ? EnterpriseConnectionTestRunParsedUserInfo.fromJSON(data.parsed_user_info) : null,
      (data.logs ?? []).map(log => EnterpriseConnectionTestRunLog.fromJSON(log)),
      data.saml ? EnterpriseConnectionTestRunSamlPayload.fromJSON(data.saml) : null,
      data.oauth ? EnterpriseConnectionTestRunOauthPayload.fromJSON(data.oauth) : null,
      data.created_at,
    );
  }
}
