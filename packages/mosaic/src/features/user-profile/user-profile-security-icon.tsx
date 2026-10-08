import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
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
      xstyle={styles.media}
    >
      <Icon
        name={icons[name]}
        size='lg'
        xstyle={styles.icon}
      />
    </Section.Media>
  );
}
