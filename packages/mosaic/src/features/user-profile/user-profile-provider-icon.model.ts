import type { ProviderLogoGlyph } from '../../components/provider-logo';
import type { UserProfileProviderIconProps } from './user-profile-provider-icon';

export function toProviderIcon({
  logo,
  iconUrl,
  label,
}: {
  logo?: ProviderLogoGlyph;
  iconUrl?: string | null;
  label: string;
}): UserProfileProviderIconProps {
  if (logo) {
    return { logo };
  }
  const url = iconUrl?.trim();
  if (url) {
    return { iconUrl: url };
  }
  return { initial: label.trim().charAt(0).toUpperCase() };
}
