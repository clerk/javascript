import type {
  ClerkResourceReloadParams,
  EnterpriseConnectionTestRunJSON,
  EnterpriseConnectionTestRunJSONSnapshot,
  EnterpriseConnectionTestRunLogResource,
  EnterpriseConnectionTestRunOauthPayloadJSON,
  EnterpriseConnectionTestRunOauthPayloadResource,
  EnterpriseConnectionTestRunParsedUserInfoJSON,
  EnterpriseConnectionTestRunParsedUserInfoResource,
  EnterpriseConnectionTestRunResource,
  EnterpriseConnectionTestRunSamlPayloadJSON,
  EnterpriseConnectionTestRunSamlPayloadResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { clerkUnsupportedReloadMethod } from '../errors';

export class EnterpriseConnectionTestRun implements EnterpriseConnectionTestRunResource {
  pathRoot = '/me';

  id!: string;
  status!: string;
  connectionType!: 'saml' | 'oauth';
  parsedUserInfo: EnterpriseConnectionTestRunParsedUserInfoResource | null = null;
  logs: EnterpriseConnectionTestRunLogResource[] = [];
  saml: EnterpriseConnectionTestRunSamlPayloadResource | null = null;
  oauth: EnterpriseConnectionTestRunOauthPayloadResource | null = null;
  createdAt: Date | null = null;

  constructor(data: EnterpriseConnectionTestRunJSON) {
    this.fromJSON(data);
  }

  reload(_?: ClerkResourceReloadParams): Promise<this> {
    clerkUnsupportedReloadMethod('EnterpriseConnectionTestRun');
  }

  private fromJSON(data: EnterpriseConnectionTestRunJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.status = data.status;
    this.connectionType = data.connection_type;
    this.parsedUserInfo = parsedUserInfoFromJSON(data.parsed_user_info ?? null);
    this.saml = samlPayloadFromJSON(data.saml ?? null);
    this.oauth = oauthPayloadFromJSON(data.oauth ?? null);
    this.createdAt = unixEpochToDate(data.created_at);
    this.logs = (data.logs ?? []).map(log => ({
      level: log.level,
      code: log.code,
      shortMessage: log.short_message,
      message: log.message,
    }));

    return this;
  }

  public __internal_toSnapshot(): EnterpriseConnectionTestRunJSONSnapshot {
    return {
      object: 'enterprise_connection_test_run',
      id: this.id,
      status: this.status,
      connection_type: this.connectionType,
      parsed_user_info: parsedUserInfoToJSON(this.parsedUserInfo),
      saml: samlPayloadToJSON(this.saml),
      oauth: oauthPayloadToJSON(this.oauth),
      logs: this.logs.map(log => ({
        level: log.level,
        code: log.code,
        short_message: log.shortMessage,
        message: log.message,
      })),
      created_at: this.createdAt?.getTime() ?? 0,
    };
  }
}

function parsedUserInfoFromJSON(
  data: EnterpriseConnectionTestRunParsedUserInfoJSON | null | undefined,
): EnterpriseConnectionTestRunParsedUserInfoResource | null {
  if (!data) {
    return null;
  }

  return {
    emailAddress: data.email_address,
    firstName: data.first_name,
    lastName: data.last_name,
    userId: data.user_id,
  };
}

function parsedUserInfoToJSON(
  data: EnterpriseConnectionTestRunParsedUserInfoResource | null,
): EnterpriseConnectionTestRunParsedUserInfoJSON | null {
  if (!data) {
    return null;
  }

  return {
    email_address: data.emailAddress,
    first_name: data.firstName,
    last_name: data.lastName,
    user_id: data.userId,
  };
}

function samlPayloadFromJSON(
  data: EnterpriseConnectionTestRunSamlPayloadJSON | null | undefined,
): EnterpriseConnectionTestRunSamlPayloadResource | null {
  if (!data) {
    return null;
  }

  return {
    samlRequest: data.saml_request,
    samlResponse: data.saml_response,
    relayState: data.relay_state,
  };
}

function samlPayloadToJSON(
  data: EnterpriseConnectionTestRunSamlPayloadResource | null,
): EnterpriseConnectionTestRunSamlPayloadJSON | null {
  if (!data) {
    return null;
  }

  return {
    saml_request: data.samlRequest,
    saml_response: data.samlResponse,
    relay_state: data.relayState,
  };
}

function oauthPayloadFromJSON(
  data: EnterpriseConnectionTestRunOauthPayloadJSON | null | undefined,
): EnterpriseConnectionTestRunOauthPayloadResource | null {
  if (!data) {
    return null;
  }

  return {
    idToken: data.id_token,
    accessToken: data.access_token,
    userInfo: data.user_info,
  };
}

function oauthPayloadToJSON(
  data: EnterpriseConnectionTestRunOauthPayloadResource | null,
): EnterpriseConnectionTestRunOauthPayloadJSON | null {
  if (!data) {
    return null;
  }

  return {
    id_token: data.idToken,
    access_token: data.accessToken,
    user_info: data.userInfo,
  };
}
