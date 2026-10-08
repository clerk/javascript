import { useActionContext } from '@/elements/Action/ActionRoot';
import { withCardStateProvider } from '@/elements/contexts';

import {
  useOidcIdentityProviderController,
  useSamlIdentityProviderController,
} from './identity-provider-section.controller';
import {
  useIdentityProviderSectionModel,
  useOidcIdentityProviderModel,
  useSamlIdentityProviderModel,
} from './identity-provider-section.model';
import type { FormScreenProps, IdentityProviderSectionProps } from './identity-provider-section.types';
import {
  IdentityProviderSectionView,
  OidcIdentityProviderView,
  SamlIdentityProviderView,
} from './identity-provider-section.view';

export const IdentityProviderSection = (props: IdentityProviderSectionProps): JSX.Element => {
  const model = useIdentityProviderSectionModel(props);
  return (
    <IdentityProviderSectionView
      details={model.details}
      form={
        <IdentityProviderScreen
          {...props}
          isOidc={model.isOidc}
        />
      }
    />
  );
};

const IdentityProviderScreen = ({
  isOidc,
  ...props
}: IdentityProviderSectionProps & { isOidc: boolean }): JSX.Element => {
  const { close } = useActionContext();
  return isOidc ? (
    <OidcForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  ) : (
    <SamlForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  );
};

const SamlForm = withCardStateProvider((props: FormScreenProps): JSX.Element => {
  const model = useSamlIdentityProviderModel(props);
  const controller = useSamlIdentityProviderController(model, props);
  return <SamlIdentityProviderView {...controller} />;
});

const OidcForm = withCardStateProvider((props: FormScreenProps): JSX.Element => {
  const model = useOidcIdentityProviderModel(props);
  const controller = useOidcIdentityProviderController(model, props);
  return <OidcIdentityProviderView {...controller} />;
});
