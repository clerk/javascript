import { withCardStateProvider } from '@/ui/elements/contexts';

import { useAddAuthenticatorAppController } from './add-authenticator-app.controller';
import type { AddAuthenticatorAppProps } from './add-authenticator-app.model';
import { useAddAuthenticatorAppModel } from './add-authenticator-app.model';
import { AddAuthenticatorAppView } from './add-authenticator-app.view';
import type { TotpSetupModel, TotpSetupOptions } from './mfa-totp.types';

export const AddAuthenticatorApp = (
  props: AddAuthenticatorAppProps | (TotpSetupOptions & { model: TotpSetupModel }),
) => {
  if ('model' in props) {
    return (
      <AddAuthenticatorAppContent
        key={props.model.requestKey}
        {...props}
      />
    );
  }
  return <LegacyAddAuthenticatorApp {...props} />;
};

const LegacyAddAuthenticatorApp = (props: AddAuthenticatorAppProps) => {
  const model = useAddAuthenticatorAppModel(props);
  return (
    <AddAuthenticatorAppContent
      key={model.requestKey}
      model={model}
      title={props.title}
      onSuccess={props.onSuccess}
      onReset={props.onReset}
    />
  );
};

const AddAuthenticatorAppContent = withCardStateProvider(
  ({ model, ...props }: TotpSetupOptions & { model: TotpSetupModel }) => {
    const controller = useAddAuthenticatorAppController(model, props);

    return <AddAuthenticatorAppView controller={controller} />;
  },
);
