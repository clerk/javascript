import { Icon, IconFrame } from '../../components/icon';
import { Section } from '../../components/section';
import { DeviceLaptop } from '../../icons/glyphs/device-laptop';
import { DevicePhone } from '../../icons/glyphs/device-phone';
import { SecurityLockSquare } from '../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../icons/glyphs/security-phone';
import { styles } from './user-profile-security-panel.styles';

export type UserProfileSecurityIconName = 'authenticator' | 'backup-codes' | 'desktop' | 'mobile' | 'passkey' | 'sms';

const icons = {
  authenticator: SecurityLockSquare,
  'backup-codes': SecurityPhone,
  desktop: DeviceLaptop,
  mobile: DevicePhone,
  passkey: SecurityPasskey,
  sms: SecurityPhone,
} as const;

export function UserProfileSecurityIcon({ name }: { name: UserProfileSecurityIconName }) {
  return (
    <Section.Media size='lg'>
      <IconFrame
        filled
        bordered={false}
      >
        <Icon
          glyph={icons[name]}
          size='lg'
          xstyle={styles.icon}
        />
      </IconFrame>
    </Section.Media>
  );
}
