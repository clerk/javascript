import { useUser } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/shared/types';

import { useEnvironment } from '@/ui/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

export type MfaFormProps = FormProps & {
  selectedStrategy?: VerificationStrategy;
};

export const useMfaFormModel = () => {
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { user } = useUser();

  if (!user) {
    return { status: 'unavailable' as const };
  }
  return {
    status: 'ready' as const,
    userId: user.id,
    methods: getSecondFactorsAvailableToAdd(attributes, user),
  };
};
