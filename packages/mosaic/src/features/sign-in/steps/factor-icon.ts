import type { IconComponent } from '../../../icons/glyph';
import { Envelope } from '../../../icons/glyphs/envelope';
import { Key } from '../../../icons/glyphs/key';
import { Link } from '../../../icons/glyphs/link';
import { SecurityLockSquare } from '../../../icons/glyphs/security-lock-square';
import { SecurityPasskey } from '../../../icons/glyphs/security-passkey';
import { SecurityPhone } from '../../../icons/glyphs/security-phone';
import type { SignInFactor } from '../sign-in.types';

export const factorIcon = {
  password: SecurityLockSquare,
  passkey: SecurityPasskey,
  email_code: Envelope,
  email_link: Link,
  phone_code: SecurityPhone,
  totp: SecurityLockSquare,
  backup_code: Key,
  reset_password_email_code: Envelope,
  reset_password_phone_code: SecurityPhone,
} as const satisfies Record<SignInFactor['strategy'], IconComponent>;
