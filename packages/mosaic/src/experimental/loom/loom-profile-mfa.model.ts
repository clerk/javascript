import { useProfileSnapshot } from '@clerk/loom/handoff';

import { projectMfa } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.project';
import type { UserProfileMfaModel } from '../../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.types';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;
export type LoomMfaState = { methods: ReadyModel['methods']; addableMethods: ReadyModel['addableMethods'] };

export function useLoomProfileMfaModel(): LoomMfaState | null {
  const { user, settings } = useProfileSnapshot();
  const secondFactors = settings.secondFactors ?? [];
  if (!secondFactors.includes('phone_code') && !secondFactors.includes('totp')) {
    return null;
  }
  if (
    !user.phoneNumbers ||
    user.totpEnabled === null ||
    user.totpEnabled === undefined ||
    user.backupCodeEnabled === null ||
    user.backupCodeEnabled === undefined
  ) {
    throw new Error('Loom MFA data is unavailable.');
  }
  const projection = projectMfa(
    { phoneNumbers: user.phoneNumbers, totpEnabled: user.totpEnabled, backupCodeEnabled: user.backupCodeEnabled },
    { secondFactors, required: settings.mfaRequired ?? false },
  );
  return { methods: projection.methods, addableMethods: projection.addableMethods };
}
