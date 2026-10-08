import { useOidcCustomConfigureStepsController } from './oidc-custom-configure-steps.controller';
import { useOidcCustomConfigureStepsModel } from './oidc-custom-configure-steps.model';
import { OidcCustomConfigureStepsView } from './oidc-custom-configure-steps.view';

export const OidcCustomConfigureSteps = (): JSX.Element => {
  const initialMode = useOidcCustomConfigureStepsModel();
  const controller = useOidcCustomConfigureStepsController(initialMode);
  return <OidcCustomConfigureStepsView {...controller} />;
};
