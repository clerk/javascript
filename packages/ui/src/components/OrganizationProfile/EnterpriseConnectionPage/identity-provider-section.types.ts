import type { LocalizationKey } from '../../../customizables';
import type { SSOConnection, SSOConnectionCommands } from '../../ConfigureSSO/configure-sso.types';

export type IdentityProviderSectionProps = {
  connection: SSOConnection;
  updateConnection: SSOConnectionCommands['updateConnection'];
};

export type FormScreenProps = IdentityProviderSectionProps & { onSuccess: () => void; onReset: () => void };

export type Detail = {
  id: string;
  label: LocalizationKey;
  value?: string;
  valueKey?: LocalizationKey;
  tone?: 'danger' | 'warning';
};
