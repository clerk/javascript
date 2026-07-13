import { useUser } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { getSecondFactors } from '@/ui/utils/mfa';

import { useEnvironment, useUserProfileContext } from '../../contexts';
import { MfaSection } from './MfaSection';
import { PasskeySection } from './PasskeySection';
import { PasswordSection } from './PasswordSection';
import { DeleteSection } from './DeleteSection';

export function SecurityPassword(): ReactNode {
  const { instanceIsPasswordBased } = useEnvironment().userSettings;

  if (!instanceIsPasswordBased) return null;

  return <PasswordSection />;
}

export function SecurityPasskeys(): ReactNode {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.passkey?.enabled || !shouldAllowIdentificationCreation) return null;

  return <PasskeySection />;
}

export function SecurityMfa(): ReactNode {
  const { attributes } = useEnvironment().userSettings;

  if (getSecondFactors(attributes).length === 0) return null;

  return <MfaSection />;
}

export function SecurityDelete(): ReactNode {
  const { user } = useUser();

  if (!user?.deleteSelfEnabled) return null;

  return <DeleteSection />;
}
