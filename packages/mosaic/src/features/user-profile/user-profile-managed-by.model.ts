import type { ProviderLogoId } from '../../components/provider-logo';
import { isProviderLogoId } from '../../components/provider-logo';

export function toManagedByProvider(provider: string | undefined): ProviderLogoId | undefined {
  const id = provider?.replace(/^(oauth_|saml_)/, '');
  return id && isProviderLogoId(id) ? id : undefined;
}
