import type { ClerkResource } from './resource';

export type EnableEnvironmentSettingParams = {
  enable_organizations: boolean;
  organizations_allow_personal_account: boolean;
};

/**
 * @internal
 */
export interface DevToolsResource extends ClerkResource {
  __internal_enableEnvironmentSetting: (params: EnableEnvironmentSettingParams) => Promise<void>;
}
