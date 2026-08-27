import * as stylex from '@stylexjs/stylex';

import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { mergeStyleProps } from '../props';
import { space } from '../tokens.stylex';
import { styles } from './user-profile-security-panel.styles';

export type UserProfileSecurityIconName = 'authenticator' | 'backup-codes' | 'desktop' | 'mobile' | 'passkey' | 'sms';

const icons = {
  authenticator: 'security-lock-square',
  'backup-codes': 'security-phone',
  desktop: 'device-laptop',
  mobile: 'device-phone',
  passkey: 'security-passkey',
  sms: 'security-phone',
} as const;

export function UserProfileSecurityIcon({ name }: { name: UserProfileSecurityIconName }) {
  return (
    <Section.Media
      size='lg'
      {...mergeStyleProps(stylex.props(styles.media), { style: { height: space['9'], width: space['9'] } })}
    >
      <Icon
        aria-hidden
        name={icons[name]}
        size='lg'
        {...stylex.props(styles.icon)}
      />
    </Section.Media>
  );
}
