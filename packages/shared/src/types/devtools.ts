import type { ClerkResource } from './resource';

export type EnableEnvironmentSettingParams = {
  enable_organizations: boolean;
  organization_allow_personal_accounts?: boolean;
};

/**
 * @internal
 */
export interface DevToolsResource extends ClerkResource {
  __internal_enableEnvironmentSetting: (params: EnableEnvironmentSettingParams) => Promise<void>;
}
