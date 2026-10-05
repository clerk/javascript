import type { ProviderLogoId } from '../../components/provider-logo';
import { isProviderLogoId } from '../../components/provider-logo';
import type { UserProfileProviderIconProps } from './user-profile-provider-icon';

function stripProviderPrefix(provider: string): string {
  return provider.replace(/^(oauth_|saml_|oidc_)/, '');
}

export function toProviderLogoId(provider: string | undefined): ProviderLogoId | undefined {
  const id = provider && stripProviderPrefix(provider);
  return id && isProviderLogoId(id) ? id : undefined;
}

export function toProviderIcon({
  provider,
  iconUrl,
  label,
}: {
  provider?: string;
  iconUrl?: string | null;
  label: string;
}): UserProfileProviderIconProps {
  const logo = toProviderLogoId(provider);
  if (logo) {
    return { logo };
  }
  const url = iconUrl?.trim();
  if (url) {
    return { iconUrl: url };
  }
  return { initial: label.trim().charAt(0).toUpperCase() };
}
