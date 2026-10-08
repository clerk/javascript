import { withCardStateProvider } from '@/elements/contexts';

import { useTotpAddAuthenticatorController } from './totp-add-authenticator.controller';
import { TotpAddAuthenticatorView } from './totp-add-authenticator.view';
import { useTotpVerifyController } from './totp-code-flow.controller';
import { TotpSuccessView, TotpVerifyView } from './totp-code-flow.steps.view';
import type { TotpCreationModel, TotpVerificationModel } from './totp-code-flow.types';

type AddAuthenticatorAppProps = { model: TotpCreationModel; onSuccess: () => void; onReset: () => void };

export const AddAuthenticatorApp = withCardStateProvider((props: AddAuthenticatorAppProps) => {
  const controller = useTotpAddAuthenticatorController(props.model, props.onSuccess, props.onReset);
  return <TotpAddAuthenticatorView controller={controller} />;
});

type VerifyTOTPProps = {
  onSuccess: () => void;
  onReset: () => void;
  model: TotpVerificationModel;
};

export const TotpVerifyStep = withCardStateProvider((props: VerifyTOTPProps) => {
  const controller = useTotpVerifyController(props.model, props.onSuccess, props.onReset);
  return <TotpVerifyView controller={controller} />;
});

export const TotpSuccessScreen = withCardStateProvider((props: { backupCodes?: string[]; onFinish: () => void }) => (
  <TotpSuccessView
    backupCodes={props.backupCodes}
    onFinish={props.onFinish}
  />
));
