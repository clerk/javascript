import { withCoreUserGuard } from '@/ui/contexts';
import { Flow } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Route, Switch } from '@/ui/router';

import { useOAuthDeviceVerificationController } from './oauth-device-verification.controller';
import { useOAuthDeviceVerificationModel } from './oauth-device-verification.model';
import { OAuthDeviceVerificationView } from './oauth-device-verification.view';

function OAuthDeviceVerificationInternal() {
  const model = useOAuthDeviceVerificationModel();
  const controller = useOAuthDeviceVerificationController(model);
  return <OAuthDeviceVerificationView controller={controller} />;
}

const AuthenticatedRoutes = withCoreUserGuard(withCardStateProvider(OAuthDeviceVerificationInternal));

export const OAuthDeviceVerification = () => (
  <Flow.Root flow='oauthDeviceVerification'>
    <Flow.Part>
      <Switch>
        <Route>
          <AuthenticatedRoutes />
        </Route>
      </Switch>
    </Flow.Part>
  </Flow.Root>
);
