import type { ClerkResourceJSON } from './json';
import type { ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';

export interface EnterpriseConnectionTestRunInitJSON {
  url: string;
}

export interface EnterpriseConnectionTestRunInitResource {
  url: string;
}

export type EnterpriseConnectionTestRunStatus = 'pending' | 'success' | 'failed';

export interface EnterpriseConnectionTestRunParsedUserInfoJSON {
  email_address?: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
}

export interface EnterpriseConnectionTestRunLogJSON {
  level?: string;
  code?: string;
  short_message?: string;
  message?: string;
}

export interface EnterpriseConnectionTestRunSamlPayloadJSON {
  saml_request?: string;
  saml_response?: string;
  relay_state?: string;
}

export interface EnterpriseConnectionTestRunOauthPayloadJSON {
  id_token?: string;
  access_token?: string;
  user_info?: string;
}

export interface EnterpriseConnectionTestRunJSON extends ClerkResourceJSON {
  object: 'enterprise_connection_test_run';
  status: string;
  connection_type: 'saml' | 'oauth';
  parsed_user_info?: EnterpriseConnectionTestRunParsedUserInfoJSON | null;
  logs?: EnterpriseConnectionTestRunLogJSON[];
  saml?: EnterpriseConnectionTestRunSamlPayloadJSON | null;
  oauth?: EnterpriseConnectionTestRunOauthPayloadJSON | null;
  created_at: number;
}

export type EnterpriseConnectionTestRunJSONSnapshot = EnterpriseConnectionTestRunJSON;

export interface EnterpriseConnectionTestRunParsedUserInfoResource {
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
}

export interface EnterpriseConnectionTestRunLogResource {
  level?: string;
  code?: string;
  shortMessage?: string;
  message?: string;
}

export interface EnterpriseConnectionTestRunSamlPayloadResource {
  samlRequest?: string;
  samlResponse?: string;
  relayState?: string;
}

export interface EnterpriseConnectionTestRunOauthPayloadResource {
  idToken?: string;
  accessToken?: string;
  userInfo?: string;
}

export interface EnterpriseConnectionTestRunResource extends ClerkResource {
  id: string;
  status: string;
  connectionType: 'saml' | 'oauth';
  parsedUserInfo: EnterpriseConnectionTestRunParsedUserInfoResource | null;
  logs: EnterpriseConnectionTestRunLogResource[];
  saml: EnterpriseConnectionTestRunSamlPayloadResource | null;
  oauth: EnterpriseConnectionTestRunOauthPayloadResource | null;
  createdAt: Date | null;
  __internal_toSnapshot: () => EnterpriseConnectionTestRunJSONSnapshot;
}

export type EnterpriseConnectionTestRunsPaginatedJSON = {
  data: EnterpriseConnectionTestRunJSON[];
  total_count: number;
};

export type GetEnterpriseConnectionTestRunsParams = ClerkPaginationParams<{
  status?: EnterpriseConnectionTestRunStatus[];
}>;
