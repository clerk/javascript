import * as stylex from '@stylexjs/stylex';

import { styles } from './auth.styles';

const MONOCHROME_MARKS = new Set(['agentid', 'apple', 'github', 'okta', 'okx_wallet', 'vercel', 'x']);

interface AuthProviderIconProps {
  id: string;
  iconUrl: string;
}

export function AuthProviderIcon({ id, iconUrl }: AuthProviderIconProps) {
  if (MONOCHROME_MARKS.has(id.replace(/^(oauth_|saml_|web3_)/, ''))) {
    return (
      <span
        aria-hidden
        {...stylex.props(styles.providerIcon, styles.providerMark, styles.providerMarkImage(`url("${iconUrl}")`))}
      />
    );
  }
  return (
    <img
      src={iconUrl}
      alt=''
      {...stylex.props(styles.providerIcon)}
    />
  );
}
