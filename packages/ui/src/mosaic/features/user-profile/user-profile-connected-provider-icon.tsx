import * as stylex from '@stylexjs/stylex';

import { styles } from './user-profile-connected-accounts.styles';

export function UserProfileConnectedProviderIcon({ provider, iconUrl }: { provider: string; iconUrl?: string }) {
  return iconUrl?.trim() ? (
    <img
      src={iconUrl.trim()}
      alt={provider}
      {...stylex.props(styles.icon)}
    />
  ) : (
    <span
      aria-hidden
      {...stylex.props(styles.fallback)}
    >
      {provider.trim().charAt(0).toUpperCase()}
    </span>
  );
}
