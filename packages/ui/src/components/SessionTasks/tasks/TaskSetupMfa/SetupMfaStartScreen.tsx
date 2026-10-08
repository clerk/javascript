import type { VerificationStrategy } from '@clerk/shared/types';

import { withCardStateProvider } from '@/elements/contexts';

import { useSetupMfaStartScreenController } from './setup-mfa-start-screen.controller';
import { useSetupMfaStartScreenModel } from './setup-mfa-start-screen.model';
import { SetupMfaStartScreenView } from './setup-mfa-start-screen.view';

type SetupMfaStartScreenProps = {
  availableMethods: VerificationStrategy[];
  goToStep: (step: number) => void;
};

export const SetupMfaStartScreen = withCardStateProvider((props: SetupMfaStartScreenProps) => {
  const model = useSetupMfaStartScreenModel(props.availableMethods);
  const controller = useSetupMfaStartScreenController(props.goToStep);
  return (
    <SetupMfaStartScreenView
      {...model}
      {...controller}
    />
  );
});
