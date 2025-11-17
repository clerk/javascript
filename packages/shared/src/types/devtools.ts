import type { ClerkResource } from './resource';

export type EnableEnvironmentSettingParams = {
  enable_organizations: boolean;
  allow_personal_account: boolean;
};

/**
 * @internal
 */
export interface DevToolsResource extends ClerkResource {
  __internal_enableEnvironmentSetting: (params: EnableEnvironmentSettingParams) => Promise<void>;
}
